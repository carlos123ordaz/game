import type { CellData, PlayerStats } from '../../../types/games/minesweeper';
import { MinesweeperBoard } from './MinesweeperBoard';

interface MinesweeperGameProps {
    board: CellData[][];
    rows: number;
    cols: number;
    totalMines: number;
    flagCount: number;
    score: number;
    lives: number;
    playerStatus: 'playing' | 'eliminated' | 'cleared';
    formattedTime: string;
    timeRemaining: number;
    progress: number;
    allPlayerStats: PlayerStats[];
    playerId: string;
    onReveal: (row: number, col: number) => void;
    onFlag: (row: number, col: number) => void;
}

export function MinesweeperGame({
    board,
    rows,
    cols,
    totalMines,
    flagCount,
    score,
    lives,
    playerStatus,
    formattedTime,
    timeRemaining,
    progress,
    allPlayerStats,
    playerId,
    onReveal,
    onFlag,
}: MinesweeperGameProps) {
    const isDisabled = playerStatus !== 'playing';
    const isUrgent = timeRemaining < 60000; // < 1 min

    return (
        <div className="ms-game">
            {/* HUD Bar */}
            <div className="ms-game__hud">
                <div className="ms-game__hud-item">
                    <span className="ms-game__hud-icon">💣</span>
                    <span className="ms-game__hud-value">{totalMines - flagCount}</span>
                </div>
                <div className={`ms-game__hud-item ms-game__hud-timer ${isUrgent ? 'ms-game__hud-timer--urgent' : ''}`}>
                    <span className="ms-game__hud-icon">⏱</span>
                    <span className="ms-game__hud-value">{formattedTime}</span>
                </div>
                <div className="ms-game__hud-item">
                    <span className="ms-game__hud-icon">⭐</span>
                    <span className="ms-game__hud-value">{score}</span>
                </div>
                <div className="ms-game__hud-item">
                    <span className="ms-game__hud-lives">
                        {Array.from({ length: 3 }, (_, i) => (
                            <span key={i} className={i < lives ? 'ms-game__heart--alive' : 'ms-game__heart--dead'}>
                                {i < lives ? '❤️' : '🖤'}
                            </span>
                        ))}
                    </span>
                </div>
            </div>

            {/* Status overlay */}
            {playerStatus === 'eliminated' && (
                <div className="ms-game__overlay ms-game__overlay--eliminated">
                    <span className="ms-game__overlay-icon">💀</span>
                    <span className="ms-game__overlay-text">¡Eliminado!</span>
                    <span className="ms-game__overlay-sub">Esperando a que termine la partida...</span>
                </div>
            )}

            {playerStatus === 'cleared' && (
                <div className="ms-game__overlay ms-game__overlay--cleared">
                    <span className="ms-game__overlay-icon">🏆</span>
                    <span className="ms-game__overlay-text">¡Tablero limpio!</span>
                    <span className="ms-game__overlay-sub">+500 bonus · Esperando resultados...</span>
                </div>
            )}

            {/* Board */}
            <div className={`ms-game__board-wrapper ${isDisabled ? 'ms-game__board-wrapper--disabled' : ''}`}>
                <MinesweeperBoard
                    board={board}
                    rows={rows}
                    cols={cols}
                    disabled={isDisabled}
                    onReveal={onReveal}
                    onFlag={onFlag}
                />
            </div>

            {/* Progress bar */}
            <div className="ms-game__progress">
                <div className="ms-game__progress-track">
                    <div className="ms-game__progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="ms-game__progress-text">{progress}% despejado</span>
            </div>

            {/* Leaderboard sidebar */}
            <div className="ms-game__leaderboard">
                <div className="ms-game__lb-title">Jugadores</div>
                {[...allPlayerStats]
                    .sort((a, b) => b.score - a.score)
                    .map((p, i) => (
                        <div
                            key={p.id}
                            className={`ms-game__lb-player ${p.id === playerId ? 'ms-game__lb-player--you' : ''
                                } ${p.status === 'eliminated' ? 'ms-game__lb-player--dead' : ''} ${p.status === 'cleared' ? 'ms-game__lb-player--cleared' : ''
                                }`}
                        >
                            <span className="ms-game__lb-rank">#{i + 1}</span>
                            <span className="ms-game__lb-name">
                                {p.name}
                                {p.id === playerId && ' (tú)'}
                            </span>
                            <span className="ms-game__lb-score">{p.score}</span>
                            <div className="ms-game__lb-bar">
                                <div
                                    className="ms-game__lb-bar-fill"
                                    style={{ width: `${p.progress}%` }}
                                />
                            </div>
                            <span className="ms-game__lb-status">
                                {p.status === 'eliminated' ? '💀' : p.status === 'cleared' ? '🏆' : `❤️×${p.lives}`}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}