import { useEffect } from 'react';
import { Button } from '../../common/Button';
import type { MinesweeperResults } from '../../../types/games/minesweeper';

interface MinesweeperResultsViewProps {
    results: MinesweeperResults | null;
    onRequestResults: () => void;
    onPlayAgain: () => void;
}

const STATUS_LABELS = {
    cleared: { icon: '🏆', text: 'Completó' },
    playing: { icon: '⏱', text: 'En juego' },
    eliminated: { icon: '💀', text: 'Eliminado' },
};

export function MinesweeperResultsView({
    results,
    onRequestResults,
    onPlayAgain,
}: MinesweeperResultsViewProps) {
    useEffect(() => {
        if (!results) onRequestResults();
    }, [results, onRequestResults]);

    if (!results) {
        return (
            <div className="ms-results ms-results--loading">
                <div className="ms-results__spinner" />
                <p>Calculando resultados...</p>
            </div>
        );
    }

    const winner = results.players[0];
    const durationSecs = Math.round(results.duration / 1000);
    const minutes = Math.floor(durationSecs / 60);
    const seconds = durationSecs % 60;

    return (
        <div className="ms-results">
            <div className="ms-results__header">
                <div className="ms-results__trophy">🏆</div>
                <h2 className="ms-results__winner-name">{winner.name}</h2>
                <p className="ms-results__winner-score">{winner.score} puntos</p>
            </div>

            <div className="ms-results__meta">
                <div className="ms-results__meta-item">
                    <span className="ms-results__meta-label">Dificultad</span>
                    <span className="ms-results__meta-value">
                        {results.difficulty === 'easy' ? '🟢 Fácil' : results.difficulty === 'medium' ? '🟡 Medio' : '🔴 Difícil'}
                    </span>
                </div>
                <div className="ms-results__meta-item">
                    <span className="ms-results__meta-label">Tablero</span>
                    <span className="ms-results__meta-value">{results.boardSize}</span>
                </div>
                <div className="ms-results__meta-item">
                    <span className="ms-results__meta-label">Duración</span>
                    <span className="ms-results__meta-value">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </div>
                <div className="ms-results__meta-item">
                    <span className="ms-results__meta-label">Minas</span>
                    <span className="ms-results__meta-value">{results.totalMines}</span>
                </div>
            </div>

            <div className="ms-results__leaderboard">
                <h3 className="ms-results__lb-title">Tabla final</h3>
                {results.players.map((p, i) => {
                    const statusInfo = STATUS_LABELS[p.status];
                    return (
                        <div key={i} className={`ms-results__player ${i === 0 ? 'ms-results__player--winner' : ''}`}>
                            <div className="ms-results__player-rank">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                            </div>
                            <div className="ms-results__player-info">
                                <span className="ms-results__player-name">{p.name}</span>
                                <span className="ms-results__player-status">
                                    {statusInfo.icon} {statusInfo.text}
                                </span>
                            </div>
                            <div className="ms-results__player-stats">
                                <div className="ms-results__stat">
                                    <span className="ms-results__stat-value">{p.score}</span>
                                    <span className="ms-results__stat-label">Puntos</span>
                                </div>
                                <div className="ms-results__stat">
                                    <span className="ms-results__stat-value">{p.progress}%</span>
                                    <span className="ms-results__stat-label">Despejado</span>
                                </div>
                                <div className="ms-results__stat">
                                    <span className="ms-results__stat-value">{p.cellsRevealed}</span>
                                    <span className="ms-results__stat-label">Celdas</span>
                                </div>
                                <div className="ms-results__stat">
                                    <span className="ms-results__stat-value">{p.correctFlags}</span>
                                    <span className="ms-results__stat-label">Banderas</span>
                                </div>
                                <div className="ms-results__stat">
                                    <span className="ms-results__stat-value">{p.minesHit}</span>
                                    <span className="ms-results__stat-label">Minas</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="ms-results__actions">
                <Button variant="primary" onClick={onPlayAgain}>
                    Jugar de nuevo
                </Button>
            </div>
        </div>
    );
}