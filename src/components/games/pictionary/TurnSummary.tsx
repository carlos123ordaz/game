import type { TurnEndData } from '../../../types/games/pictionary';

interface Props {
    data: TurnEndData;
}

const reasonLabels: Record<string, string> = {
    'time-up': '⏰ ¡Se acabó el tiempo!',
    'all-guessed': '🎉 ¡Todos adivinaron!',
    'drawer-left': '😢 El dibujante se desconectó',
};

export function TurnSummary({ data }: Props) {
    return (
        <div className="pic">
            <div className="pic__card pic__card--wide">
                <span className="pic__emoji">📝</span>
                <h2 className="pic__title">{reasonLabels[data.reason] || 'Ronda terminada'}</h2>

                <div className="turn-summary__word">
                    La palabra era: <strong>{data.word}</strong>
                </div>

                {data.scores.length > 0 ? (
                    <div className="turn-summary__scores">
                        <div className="turn-summary__scores-title">Adivinaron correctamente:</div>
                        {data.scores.map((s, i) => (
                            <div key={i} className="turn-summary__score-row">
                                <span className="turn-summary__score-name">
                                    {s.isFirst && '🥇 '}{s.playerName}
                                </span>
                                <span className="turn-summary__score-points">+{s.points}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="pic__subtitle">Nadie adivinó esta vez 😅</p>
                )}

                <div className="turn-summary__next">
                    <div className="pic__dots"><span /><span /><span /></div>
                    <span>Siguiente ronda en unos segundos...</span>
                </div>
            </div>
        </div>
    );
}