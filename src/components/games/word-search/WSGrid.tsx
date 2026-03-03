import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { GridCell, WordPlacement, HintData } from '../../../types/games/word-search';

interface WSGridProps {
    grid: string[][];
    gridSize: number;
    foundWords: Map<string, { playerId: string; playerName: string; cells: GridCell[] }>;
    placements?: WordPlacement[];
    playerId: string;
    selecting: boolean;
    selectedCells: GridCell[];
    hint: HintData | null;
    onSelectionStart: (cell: GridCell) => void;
    onSelectionMove: (cell: GridCell) => void;
    onSelectionEnd: () => void;
}

export function WSGrid({
    grid,
    gridSize,
    foundWords,
    placements = [],
    playerId,
    selecting,
    selectedCells,
    hint,
    onSelectionStart,
    onSelectionMove,
    onSelectionEnd,
}: WSGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    // Build a map of cell -> found word info for quick lookup
    const cellStateMap = useMemo(() => {
        const map = new Map<string, { word: string; isMine: boolean; playerName: string }>();
        for (const [word, info] of foundWords.entries()) {
            const placement = placements.length > 0
                ? placements.find(p => p.word === word)
                : null;
            if (placement) {
                for (const cell of placement.cells) {
                    const key = `${cell.row}-${cell.col}`;
                    map.set(key, { word, isMine: info.playerId === playerId, playerName: info.playerName });
                }
            }
            // Also check info.cells if available
            if (info.cells) {
                for (const cell of info.cells) {
                    const key = `${cell.row}-${cell.col}`;
                    if (!map.has(key)) {
                        map.set(key, { word, isMine: info.playerId === playerId, playerName: info.playerName });
                    }
                }
            }
        }
        return map;
    }, [foundWords, placements, playerId]);

    // Selected cells set for quick lookup
    const selectedSet = useMemo(() => {
        const set = new Set<string>();
        for (const c of selectedCells) set.add(`${c.row}-${c.col}`);
        return set;
    }, [selectedCells]);

    // Hint cell
    const hintKey = hint ? `${hint.firstCell.row}-${hint.firstCell.col}` : null;

    const getCellFromEvent = useCallback((e: React.TouchEvent | React.MouseEvent): GridCell | null => {
        const grid = gridRef.current;
        if (!grid) return null;

        let clientX: number, clientY: number;
        if ('touches' in e) {
            if (e.touches.length === 0) return null;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = grid.getBoundingClientRect();
        const cellW = rect.width / gridSize;
        const cellH = rect.height / gridSize;
        const col = Math.floor((clientX - rect.left) / cellW);
        const row = Math.floor((clientY - rect.top) / cellH);

        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return null;
        return { row, col };
    }, [gridSize]);

    const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const cell = getCellFromEvent(e);
        if (cell) {
            isDragging.current = true;
            onSelectionStart(cell);
        }
    }, [getCellFromEvent, onSelectionStart]);

    const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const cell = getCellFromEvent(e);
        if (cell) onSelectionMove(cell);
    }, [getCellFromEvent, onSelectionMove]);

    const handlePointerUp = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        isDragging.current = false;
        onSelectionEnd();
    }, [onSelectionEnd]);

    // Global mouse up handler
    useEffect(() => {
        const handleGlobalUp = () => {
            if (isDragging.current) {
                isDragging.current = false;
                onSelectionEnd();
            }
        };
        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [onSelectionEnd]);

    return (
        <div
            ref={gridRef}
            className="ws-grid"
            style={{ '--grid-size': gridSize } as React.CSSProperties}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
        >
            {grid.map((row, r) =>
                row.map((letter, c) => {
                    const key = `${r}-${c}`;
                    const found = cellStateMap.get(key);
                    const isSelected = selectedSet.has(key);
                    const isHint = key === hintKey;

                    let className = 'ws-grid__cell';
                    if (found) className += found.isMine ? ' ws-grid__cell--found-mine' : ' ws-grid__cell--found-other';
                    if (isSelected) className += ' ws-grid__cell--selected';
                    if (isHint && !found) className += ' ws-grid__cell--hint';

                    return (
                        <div key={key} className={className} data-row={r} data-col={c}>
                            <span className="ws-grid__letter">{letter}</span>
                        </div>
                    );
                })
            )}
        </div>
    );
}