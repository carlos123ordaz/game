/* File: src/components/games/ludo/AnimatedToken.tsx */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { LudoColor, BoardCell } from '../../../types/games/ludo';
import { COLOR_MAP, getTokenCoords } from '../../../types/games/ludo';

interface Props {
    color: LudoColor;
    tokenIndex: number;
    relativePos: number;
    isSelectable: boolean;
    onClick: () => void;
    stackOffset?: { x: number; y: number };
    cellSize: number;
}

const TOKEN_RADIUS = 14;
const HOP_DURATION = 130; // ms per step
const HOP_HEIGHT = 18;

function cellToPixel(cell: BoardCell, cellSize: number) {
    return {
        x: cell.c * cellSize + cellSize / 2,
        y: cell.r * cellSize + cellSize / 2,
    };
}

function generateIntermediatePath(
    color: LudoColor,
    fromPos: number,
    toPos: number,
    tokenIndex: number,
    cellSize: number
): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];

    // From base to start (exit)
    if (fromPos === -1 && toPos >= 0) {
        cells.push(cellToPixel(getTokenCoords(color, -1, tokenIndex), cellSize));
        for (let i = 0; i <= toPos; i++) {
            cells.push(cellToPixel(getTokenCoords(color, i, tokenIndex), cellSize));
        }
        return cells;
    }

    // From base staying in base (shouldn't happen but safety)
    if (fromPos === -1 && toPos === -1) {
        cells.push(cellToPixel(getTokenCoords(color, -1, tokenIndex), cellSize));
        return cells;
    }

    // Normal move forward
    if (fromPos >= 0 && toPos > fromPos) {
        for (let i = fromPos; i <= toPos; i++) {
            cells.push(cellToPixel(getTokenCoords(color, i, tokenIndex), cellSize));
        }
        return cells;
    }

    // Token sent back to base (captured)
    if (toPos === -1) {
        cells.push(cellToPixel(getTokenCoords(color, fromPos, tokenIndex), cellSize));
        cells.push(cellToPixel(getTokenCoords(color, -1, tokenIndex), cellSize));
        return cells;
    }

    // Fallback: direct jump
    cells.push(cellToPixel(getTokenCoords(color, fromPos, tokenIndex), cellSize));
    cells.push(cellToPixel(getTokenCoords(color, toPos, tokenIndex), cellSize));
    return cells;
}

export function AnimatedToken({
    color, tokenIndex, relativePos, isSelectable, onClick, stackOffset, cellSize,
}: Props) {
    const targetPixel = cellToPixel(getTokenCoords(color, relativePos, tokenIndex), cellSize);
    const finalX = targetPixel.x + (stackOffset?.x || 0);
    const finalY = targetPixel.y + (stackOffset?.y || 0);

    const [displayX, setDisplayX] = useState(finalX);
    const [displayY, setDisplayY] = useState(finalY);
    const [arcOffset, setArcOffset] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

    const prevPos = useRef(relativePos);
    const animationRef = useRef<number | null>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    useEffect(() => {
        const oldPos = prevPos.current;
        prevPos.current = relativePos;

        if (oldPos === relativePos) {
            // Just update for stack offset changes
            setDisplayX(finalX);
            setDisplayY(finalY);
            return;
        }

        // Generate path
        const path = generateIntermediatePath(color, oldPos, relativePos, tokenIndex, cellSize);

        if (path.length <= 1) {
            setDisplayX(finalX);
            setDisplayY(finalY);
            return;
        }

        // Cancel any ongoing animation
        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        setIsAnimating(true);
        let stepIdx = 0;
        const trailPoints: { x: number; y: number; id: number }[] = [];

        const animateStep = () => {
            if (!isMounted.current) return;
            if (stepIdx >= path.length - 1) {
                setIsAnimating(false);
                setArcOffset(0);
                setTrail([]);
                // Snap to final with offset
                setDisplayX(finalX);
                setDisplayY(finalY);
                return;
            }

            const from = path[stepIdx];
            const to = path[stepIdx + 1];

            // Add trail
            trailPoints.push({ x: from.x, y: from.y, id: stepIdx });
            if (isMounted.current) {
                setTrail([...trailPoints].slice(-4));
            }

            const startTime = performance.now();

            const hop = (time: number) => {
                if (!isMounted.current) return;

                const elapsed = time - startTime;
                const t = Math.min(elapsed / HOP_DURATION, 1);
                const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

                const x = from.x + (to.x - from.x) * ease;
                const y = from.y + (to.y - from.y) * ease;
                const hopY = -HOP_HEIGHT * Math.sin(t * Math.PI);

                setDisplayX(x);
                setDisplayY(y);
                setArcOffset(hopY);

                if (t < 1) {
                    animationRef.current = requestAnimationFrame(hop);
                } else {
                    setDisplayX(to.x);
                    setDisplayY(to.y);
                    setArcOffset(0);
                    stepIdx++;
                    setTimeout(animateStep, 20);
                }
            };

            animationRef.current = requestAnimationFrame(hop);
        };

        animateStep();
    }, [relativePos, color, tokenIndex, cellSize, finalX, finalY]);

    const colorHex = COLOR_MAP[color].hex;

    return (
        <g
            className={isSelectable ? 'ludo-token--selectable' : ''}
            onClick={isSelectable ? onClick : undefined}
            style={{ cursor: isSelectable ? 'pointer' : 'default' }}
        >
            {/* Trail dots */}
            {trail.map((t, i) => (
                <circle key={`trail-${t.id}`} cx={t.x} cy={t.y} r={3.5}
                    fill={colorHex} opacity={0.12 + (i / trail.length) * 0.18}
                />
            ))}

            {/* Dynamic shadow */}
            <ellipse
                cx={displayX}
                cy={displayY + TOKEN_RADIUS + 2}
                rx={TOKEN_RADIUS * (1 + arcOffset / 80)}
                ry={3.5 * (1 + arcOffset / 60)}
                fill="rgba(0,0,0,0.25)"
            />

            {/* Glow while moving */}
            {isAnimating && (
                <circle cx={displayX} cy={displayY + arcOffset}
                    r={TOKEN_RADIUS + 5} fill={colorHex} opacity={0.2}
                />
            )}

            {/* Selectable pulse ring */}
            {isSelectable && (
                <circle cx={displayX} cy={displayY + arcOffset}
                    r={TOKEN_RADIUS + 4} fill="none" stroke="#fff" strokeWidth="2" opacity="0.8"
                >
                    <animate attributeName="r"
                        values={`${TOKEN_RADIUS + 2};${TOKEN_RADIUS + 6};${TOKEN_RADIUS + 2}`}
                        dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity"
                        values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                </circle>
            )}

            {/* Token body */}
            <circle
                cx={displayX}
                cy={displayY + arcOffset}
                r={TOKEN_RADIUS}
                fill={`url(#token-grad-${color})`}
                stroke={isSelectable ? '#fff' : colorHex}
                strokeWidth={isSelectable ? 3 : 2}
                filter="url(#tokenShadow)"
            />

            {/* Inner ring */}
            <circle
                cx={displayX}
                cy={displayY + arcOffset}
                r={TOKEN_RADIUS - 5}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth={1.5}
            />

            {/* Shine highlight */}
            <circle
                cx={displayX - 3}
                cy={displayY + arcOffset - 3}
                r={3}
                fill="rgba(255,255,255,0.45)"
            />
        </g>
    );
}