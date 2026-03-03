import type { GameOverData } from '../../../types/games/pixelAdventure';

const SPRITES = ['👾', '🤖', '👹', '🎃', '🐸', '🦊', '🐱', '🐼'];
const MEDALS = ['🥇', '🥈', '🥉'];

interface Props {
    data: GameOverData;
    onPlayAgain: () => void;
}

export function PAGameOver({ data, onPlayAgain }: Props) {
    const { finalScores, reason, winnerId } = data;
    const winner = finalScores.find(p => p.id === winnerId);

    return (
        <div className="pa-center">
            <div className="pixel-card pixel-card--wide">
                <div className="pixel-card__header">
                    <span className="pixel-title-icon">🏆</span>
                    <h2 className="pixel-title">
                        {reason === 'winner' ? '¡FIN DEL JUEGO!' : 'JUEGO CANCELADO'}
                    </h2>
                </div>

                {winner && (
                    <div className="gameover__winner">
                        <span className="gameover__winner-sprite">{SPRITES[winner.spriteIndex % SPRITES.length]}</span>
                        <span className="gameover__winner-name">{winner.name}</span>
                        <span className="gameover__winner-label">¡GANADOR!</span>
                    </div>
                )}

                {reason === 'not-enough-players' && (
                    <p className="pixel-subtitle">No hay suficientes jugadores para continuar</p>
                )}

                <div className="gameover__rankings">
                    {finalScores.map((p, i) => (
                        <div key={p.id} className={`gameover__rank ${i === 0 ? 'gameover__rank--first' : ''}`}>
                            <span className="gameover__rank-medal">{MEDALS[i] || `#${i + 1}`}</span>
                            <span className="gameover__rank-sprite">{SPRITES[p.spriteIndex % SPRITES.length]}</span>
                            <span className="gameover__rank-name">{p.name}</span>
                            <span className="gameover__rank-pos">Casilla {p.position}/49</span>
                        </div>
                    ))}
                </div>

                <button className="pixel-btn pixel-btn--primary pixel-btn--full" onClick={onPlayAgain}>
                    🔄 JUGAR DE NUEVO
                </button>
            </div>
        </div>
    );
}