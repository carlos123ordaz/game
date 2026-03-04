import { Button } from '../../common/Button';
import type { AnonQuestionWithAnswers, PossibleAuthor } from '../../../types/games/anonymous-questions';

interface AnonGuessingProps {
    questions: AnonQuestionWithAnswers[];
    possibleAuthors: PossibleAuthor[];
    draftGuesses: Record<string, string>;
    currentIndex: number;
    guessedCount: number;
    playerId: string;
    hasSubmitted: boolean;
    formattedTime: string | null;
    phaseProgress: { completed: number; total: number } | null;
    onUpdateGuess: (questionId: string, playerId: string) => void;
    onSetIndex: (index: number) => void;
    onSubmit: () => void;
    onLeave: () => void;
}

export function AnonGuessing({
    questions,
    possibleAuthors,
    draftGuesses,
    currentIndex,
    guessedCount,
    playerId,
    hasSubmitted,
    formattedTime,
    phaseProgress,
    onUpdateGuess,
    onSetIndex,
    onSubmit,
    onLeave,
}: AnonGuessingProps) {
    if (hasSubmitted) {
        return (
            <div className="aq-guessing aq-guessing--submitted">
                <div className="aq-guessing__done-icon">🔍</div>
                <h2 className="aq-guessing__done-title">¡Adivinanzas enviadas!</h2>
                <p className="aq-guessing__done-text">Esperando a los demás para la revelación...</p>
                {phaseProgress && (
                    <div className="aq-phase-progress">
                        <span>{phaseProgress.completed} de {phaseProgress.total} listos</span>
                        <div className="aq-phase-progress__track">
                            <div className="aq-phase-progress__fill" style={{ width: `${(phaseProgress.completed / phaseProgress.total) * 100}%` }} />
                        </div>
                    </div>
                )}
                {formattedTime && <div className="aq-timer">⏱ {formattedTime}</div>}
            </div>
        );
    }

    const question = questions[currentIndex];
    if (!question) return null;

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;
    const currentGuess = draftGuesses[question.id] || '';

    return (
        <div className="aq-guessing">
            <button className="aq-topbar__leave" onClick={onLeave}>← Salir</button>

            <div className="aq-guessing__header">
                <div className="aq-guessing__counter">
                    <span>Pregunta {currentIndex + 1} de {questions.length}</span>
                    <span>{guessedCount} adivinadas</span>
                </div>
                {formattedTime && <div className="aq-timer">⏱ {formattedTime}</div>}
            </div>

            <div className="aq-guessing__card">
                <div className="aq-guessing__q-label">¿Quién hizo esta pregunta?</div>
                <h3 className="aq-guessing__q-text">{question.text}</h3>

                {/* Show answers */}
                {question.answers.length > 0 && (
                    <div className="aq-guessing__answers">
                        <div className="aq-guessing__answers-title">Respuestas:</div>
                        {question.answers.map((a, i) => (
                            <div key={i} className="aq-guessing__answer">
                                <span className="aq-guessing__answer-name">{a.playerName}</span>
                                <span className="aq-guessing__answer-text">{a.answer}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Author picker */}
                <div className="aq-guessing__picker">
                    <div className="aq-guessing__picker-label">Tu adivinanza:</div>
                    <div className="aq-guessing__picker-grid">
                        {possibleAuthors.map(author => (
                            <button
                                key={author.id}
                                className={`aq-guessing__author-btn ${currentGuess === author.id ? 'aq-guessing__author-btn--selected' : ''
                                    } ${author.id === playerId ? 'aq-guessing__author-btn--you' : ''}`}
                                onClick={() => onUpdateGuess(question.id, author.id)}
                            >
                                <span className="aq-guessing__author-avatar">🎭</span>
                                <span className="aq-guessing__author-name">
                                    {author.name}
                                    {author.id === playerId ? ' (tú)' : ''}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dots nav */}
            <div className="aq-guessing__dots">
                {questions.map((q, i) => (
                    <button
                        key={q.id}
                        className={`aq-answering__dot ${i === currentIndex ? 'aq-answering__dot--current' : ''} ${draftGuesses[q.id] ? 'aq-answering__dot--answered' : ''}`}
                        onClick={() => onSetIndex(i)}
                        aria-label={`Pregunta ${i + 1}`}
                    />
                ))}
            </div>

            <div className="aq-guessing__nav">
                <Button variant="ghost" size="sm" onClick={() => onSetIndex(currentIndex - 1)} disabled={isFirst}>
                    ← Anterior
                </Button>

                {isLast ? (
                    <Button variant="primary" size="sm" onClick={onSubmit}>
                        Enviar adivinanzas ✓
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" onClick={() => onSetIndex(currentIndex + 1)}>
                        Siguiente →
                    </Button>
                )}
            </div>

            {phaseProgress && (
                <div className="aq-phase-progress">
                    <span>{phaseProgress.completed} de {phaseProgress.total} listos</span>
                    <div className="aq-phase-progress__track">
                        <div className="aq-phase-progress__fill" style={{ width: `${(phaseProgress.completed / phaseProgress.total) * 100}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}