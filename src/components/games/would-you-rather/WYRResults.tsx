import { useEffect } from 'react';
import type { WYRResults as WYRResultsType } from '../../../types/games/wouldYouRather';

interface WYRResultsProps {
    results: WYRResultsType | null;
    onRequestResults: () => void;
    onPlayAgain: () => void;
}

export function WYRResults({ results, onRequestResults, onPlayAgain }: WYRResultsProps) {
    useEffect(() => {
        if (!results) onRequestResults();
    }, [results, onRequestResults]);

    if (!results) {
        return (
            <div className="wyr">
                <div className="wyr__card">
                    <span className="wyr__emoji">⏳</span>
                    <p>Cargando resultados...</p>
                </div>
            </div>
        );
    }

    const getLabel = (pct: number) => {
        if (pct >= 80) return { text: '¡Piensan muy parecido!', emoji: '🔥' };
        if (pct >= 60) return { text: 'Bastante compatibles', emoji: '✨' };
        if (pct >= 40) return { text: 'Una mezcla interesante', emoji: '🎭' };
        if (pct >= 20) return { text: 'Opuestos se atraen...', emoji: '🌀' };
        return { text: '¡Totalmente diferentes!', emoji: '💥' };
    };

    const label = getLabel(results.percentage);

    return (
        <div className="wyr">
            <div className="wyr__results">
                {/* Score header */}
                <div className="wyr__results-header">
                    <span className="wyr__results-emoji">{label.emoji}</span>
                    <div className="wyr__results-score">{results.percentage}%</div>
                    <p className="wyr__results-label">{label.text}</p>
                    <p className="wyr__results-detail">
                        Coincidieron en {results.matchedCount} de {results.totalCount} dilemas
                    </p>
                </div>

                {/* Players legend */}
                <div className="wyr__results-players">
                    <span className="wyr__results-player wyr__results-player--p1">
                        {results.players[0]?.name}
                    </span>
                    <span className="wyr__results-vs">vs</span>
                    <span className="wyr__results-player wyr__results-player--p2">
                        {results.players[1]?.name}
                    </span>
                </div>

                {/* Breakdown */}
                <div className="wyr__breakdown">
                    {results.breakdown.map((item) => (
                        <div
                            key={item.dilemmaId}
                            className={`wyr__breakdown-item ${item.matched ? 'wyr__breakdown-item--match' : 'wyr__breakdown-item--diff'}`}
                        >
                            <div className="wyr__breakdown-header">
                                <span className="wyr__breakdown-emoji">{item.emoji}</span>
                                <span className="wyr__breakdown-status">
                                    {item.matched ? '✓ Coincidieron' : '✗ Diferente'}
                                </span>
                            </div>

                            <div className="wyr__breakdown-options">
                                <div
                                    className={`wyr__breakdown-option ${item.player1Choice === 'A' || item.player2Choice === 'A'
                                            ? 'wyr__breakdown-option--chosen'
                                            : ''
                                        }`}
                                >
                                    <span className="wyr__breakdown-option-label">A</span>
                                    <span className="wyr__breakdown-option-text">{item.optionA}</span>
                                    <div className="wyr__breakdown-pickers">
                                        {item.player1Choice === 'A' && (
                                            <span className="wyr__breakdown-picker wyr__breakdown-picker--p1">
                                                {results.players[0]?.name}
                                            </span>
                                        )}
                                        {item.player2Choice === 'A' && (
                                            <span className="wyr__breakdown-picker wyr__breakdown-picker--p2">
                                                {results.players[1]?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className={`wyr__breakdown-option ${item.player1Choice === 'B' || item.player2Choice === 'B'
                                            ? 'wyr__breakdown-option--chosen'
                                            : ''
                                        }`}
                                >
                                    <span className="wyr__breakdown-option-label">B</span>
                                    <span className="wyr__breakdown-option-text">{item.optionB}</span>
                                    <div className="wyr__breakdown-pickers">
                                        {item.player1Choice === 'B' && (
                                            <span className="wyr__breakdown-picker wyr__breakdown-picker--p1">
                                                {results.players[0]?.name}
                                            </span>
                                        )}
                                        {item.player2Choice === 'B' && (
                                            <span className="wyr__breakdown-picker wyr__breakdown-picker--p2">
                                                {results.players[1]?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Play again */}
                <button className="wyr__btn wyr__btn--primary wyr__btn--full" onClick={onPlayAgain}>
                    🔄 Jugar de nuevo
                </button>
            </div>
        </div>
    );
}