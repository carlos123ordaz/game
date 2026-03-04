import { useCallback } from 'react';
import type { CellData } from '../../../types/games/minesweeper';

interface MinesweeperBoardProps {
    board: CellData[][];
    rows: number;
    cols: number;
    disabled: boolean;
    onReveal: (row: number, col: number) => void;
    onFlag: (row: number, col: number) => void;
}

const NUMBER_COLORS: Record<number, string> = {
    1: 'var(--ms-num-1)',
    2: 'var(--ms-num-2)',
    3: 'var(--ms-num-3)',
    4: 'var(--ms-num-4)',
    5: 'var(--ms-num-5)',
    6: 'var(--ms-num-6)',
    7: 'var(--ms-num-7)',
    8: 'var(--ms-num-8)',
};

export function MinesweeperBoard({
    board,
    rows,
    cols,
    disabled,
    onReveal,
    onFlag,
}: MinesweeperBoardProps) {

    const handleContextMenu = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (!disabled) onFlag(row, col);
    }, [disabled, onFlag]);

    const handleClick = useCallback((row: number, col: number) => {
        if (!disabled) onReveal(row, col);
    }, [disabled, onReveal]);

    // Dynamic cell size based on board dimensions
    const cellSize = cols > 16 ? 'ms-board--small' : cols > 9 ? 'ms-board--medium' : 'ms-board--large';

    return (
        <div className={`ms-board ${cellSize}`}>
            <div
                className="ms-board__grid"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
            >
                {board.map((row, r) =>
                    row.map((cell, c) => (
                        <button
                            key={`${r}-${c}`}
                            className={`ms-cell ms-cell--${cell.state} ${cell.state === 'revealed' && cell.value === 0 ? 'ms-cell--empty' : ''}`}
                            onClick={() => handleClick(r, c)}
                            onContextMenu={(e) => handleContextMenu(e, r, c)}
                            disabled={disabled || cell.state === 'revealed' || cell.state === 'mine'}
                            aria-label={`Celda ${r},${c}`}
                            style={cell.state === 'revealed' && cell.value > 0 ? { color: NUMBER_COLORS[cell.value] } : undefined}
                        >
                            {cell.state === 'revealed' && cell.value > 0 && (
                                <span className="ms-cell__number">{cell.value}</span>
                            )}
                            {cell.state === 'flagged' && (
                                <span className="ms-cell__flag">🚩</span>
                            )}
                            {cell.state === 'mine' && (
                                <span className="ms-cell__mine">💥</span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}