import { useEffect } from 'react';
import { Button } from '../../common/Button';
import type { GameResults } from '../../../types/games/word-search';

interface Props {
    results: GameResults | null;
    playerLeftMessage: string | null;
    onRequestResults: () => void;
    onPlayAgain: () => void;
}

export function WordSearchResults({ results, playerLeftMessage, onRequestResults, onPlayAgain }: Props) {
    useEffect(() => {
        if (!results) onRequestResults();
    }, [results, onRequestResults]);

    if (!results) {
        return (
            <div className="ws-results">
                {playerLeftMessage && <p className="ws-results__left-msg">{playerLeftMessage}</p>}
                <div className="ws-results__loading">Cargando resultados...</div>
            </div>
        );
    }

    const winner = results.scores[0];
    const isTie = results.scores.length > 1 && results.scores[0].total === results.scores[1].total;

    return (
        <div className="ws-results">
            <div className="ws-results__header">
                <h2 className="ws-results__title">Resultados Finales</h2>
                {playerLeftMessage && <p className="ws-results__left-msg">{playerLeftMessage}</p>}
            </div>

            <div className="ws-results__podium">
                {results.scores.slice(0, 3).map((s, i) => (
                    <div key={s.playerId} className={`ws-results__podium-item ws-results__podium-item--${i + 1}`}>
                        <div className="ws-results__podium-medal">
                            {i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : '\u{1F949}'}
                        </div>
                        <div className="ws-results__podium-name">{s.name}</div>
                        <div className="ws-results__podium-score">{s.total} pts</div>
                        <div className="ws-results__podium-words">{s.wordsFound} palabras</div>
                    </div>
                ))}
            </div>

            {isTie && <p className="ws-results__tie">Empate!</p>}

            {!isTie && winner && (
                <p className="ws-results__winner">{winner.name} gana la partida!</p>
            )}

            <div className="ws-results__breakdown">
                <h3>Detalle por ronda</h3>
                {results.rounds.map((r, i) => (
                    <div key={i} className="ws-results__round-summary">
                        <span className="ws-results__round-cat">{r.category.emoji} {r.category.name}</span>
                        <span className="ws-results__round-stat">{r.foundWords}/{r.totalWords} encontradas</span>
                    </div>
                ))}
            </div>

            <div className="ws-results__full-table">
                <h3>Puntajes completos</h3>
                <table className="ws-results__table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Jugador</th>
                            <th>Palabras</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.scores.map((s, i) => (
                            <tr key={s.playerId}>
                                <td>{i + 1}</td>
                                <td>{s.name}</td>
                                <td>{s.wordsFound}</td>
                                <td>{s.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="ws-results__actions">
                <Button variant="primary" onClick={onPlayAgain}>Jugar de nuevo</Button>
            </div>
        </div>
    );
}