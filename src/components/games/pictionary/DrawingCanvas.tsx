import { useRef, useEffect, useCallback, useState } from 'react';
import type { Stroke } from '../../../types/games/pictionary';

interface Props {
    strokes: Stroke[];
    isDrawing: boolean;
    onSendStroke: (stroke: Stroke) => void;
    onClearCanvas: () => void;
    onUndo: () => void;
}

const COLORS = ['#1a1a2e', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const SIZES = [3, 6, 10, 16];
const ERASER_SIZE = 24;

export function DrawingCanvas({ strokes, isDrawing, onSendStroke, onClearCanvas, onUndo }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
    const isDrawingRef = useRef(false);

    const [color, setColor] = useState(COLORS[0]);
    const [size, setSize] = useState(SIZES[1]);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // Resize canvas to fill container
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        redrawAll(strokes);
    }, [strokes]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    // Redraw when strokes change (from server)
    useEffect(() => {
        redrawAll(strokes);
    }, [strokes]);

    function redrawAll(strokeList: Stroke[]) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();

        ctx.clearRect(0, 0, rect.width, rect.height);

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);

        strokeList.forEach((stroke) => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = stroke.tool === 'eraser' ? '#ffffff' : stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Scale points relative to canvas size
            const points = stroke.points.map(p => ({
                x: p.x * rect.width,
                y: p.y * rect.height,
            }));

            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                const mid = {
                    x: (points[i - 1].x + points[i].x) / 2,
                    y: (points[i - 1].y + points[i].y) / 2,
                };
                ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, mid.x, mid.y);
            }
            ctx.stroke();
        });
    }

    function getPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        let clientX: number, clientY: number;
        if ('touches' in e) {
            if (e.touches.length === 0) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        // Normalize to 0-1 range for resolution independence
        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height,
        };
    }

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        isDrawingRef.current = true;
        const pos = getPos(e);
        if (pos) currentStrokeRef.current = [pos];
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !isDrawingRef.current) return;
        e.preventDefault();
        const pos = getPos(e);
        if (!pos) return;

        currentStrokeRef.current.push(pos);

        // Live preview
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        const points = currentStrokeRef.current;

        if (points.length < 2) return;
        const p1 = points[points.length - 2];
        const p2 = points[points.length - 1];

        ctx.beginPath();
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? ERASER_SIZE : size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(p1.x * rect.width, p1.y * rect.height);
        ctx.lineTo(p2.x * rect.width, p2.y * rect.height);
        ctx.stroke();
    };

    const handleEnd = () => {
        if (!isDrawing || !isDrawingRef.current) return;
        isDrawingRef.current = false;

        if (currentStrokeRef.current.length > 1) {
            const stroke: Stroke = {
                points: currentStrokeRef.current,
                color,
                width: tool === 'eraser' ? ERASER_SIZE : size,
                tool,
            };
            onSendStroke(stroke);
        }
        currentStrokeRef.current = [];
    };

    return (
        <div className="canvas-wrapper">
            {/* Toolbar (only for drawer) */}
            {isDrawing && (
                <div className="canvas-toolbar">
                    <div className="canvas-toolbar__section">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                className={`canvas-color ${color === c && tool === 'pen' ? 'canvas-color--active' : ''}`}
                                style={{ backgroundColor: c, border: c === '#ffffff' ? '2px solid #ccc' : 'none' }}
                                onClick={() => { setColor(c); setTool('pen'); }}
                            />
                        ))}
                    </div>

                    <div className="canvas-toolbar__divider" />

                    <div className="canvas-toolbar__section">
                        {SIZES.map((s) => (
                            <button
                                key={s}
                                className={`canvas-size ${size === s && tool === 'pen' ? 'canvas-size--active' : ''}`}
                                onClick={() => { setSize(s); setTool('pen'); }}
                            >
                                <span className="canvas-size__dot" style={{ width: s, height: s }} />
                            </button>
                        ))}
                    </div>

                    <div className="canvas-toolbar__divider" />

                    <div className="canvas-toolbar__section">
                        <button
                            className={`canvas-tool-btn ${tool === 'eraser' ? 'canvas-tool-btn--active' : ''}`}
                            onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
                            title="Borrador"
                        >
                            🧹
                        </button>
                        <button className="canvas-tool-btn" onClick={onUndo} title="Deshacer">
                            ↩️
                        </button>
                        <button className="canvas-tool-btn canvas-tool-btn--danger" onClick={onClearCanvas} title="Borrar todo">
                            🗑️
                        </button>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <div className="canvas-container" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    className={`canvas ${isDrawing ? 'canvas--drawing' : ''}`}
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />
                {!isDrawing && (
                    <div className="canvas__overlay-label">Observando...</div>
                )}
            </div>
        </div>
    );
}