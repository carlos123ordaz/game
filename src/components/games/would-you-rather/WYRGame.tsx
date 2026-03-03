import type { Dilemma, DilemmaChoice, DilemmaAnswer } from '../../../types/games/wouldYouRather';

interface WYRGameProps {
    dilemmas: Dilemma[];
    answers: DilemmaAnswer;
    currentDilemma: number;
    progress: number;
    allAnswered: boolean;
    onAnswer: (dilemmaId: number, choice: DilemmaChoice) => void;
    onNext: () => void;
    onPrev: () => void;
    onGoTo: (index: number) => void;
    onSubmit: () => void;
}

export function WYRGame({
    dilemmas,
    answers,
    currentDilemma,
    progress,
    allAnswered,
    onAnswer,
    onNext,
    onPrev,
    onGoTo,
    onSubmit,
}: WYRGameProps) {
    const dilemma = dilemmas[currentDilemma];
    if (!dilemma) return null;

    const currentAnswer = answers[dilemma.id] ?? null;
    const isFirst = currentDilemma === 0;
    const isLast = currentDilemma === dilemmas.length - 1;

    const handleChoice = (choice: DilemmaChoice) => {
        onAnswer(dilemma.id, choice);
        // Auto-advance after short delay if not last
        if (!isLast) {
            setTimeout(() => onNext(), 400);
        }
    };

    return (
        <div className="wyr">
            {/* Progress bar */}
            <div className="wyr__progress">
                <div className="wyr__progress-bar" style={{ width: `${progress}%` }} />
            </div>

            <div className="wyr__counter">
                {currentDilemma + 1} / {dilemmas.length}
            </div>

            {/* Dilemma card */}
            <div className="wyr__dilemma-card">
                <span className="wyr__dilemma-emoji">{dilemma.emoji}</span>
                <h3 className="wyr__dilemma-text">{dilemma.text}</h3>

                <div className="wyr__choices">
                    <button
                        className={`wyr__choice wyr__choice--a ${currentAnswer === 'A' ? 'wyr__choice--selected' : ''}`}
                        onClick={() => handleChoice('A')}
                    >
                        <span className="wyr__choice-label">A</span>
                        <span className="wyr__choice-text">{dilemma.optionA}</span>
                    </button>

                    <div className="wyr__vs">VS</div>

                    <button
                        className={`wyr__choice wyr__choice--b ${currentAnswer === 'B' ? 'wyr__choice--selected' : ''}`}
                        onClick={() => handleChoice('B')}
                    >
                        <span className="wyr__choice-label">B</span>
                        <span className="wyr__choice-text">{dilemma.optionB}</span>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="wyr__nav">
                <button
                    className="wyr__nav-btn"
                    onClick={onPrev}
                    disabled={isFirst}
                >
                    ← Anterior
                </button>

                {allAnswered ? (
                    <button className="wyr__btn wyr__btn--primary" onClick={onSubmit}>
                        ✓ Enviar respuestas
                    </button>
                ) : (
                    <button
                        className="wyr__nav-btn"
                        onClick={onNext}
                        disabled={isLast}
                    >
                        Siguiente →
                    </button>
                )}
            </div>

            {/* Dot indicators */}
            <div className="wyr__dots">
                {dilemmas.map((d, i) => (
                    <button
                        key={d.id}
                        className={`wyr__dot ${i === currentDilemma ? 'wyr__dot--active' : ''} ${answers[d.id] !== undefined ? 'wyr__dot--answered' : ''}`}
                        onClick={() => onGoTo(i)}
                        title={`Dilema ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}