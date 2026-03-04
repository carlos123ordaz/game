import { useEffect, useState } from 'react';
import { Button } from '../../common/Button';
import type { AnonResults } from '../../../types/games/anonymous-questions';

interface AnonRevealProps {
    results: AnonResults | null;
    playerId: string;
    isHost: boolean;
    onRequestResults: () => void;
    onPlayAgain: () => void;
    onLeave: () => void;
}

export function AnonReveal({
    results,
    playerId,
    isHost,
    onRequestResults,
    onPlayAgain,
    onLeave,
}: AnonRevealProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        if (!results) onRequestResults();
    }, [results, onRequestResults]);

    if (!results) {
        return (
            <div className="aq-reveal aq-reveal--loading">
                <div className="aq-reveal__spinner" />
                <p>Calculando resultados...</p>
            </div>
        );
    }

    const winner = results.leaderboard[0];

    return (
        <div className="aq-reveal">
            {/* Winner banner */}
            <div className="aq-reveal__winner">
                <div className="aq-reveal__trophy">🏆</div>
                <h2 className="aq-reveal__winner-name">{winner.name}</h2>
                <p className="aq-reveal__winner-score">{winner.score} puntos</p>
                <p className="aq-reveal__winner-detail">
                    {winner.correctGuesses} adivinanza{winner.correctGuesses !== 1 ? 's' : ''} correcta{winner.correctGuesses !== 1 ? 's' : ''}
                    {' · '}
                    {winner.timesFooled} {winner.timesFooled === 1 ? 'vez' : 'veces'} engañó
                </p>
            </div>

            {/* Leaderboard */}
            <div className="aq-reveal__leaderboard">
                <h3 className="aq-reveal__section-title">Tabla de posiciones</h3>
                {results.leaderboard.map((p, i) => (
                    <div
                        key={p.id}
                        className={`aq-reveal__lb-row ${p.id === playerId ? 'aq-reveal__lb-row--you' : ''} ${i === 0 ? 'aq-reveal__lb-row--first' : ''}`}
                        style={{ animationDelay: `${i * 0.08}s` }}
                    >
                        <span className="aq-reveal__lb-rank">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <div className="aq-reveal__lb-info">
                            <span className="aq-reveal__lb-name">
                                {p.name} {p.id === playerId && '(tú)'}
                            </span>
                            <span className="aq-reveal__lb-stats">
                                {p.correctGuesses} acierto{p.correctGuesses !== 1 ? 's' : ''}
                                {' · '}
                                engañó {p.timesFooled}×
                                {' · '}
                                {p.questionsWritten} pregunta{p.questionsWritten !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <span className="aq-reveal__lb-score">{p.score}</span>
                    </div>
                ))}
            </div>

            {/* Question Reveals */}
            <div className="aq-reveal__questions">
                <div className="aq-reveal__section-header">
                    <h3 className="aq-reveal__section-title">Revelación de preguntas</h3>
                    <button className="aq-reveal__expand-all" onClick={() => setShowAll(!showAll)}>
                        {showAll ? 'Colapsar todo' : 'Expandir todo'}
                    </button>
                </div>

                {results.questions.map((q, i) => {
                    const isExpanded = showAll || expandedQuestion === q.questionId;

                    return (
                        <div
                            key={q.questionId}
                            className={`aq-reveal__q-card ${isExpanded ? 'aq-reveal__q-card--expanded' : ''}`}
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            <button
                                className="aq-reveal__q-header"
                                onClick={() => setExpandedQuestion(isExpanded && !showAll ? null : q.questionId)}
                            >
                                <div className="aq-reveal__q-left">
                                    <span className="aq-reveal__q-num">#{i + 1}</span>
                                    <span className="aq-reveal__q-text">{q.questionText}</span>
                                </div>
                                <div className="aq-reveal__q-author">
                                    <span className="aq-reveal__q-author-label">Autor:</span>
                                    <span className="aq-reveal__q-author-name">{q.authorName}</span>
                                </div>
                                <span className="aq-reveal__q-chevron">{isExpanded ? '▾' : '▸'}</span>
                            </button>

                            {isExpanded && (
                                <div className="aq-reveal__q-body">
                                    {/* Answers */}
                                    <div className="aq-reveal__q-section">
                                        <div className="aq-reveal__q-section-title">Respuestas</div>
                                        {q.answers.map((a, j) => (
                                            <div key={j} className={`aq-reveal__q-answer ${a.playerId === q.authorId ? 'aq-reveal__q-answer--author' : ''}`}>
                                                <span className="aq-reveal__q-answer-name">
                                                    {a.playerName}
                                                    {a.playerId === q.authorId && ' ✍️'}
                                                </span>
                                                <span className="aq-reveal__q-answer-text">{a.answer}</span>
                                            </div>
                                        ))}
                                        {q.answers.length === 0 && (
                                            <div className="aq-reveal__q-empty">Nadie respondió esta pregunta</div>
                                        )}
                                    </div>

                                    {/* Guesses */}
                                    <div className="aq-reveal__q-section">
                                        <div className="aq-reveal__q-section-title">
                                            ¿Quién adivinó? ({q.correctGuessCount}/{q.totalGuessers})
                                        </div>
                                        {q.guesses.map((g, j) => (
                                            <div key={j} className={`aq-reveal__q-guess ${g.correct ? 'aq-reveal__q-guess--correct' : 'aq-reveal__q-guess--wrong'}`}>
                                                <span className="aq-reveal__q-guess-who">{g.guesserName}</span>
                                                <span className="aq-reveal__q-guess-arrow">→</span>
                                                <span className="aq-reveal__q-guess-target">{g.guessedName}</span>
                                                <span className="aq-reveal__q-guess-icon">{g.correct ? '✅' : '❌'}</span>
                                            </div>
                                        ))}
                                        {q.guesses.length === 0 && (
                                            <div className="aq-reveal__q-empty">Nadie adivinó</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="aq-reveal__actions">
                {isHost && (
                    <Button variant="primary" onClick={onPlayAgain}>
                        Jugar de nuevo
                    </Button>
                )}
                <Button variant="ghost" onClick={onLeave}>
                    Salir
                </Button>
            </div>
        </div>
    );
}