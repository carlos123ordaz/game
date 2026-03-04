import { Button } from '../../common/Button';
import type { PuzzleResults as PuzzleResultsType } from '../../../types/games/puzzle';

interface PuzzleResultsProps {
    results: PuzzleResultsType | null;
    playerId: string;
    onPlayAgain: () => void;
}

function formatTime(ms: number | null): string {
    if (ms === null) return '—';
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

const DIFFICULTY_LABELS: Record<string, string> = {
    easy: 'Fácil (3×3)',
    medium: 'Medio (4×4)',
    hard: 'Difícil (5×5)',
};

export function PuzzleResults({ results, playerId, onPlayAgain }: PuzzleResultsProps) {
    if (!results) {
        return (
            <div className="puzzle-results puzzle-results--loading">
                <div className="puzzle-results__spinner" />
                <p>Calculando resultados...</p>
            </div>
        );
    }

    const isWinner = results.winner && results.players.find(p => p.id === playerId)?.name === results.winner.name;
    const isTie = results.players.length === 2 &&
        results.players[0].progress === results.players[1].progress &&
        results.players[0].completed === results.players[1].completed;

    return (
        <div className="puzzle-results">
            {/* Header */}
            <div className={`puzzle-results__header ${isWinner ? 'puzzle-results__header--win' : isTie ? 'puzzle-results__header--tie' : 'puzzle-results__header--lose'}`}>
                <div className="puzzle-results__trophy">
                    {isTie ? '🤝' : isWinner ? '🏆' : '💪'}
                </div>
                <h2 className="puzzle-results__title">
                    {isTie
                        ? '¡Empate!'
                        : isWinner
                            ? '¡Ganaste!'
                            : `¡${results.winner?.name} gana!`}
                </h2>
                <p className="puzzle-results__subtitle">
                    {results.imageName} — {DIFFICULTY_LABELS[results.difficulty] || results.difficulty}
                </p>
            </div>

            {/* Player comparison */}
            <div className="puzzle-results__comparison">
                {results.players.map((player, _) => {
                    const isMe = player.id === playerId;
                    const isPlayerWinner = results.winner?.name === player.name;

                    return (
                        <div
                            key={player.id}
                            className={`puzzle-results__player-card ${isPlayerWinner ? 'puzzle-results__player-card--winner' : ''
                                } ${isMe ? 'puzzle-results__player-card--me' : ''}`}
                        >
                            {isPlayerWinner && <div className="puzzle-results__crown">👑</div>}
                            <h3 className="puzzle-results__player-name">
                                {player.name} {isMe && '(tú)'}
                            </h3>

                            <div className="puzzle-results__stats">
                                <div className="puzzle-results__stat">
                                    <span className="puzzle-results__stat-value">
                                        {player.completed ? '✅' : `${player.progress}%`}
                                    </span>
                                    <span className="puzzle-results__stat-label">
                                        {player.completed ? 'Completado' : 'Progreso'}
                                    </span>
                                </div>

                                <div className="puzzle-results__stat">
                                    <span className="puzzle-results__stat-value">
                                        {formatTime(player.completionTime)}
                                    </span>
                                    <span className="puzzle-results__stat-label">Tiempo</span>
                                </div>

                                <div className="puzzle-results__stat">
                                    <span className="puzzle-results__stat-value">{player.moves}</span>
                                    <span className="puzzle-results__stat-label">Movimientos</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="puzzle-results__progress-bar">
                                <div
                                    className={`puzzle-results__progress-fill ${isPlayerWinner ? 'puzzle-results__progress-fill--winner' : ''
                                        }`}
                                    style={{ width: `${player.progress}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="puzzle-results__actions">
                <Button variant="primary" onClick={onPlayAgain}>
                    🔄 Jugar de nuevo
                </Button>
            </div>
        </div>
    );
}