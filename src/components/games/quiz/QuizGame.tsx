import type { Question, QuizAnswer } from '../../../types/games/quiz';
import { Button } from '../../common/Button';
import { QuestionCard } from './QuestionCard';

interface QuizGameProps {
  questions: Question[];
  answers: QuizAnswer;
  currentQuestion: number;
  progress: number;
  allAnswered: boolean;
  onAnswer: (questionId: number, optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  onSubmit: () => void;
}

export function QuizGame({
  questions,
  answers,
  currentQuestion,
  progress,
  allAnswered,
  onAnswer,
  onNext,
  onPrev,
  onGoTo,
  onSubmit,
}: QuizGameProps) {
  const question = questions[currentQuestion];
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="game">
      <div className="game__progress-bar">
        <div className="game__progress-info">
          <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
          <span>{answeredCount}/{questions.length} respondidas</span>
        </div>
        <div className="game__progress-track">
          <div
            className="game__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="game__content">
        <QuestionCard
          question={question}
          selectedOption={answers[question.id]}
          onSelect={(qId, optIdx) => {
            onAnswer(qId, optIdx);
            // Auto-advance if not last question and was unanswered
            if (answers[question.id] === undefined && !isLast) {
              setTimeout(() => onNext(), 350);
            }
          }}
        />
      </div>

      <div className="game__nav">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={isFirst}
        >
          ← Anterior
        </Button>

        <div className="game__nav-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              className={`game__nav-dot ${
                answers[q.id] !== undefined ? 'game__nav-dot--answered' : ''
              } ${i === currentQuestion ? 'game__nav-dot--current' : ''}`}
              onClick={() => onGoTo(i)}
              aria-label={`Pregunta ${i + 1}`}
            />
          ))}
        </div>

        {isLast && allAnswered ? (
          <Button
            variant="success"
            size="sm"
            onClick={onSubmit}
          >
            Enviar ✓
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={isLast}
          >
            Siguiente →
          </Button>
        )}
      </div>
    </div>
  );
}
