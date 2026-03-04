import { Button } from '../../common/Button';
import type { AnonQuestion } from '../../../types/games/anonymous-questions';

interface AnonAnsweringProps {
    questions: AnonQuestion[];
    draftAnswers: Record<string, string>;
    currentIndex: number;
    answeredCount: number;
    hasSubmitted: boolean;
    formattedTime: string | null;
    phaseProgress: { completed: number; total: number } | null;
    onUpdateAnswer: (questionId: string, text: string) => void;
    onSetIndex: (index: number) => void;
    onSubmit: () => void;
    onLeave: () => void;
}

export function AnonAnswering({
    questions,
    draftAnswers,
    currentIndex,
    answeredCount,
    hasSubmitted,
    formattedTime,
    phaseProgress,
    onUpdateAnswer,
    onSetIndex,
    onSubmit,
    onLeave,
}: AnonAnsweringProps) {
    if (hasSubmitted) {
        return (
            <div className="aq-answering aq-answering--submitted">
                <div className="aq-answering__done-icon">✅</div>
                <h2 className="aq-answering__done-title">¡Respuestas enviadas!</h2>
                <p className="aq-answering__done-text">Esperando a los demás...</p>
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
    const currentAnswer = draftAnswers[question.id] || '';
    const allAnswered = answeredCount === questions.length;

    return (
        <div className="aq-answering">
            <button className="aq-topbar__leave" onClick={onLeave}>← Salir</button>

            <div className="aq-answering__header">
                <div className="aq-answering__counter">
                    <span>Pregunta {currentIndex + 1} de {questions.length}</span>
                    <span>{answeredCount}/{questions.length} respondidas</span>
                </div>
                {formattedTime && <div className="aq-timer">⏱ {formattedTime}</div>}
                <div className="aq-answering__track">
                    <div className="aq-answering__fill" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
                </div>
            </div>

            <div className="aq-answering__card">
                <div className="aq-answering__q-badge">Pregunta anónima</div>
                <h3 className="aq-answering__q-text">{question.text}</h3>
                <textarea
                    className="aq-answering__textarea"
                    placeholder="Escribe tu respuesta..."
                    value={currentAnswer}
                    onChange={(e) => onUpdateAnswer(question.id, e.target.value)}
                    maxLength={500}
                    rows={4}
                    autoFocus
                />
                <span className="aq-answering__char-count">{currentAnswer.length}/500</span>
            </div>

            {/* Navigation dots */}
            <div className="aq-answering__dots">
                {questions.map((q, i) => (
                    <button
                        key={q.id}
                        className={`aq-answering__dot ${i === currentIndex ? 'aq-answering__dot--current' : ''} ${draftAnswers[q.id]?.trim() ? 'aq-answering__dot--answered' : ''}`}
                        onClick={() => onSetIndex(i)}
                        aria-label={`Pregunta ${i + 1}`}
                    />
                ))}
            </div>

            <div className="aq-answering__nav">
                <Button variant="ghost" size="sm" onClick={() => onSetIndex(currentIndex - 1)} disabled={isFirst}>
                    ← Anterior
                </Button>

                {isLast && allAnswered ? (
                    <Button variant="primary" size="sm" onClick={onSubmit}>
                        Enviar respuestas ✓
                    </Button>
                ) : isLast ? (
                    <Button variant="ghost" size="sm" disabled>
                        Responde todas para enviar
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onSetIndex(currentIndex + 1);
                        }}
                    >
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