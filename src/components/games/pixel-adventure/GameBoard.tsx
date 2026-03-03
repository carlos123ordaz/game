import { useMemo } from 'react';
import type { BoardTile, GamePlayer } from '../../../types/games/pixelAdventure';

const SPRITES = ['👾', '🤖', '👹', '🎃', '🐸', '🦊', '🐱', '🐼'];
const TILE_COLORS: Record<string, string> = {
    normal: 'var(--tile-normal)',
    ladder: 'var(--tile-ladder)',
    snake: 'var(--tile-snake)',
    event: 'var(--tile-event)',
    item: 'var(--tile-item)',
    decision: 'var(--tile-decision)',
    trap: 'var(--tile-trap)',
    star: 'var(--tile-star)',
};

const COLS = 10;

interface Props {
    board: BoardTile[];
    players: GamePlayer[];
    currentPlayerId: string;
}

export function GameBoard({ board, players, currentPlayerId }: Props) {
    // Build serpentine grid layout (bottom-left to top, alternating direction)
    const grid = useMemo(() => {
        if (board.length === 0) return [];

        const rows = Math.ceil(board.length / COLS);
        const cells: (BoardTile | null)[][] = [];

        for (let row = 0; row < rows; row++) {
            const rowTiles: (BoardTile | null)[] = [];
            for (let col = 0; col < COLS; col++) {
                const isEvenRow = row % 2 === 0;
                const actualCol = isEvenRow ? col : (COLS - 1 - col);
                const idx = row * COLS + actualCol;
                rowTiles.push(board[idx] || null);
            }
            cells.push(rowTiles);
        }

        // Reverse so row 0 (tiles 0-9) is at bottom
        return cells.reverse();
    }, [board]);

    // Map players to tiles
    const playersByTile = useMemo(() => {
        const map = new Map<number, GamePlayer[]>();
        players.forEach(p => {
            if (!map.has(p.position)) map.set(p.position, []);
            map.get(p.position)!.push(p);
        });
        return map;
    }, [players]);

    if (board.length === 0) return null;

    return (
        <div className="board-wrapper">
            <div className="board">
                {grid.map((row, ri) => (
                    <div key={ri} className="board__row">
                        {row.map((tile, ci) => {
                            if (!tile) return <div key={ci} className="board__cell board__cell--empty" />;

                            const tilePlayers = playersByTile.get(tile.id) || [];
                            const isCurrentTurn = tilePlayers.some(p => p.id === currentPlayerId);

                            return (
                                <div
                                    key={tile.id}
                                    className={`board__cell board__cell--${tile.type} ${isCurrentTurn ? 'board__cell--active' : ''}`}
                                    style={{ '--tile-bg': TILE_COLORS[tile.type] } as React.CSSProperties}
                                >
                                    <span className="board__cell-num">{tile.id}</span>
                                    <span className="board__cell-icon">{tile.icon}</span>

                                    {tilePlayers.length > 0 && (
                                        <div className="board__cell-players">
                                            {tilePlayers.map(p => (
                                                <span
                                                    key={p.id}
                                                    className={`board__token ${p.id === currentPlayerId ? 'board__token--current' : ''}`}
                                                    title={p.name}
                                                >
                                                    {SPRITES[p.spriteIndex % SPRITES.length]}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="board__legend">
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-ladder)' }} /> Escalera</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-snake)' }} /> Serpiente</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-event)' }} /> Evento</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-item)' }} /> Item</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-decision)' }} /> Decisión</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-trap)' }} /> Trampa</span>
                <span className="board__legend-item"><span className="board__legend-dot" style={{ background: 'var(--tile-star)' }} /> Estrella</span>
            </div>
        </div>
    );
}