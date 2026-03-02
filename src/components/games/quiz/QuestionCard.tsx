import type { Question } from '../../../types/games/quiz';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | undefined;
  onSelect: (questionId: number, optionIndex: number) => void;
}

const markers = ['A', 'B', 'C', 'D'];

export function QuestionCard({ question, selectedOption, onSelect }: QuestionCardProps) {
  return (
    <div className="question-card" key={question.id}>
      <div className="question-card__header">
        <span className="question-card__emoji">{question.emoji}</span>
        <h3 className="question-card__text">{question.text}</h3>
      </div>

      <div className="question-card__options">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            className={`question-card__option ${
              selectedOption === idx ? 'question-card__option--selected' : ''
            }`}
            onClick={() => onSelect(question.id, idx)}
          >
            <span className="question-card__option-marker">{markers[idx]}</span>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
