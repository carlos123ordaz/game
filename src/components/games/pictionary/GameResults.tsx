import type { GameEndData } from '../../../types/games/pictionary';

interface Props {
    data: GameEndData;
    onPlayAgain: () => void;
}

const medals = ['🥇', '🥈', '🥉'];

export function GameResults({ data, onPlayAgain }: Props) {
    const { finalScores, reason } = data;

    return (
        <div className="pic">
            <div className="pic__card pic__card--wide">
                <span className="pic__emoji">🏆</span>
                <h2 className="pic__title">
                    {reason === 'complete' ? '¡Juego terminado!' : 'Juego cancelado'}
                </h2>

                {reason === 'not-enough-players' && (
                    <p className="pic__subtitle">No hay suficientes jugadores para continuar</p>
                )}

                {/* Podium top 3 */}
                {finalScores.length >= 1 && (
                    <div className="results__podium">
                        {finalScores.slice(0, 3).map((player, i) => (
                            <div key={player.id} className={`results__podium-item results__podium-item--p${i + 1}`}>
                                <span className="results__podium-medal">{medals[i]}</span>
                                <span className="results__podium-name">{player.name}</span>
                                <span className="results__podium-score">{player.score} pts</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Full rankings */}
                {finalScores.length > 3 && (
                    <div className="results__full-list">
                        {finalScores.slice(3).map((player, i) => (
                            <div key={player.id} className="results__rank-row">
                                <span className="results__rank">#{i + 4}</span>
                                <span className="results__rank-name">{player.name}</span>
                                <span className="results__rank-score">{player.score} pts</span>
                            </div>
                        ))}
                    </div>
                )}

                <button className="pic__btn pic__btn--primary pic__btn--full" onClick={onPlayAgain}>
                    🔄 Jugar de nuevo
                </button>
            </div>
        </div>
    );
}