import { useCallback, useRef, useState } from 'react';
import type { PuzzleImage } from '../../../types/games/puzzle';

interface PuzzleBoardProps {
    pieces: number[];
    gridSize: number;
    image: PuzzleImage;
    onSwap: (fromIndex: number, toIndex: number) => void;
    disabled?: boolean;
}

/**
 * Generates a fallback gradient when image URL is not available.
 * Uses deterministic colors based on piece position.
 */
function getFallbackStyle(pieceId: number, gridSize: number): React.CSSProperties {
    const row = Math.floor(pieceId / gridSize);
    const col = pieceId % gridSize;
    const hue1 = (pieceId * 37) % 360;
    const hue2 = (hue1 + 40) % 360;
    const lightness = 45 + (row + col) * 3;

    return {
        background: `linear-gradient(${pieceId * 30}deg, hsl(${hue1}, 70%, ${lightness}%), hsl(${hue2}, 60%, ${lightness + 10}%))`,
    };
}

/**
 * PuzzleBoard — Pure CSS approach (no canvas, no CORS, no preloader)
 *
 * Each piece shows the full image as background with background-position
 * to display only the correct portion. Falls back to colored gradients
 * if no image URL is available.
 */
export function PuzzleBoard({ pieces, gridSize, image, onSwap, disabled }: PuzzleBoardProps) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ index: number; x: number; y: number } | null>(null);

    // Safely get image URL
    const imageUrl = image?.url || '';
    const hasImage = imageUrl.length > 0;

    /**
     * Get CSS styles for a puzzle piece.
     * Uses background-position to show the correct portion of the image.
     */
    function getPieceStyle(pieceId: number): React.CSSProperties {
        if (!hasImage) return getFallbackStyle(pieceId, gridSize);

        const row = Math.floor(pieceId / gridSize);
        const col = pieceId % gridSize;
        const bgPosX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0;
        const bgPosY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0;

        return {
            backgroundImage: `url("${imageUrl}")`,
            backgroundSize: `${gridSize * 100}%`,
            backgroundPosition: `${bgPosX}% ${bgPosY}%`,
            backgroundRepeat: 'no-repeat',
        };
    }

    // ── Drag & Drop (desktop) ──
    const handleDragStart = useCallback(
        (index: number) => (e: React.DragEvent) => {
            if (disabled) return;
            setDragIndex(index);
            e.dataTransfer.effectAllowed = 'move';
        },
        [disabled]
    );

    const handleDragOver = useCallback(
        (index: number) => (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setHoverIndex(index);
        },
        []
    );

    const handleDrop = useCallback(
        (toIndex: number) => (e: React.DragEvent) => {
            e.preventDefault();
            if (dragIndex !== null && dragIndex !== toIndex) {
                onSwap(dragIndex, toIndex);
            }
            setDragIndex(null);
            setHoverIndex(null);
        },
        [dragIndex, onSwap]
    );

    const handleDragEnd = useCallback(() => {
        setDragIndex(null);
        setHoverIndex(null);
    }, []);

    // ── Tap-to-select (mobile-friendly) ──
    const handleClick = useCallback(
        (index: number) => {
            if (disabled) return;
            if (selectedIndex === null) {
                setSelectedIndex(index);
            } else if (selectedIndex === index) {
                setSelectedIndex(null);
            } else {
                onSwap(selectedIndex, index);
                setSelectedIndex(null);
            }
        },
        [disabled, selectedIndex, onSwap]
    );

    // ── Touch drag (mobile) ──
    const handleTouchStart = useCallback(
        (index: number) => (e: React.TouchEvent) => {
            if (disabled) return;
            const touch = e.touches[0];
            touchStartRef.current = { index, x: touch.clientX, y: touch.clientY };
        },
        [disabled]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (!touchStartRef.current || !boardRef.current) return;
            const touch = e.changedTouches[0];
            const board = boardRef.current.getBoundingClientRect();
            const col = Math.floor((touch.clientX - board.left) / (board.width / gridSize));
            const row = Math.floor((touch.clientY - board.top) / (board.height / gridSize));

            if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
                const toIndex = row * gridSize + col;
                const fromIndex = touchStartRef.current.index;
                if (fromIndex !== toIndex) {
                    onSwap(fromIndex, toIndex);
                }
            }
            touchStartRef.current = null;
        },
        [gridSize, onSwap]
    );

    return (
        <div className="puzzle-board-wrapper">
            <div
                ref={boardRef}
                className="puzzle-board"
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    aspectRatio: '1',
                }}
            >
                {pieces.map((pieceId, slotIndex) => {
                    const isCorrect = pieceId === slotIndex;
                    const isDragging = dragIndex === slotIndex;
                    const isHovered = hoverIndex === slotIndex;
                    const isSelected = selectedIndex === slotIndex;

                    return (
                        <div
                            key={slotIndex}
                            className={[
                                'puzzle-piece',
                                isCorrect ? 'puzzle-piece--correct' : '',
                                isDragging ? 'puzzle-piece--dragging' : '',
                                isHovered ? 'puzzle-piece--hover' : '',
                                isSelected ? 'puzzle-piece--selected' : '',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                            style={getPieceStyle(pieceId)}
                            draggable={!disabled}
                            onDragStart={handleDragStart(slotIndex)}
                            onDragOver={handleDragOver(slotIndex)}
                            onDrop={handleDrop(slotIndex)}
                            onDragEnd={handleDragEnd}
                            onDragLeave={() => setHoverIndex(null)}
                            onClick={() => handleClick(slotIndex)}
                            onTouchStart={handleTouchStart(slotIndex)}
                            onTouchEnd={handleTouchEnd}
                        >
                            {isCorrect && (
                                <div className="puzzle-piece__check">✓</div>
                            )}
                            <div className="puzzle-piece__number">{pieceId + 1}</div>
                        </div>
                    );
                })}
            </div>

            {/* Preview toggle */}
            {hasImage && (
                <button
                    className="puzzle-board__preview-btn"
                    onMouseDown={() => setShowPreview(true)}
                    onMouseUp={() => setShowPreview(false)}
                    onMouseLeave={() => setShowPreview(false)}
                    onTouchStart={() => setShowPreview(true)}
                    onTouchEnd={() => setShowPreview(false)}
                >
                    👁️ Mantén para ver imagen completa
                </button>
            )}

            {showPreview && hasImage && (
                <div className="puzzle-board__preview-overlay">
                    <img src={imageUrl} alt="Imagen completa" className="puzzle-board__preview-img" />
                </div>
            )}
        </div>
    );
}