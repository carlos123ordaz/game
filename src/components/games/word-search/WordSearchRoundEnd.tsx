import type { PlayerScore, WordPlacement } from '../../../types/games/word-search';

interface Props {
    roundIndex: number;
    maxRounds: number;
    placements: WordPlacement[];
    scores: PlayerScore[];
    playerId: string;
}

export function WSRoundEnd({ roundIndex, maxRounds, placements, scores, playerId }: Props) {
    const hasMore = roundIndex + 1 < maxRounds;
    return (
        <div className="ws-round-end">
            <div className="ws-round-end__header">
                <h2>Ronda {roundIndex + 1} terminada</h2>
                {hasMore && <p className="ws-round-end__next">Siguiente ronda en breve...</p>}
            </div>
            <div className="ws-round-end__scores">
                <h3>Posiciones</h3>
                <ol className="ws-round-end__ranking">
                    {scores.map((s, i) => (
                        <li key={s.playerId} className={`ws-round-end__rank-item ${s.playerId === playerId ? 'ws-round-end__rank-item--me' : ''}`}>
                            <span>{i + 1}.</span>
                            <span>{s.name}</span>
                            <span>{s.score} pts</span>
                            <span>{s.wordsFound} palabras</span>
                        </li>
                    ))}
                </ol>
            </div>
            <div className="ws-round-end__words">
                <h3>Palabras ({placements.length})</h3>
                <div className="ws-round-end__word-grid">
                    {placements.map(p => <span key={p.word} className="ws-round-end__word-chip">{p.word}</span>)}
                </div>
            </div>
        </div>
    );
}