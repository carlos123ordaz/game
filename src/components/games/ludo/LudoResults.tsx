/* File: src/components/games/ludo/LudoResults.tsx */
import { Button } from '../../common/Button';
import type { LudoGameState, LudoColor } from '../../../types/games/ludo';
import { COLOR_MAP } from '../../../types/games/ludo';

interface Props {
    game: LudoGameState;
    playerId: string;
    onPlayAgain: () => void;
}

export function LudoResults({ game, playerId, onPlayAgain }: Props) {
    const rankings = game.rankings || [];
    const winnerColor = rankings[0];
    const winnerPlayer = game.players.find(p => p.color === winnerColor);

    return (
        <div className="ludo-results">
            <div className="ludo-results__header">
                <h2 className="ludo-results__title">Juego terminado!</h2>
            </div>

            {winnerPlayer && (
                <div className="ludo-results__winner">
                    <span className="ludo-results__winner-emoji">{'\u{1F3C6}'}</span>
                    <span className="ludo-results__winner-name" style={{ color: COLOR_MAP[winnerColor].hex }}>
                        {winnerPlayer.name} gana!
                    </span>
                </div>
            )}

            <div className="ludo-results__rankings">
                <h3>Posiciones finales</h3>
                <ol className="ludo-results__rank-list">
                    {rankings.map((color, i) => {
                        const player = game.players.find(p => p.color === color);
                        if (!player) return null;
                        const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '4.'];
                        return (
                            <li key={color} className={`ludo-results__rank-item ${player.id === playerId ? 'ludo-results__rank-item--me' : ''}`}>
                                <span className="ludo-results__rank-medal">{medals[i] || `${i + 1}.`}</span>
                                <span className="ludo-results__rank-dot" style={{ background: COLOR_MAP[color].hex }}></span>
                                <span className="ludo-results__rank-name">{player.name}</span>
                                <span className="ludo-results__rank-color">{COLOR_MAP[color].label}</span>
                            </li>
                        );
                    })}
                    {/* Players who didn't finish */}
                    {game.players.filter(p => !rankings.includes(p.color)).map(p => (
                        <li key={p.color} className="ludo-results__rank-item ludo-results__rank-item--dnf">
                            <span className="ludo-results__rank-medal">-</span>
                            <span className="ludo-results__rank-dot" style={{ background: COLOR_MAP[p.color].hex }}></span>
                            <span className="ludo-results__rank-name">{p.name}</span>
                            <span className="ludo-results__rank-color">{p.disconnected ? 'Desconectado' : 'No termino'}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="ludo-results__actions">
                <Button variant="primary" onClick={onPlayAgain}>Jugar de nuevo</Button>
            </div>
        </div>
    );
}