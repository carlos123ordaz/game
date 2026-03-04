import { Button } from '../../common/Button';

interface AnonWritingProps {
    draftQuestions: string[];
    hasSubmitted: boolean;
    validCount: number;
    questionsPerPlayer: number;
    formattedTime: string | null;
    phaseProgress: { completed: number; total: number } | null;
    onUpdateQuestion: (index: number, text: string) => void;
    onSubmit: () => void;
    onLeave: () => void;
}

export function AnonWriting({
    draftQuestions,
    hasSubmitted,
    validCount,
    questionsPerPlayer,
    formattedTime,
    phaseProgress,
    onUpdateQuestion,
    onSubmit,
    onLeave,
}: AnonWritingProps) {
    if (hasSubmitted) {
        return (
            <div className="aq-writing aq-writing--submitted">
                <div className="aq-writing__done-icon">✅</div>
                <h2 className="aq-writing__done-title">¡Preguntas enviadas!</h2>
                <p className="aq-writing__done-text">Esperando a que los demás terminen...</p>
                {phaseProgress && (
                    <div className="aq-writing__progress-bar">
                        <div className="aq-writing__progress-info">
                            {phaseProgress.completed} de {phaseProgress.total} listos
                        </div>
                        <div className="aq-writing__progress-track">
                            <div
                                className="aq-writing__progress-fill"
                                style={{ width: `${(phaseProgress.completed / phaseProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
                {formattedTime && (
                    <div className="aq-writing__timer">⏱ {formattedTime}</div>
                )}
            </div>
        );
    }

    return (
        <div className="aq-writing">
            <button className="aq-topbar__leave" onClick={onLeave}>← Salir</button>

            <div className="aq-writing__header">
                <div className="aq-writing__icon">✍️</div>
                <h2 className="aq-writing__title">Escribe tus preguntas</h2>
                <p className="aq-writing__subtitle">
                    Nadie sabrá que las escribiste tú. Sé creativo, curioso o atrevido.
                </p>
                {formattedTime && (
                    <div className="aq-writing__timer">⏱ {formattedTime}</div>
                )}
            </div>

            <div className="aq-writing__questions">
                {draftQuestions.map((q, i) => (
                    <div key={i} className="aq-writing__question">
                        <label className="aq-writing__q-label">
                            Pregunta {i + 1}
                            {i === 0 && <span className="aq-writing__required">*</span>}
                        </label>
                        <textarea
                            className="aq-writing__textarea"
                            placeholder={
                                i === 0
                                    ? '¿Cuál es tu mayor miedo secreto?'
                                    : i === 1
                                        ? '¿Qué es lo más vergonzoso que te ha pasado?'
                                        : 'Escribe algo que quieras saber...'
                            }
                            value={q}
                            onChange={(e) => onUpdateQuestion(i, e.target.value)}
                            maxLength={300}
                            rows={3}
                        />
                        <span className="aq-writing__char-count">{q.length}/300</span>
                    </div>
                ))}
            </div>

            {phaseProgress && (
                <div className="aq-writing__progress-bar">
                    <div className="aq-writing__progress-info">
                        {phaseProgress.completed} de {phaseProgress.total} listos
                    </div>
                    <div className="aq-writing__progress-track">
                        <div
                            className="aq-writing__progress-fill"
                            style={{ width: `${(phaseProgress.completed / phaseProgress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="aq-writing__actions">
                <Button
                    variant="primary"
                    onClick={onSubmit}
                    disabled={validCount === 0}
                >
                    Enviar {validCount}/{questionsPerPlayer} pregunta{validCount !== 1 ? 's' : ''}
                </Button>
            </div>
        </div>
    );
}