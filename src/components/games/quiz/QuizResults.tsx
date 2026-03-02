import { useEffect } from 'react';
import type { QuizResults as QuizResultsType } from '../../../types/games/quiz';
import { Button } from '../../common/Button';
import { LoadingSpinner } from '../../common/LoadingSpinner';

interface QuizResultsProps {
  results: QuizResultsType | null;
  onRequestResults: () => void;
  onPlayAgain: () => void;
}

function getResultMessage(percentage: number): string {
  if (percentage >= 80) return '¡Están super conectados! 🔥';
  if (percentage >= 60) return '¡Se conocen bastante bien! ✨';
  if (percentage >= 40) return 'Tienen cosas en común 🌱';
  if (percentage >= 20) return 'Opuestos se atraen, ¿no? 😄';
  return 'Cada uno tiene su mundo 🌍';
}

function getPercentageClass(percentage: number): string {
  if (percentage >= 60) return 'results__percentage--high';
  if (percentage >= 30) return 'results__percentage--mid';
  return 'results__percentage--low';
}

export function QuizResults({ results, onRequestResults, onPlayAgain }: QuizResultsProps) {
  useEffect(() => {
    if (!results) {
      onRequestResults();
    }
  }, [results, onRequestResults]);

  if (!results) {
    return <LoadingSpinner text="Cargando resultados..." />;
  }

  return (
    <div className="results">
      <div className="results__hero">
        <div className="results__label">Compatibilidad</div>
        <div className={`results__percentage ${getPercentageClass(results.percentage)}`}>
          {results.percentage}%
        </div>
        <div className="results__message">
          {getResultMessage(results.percentage)}
        </div>
      </div>

      <div className="results__players">
        <div className="results__player-tag">
          <div className="results__player-color results__player-color--p1" />
          <span>{results.players[0].name}</span>
        </div>
        <div className="results__player-tag">
          <div className="results__player-color results__player-color--p2" />
          <span>{results.players[1].name}</span>
        </div>
      </div>

      <div className="results__breakdown">
        <div className="results__breakdown-title">
          {results.matchedQuestions} de {results.totalQuestions} coincidencias
        </div>

        {results.breakdown.map((item, i) => (
          <div
            className={`breakdown-item ${
              item.matched ? 'breakdown-item--matched' : 'breakdown-item--mismatched'
            }`}
            key={item.questionId}
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="breakdown-item__header">
              <span className="breakdown-item__emoji">{item.emoji}</span>
              <span className="breakdown-item__question">{item.questionText}</span>
              <span className="breakdown-item__status">
                {item.matched ? '✅' : '❌'}
              </span>
            </div>

            <div className="breakdown-item__answers">
              <div className="breakdown-item__answer breakdown-item__answer--p1">
                <div className="breakdown-item__answer-name">
                  {results.players[0].name}
                </div>
                {item.player1Answer}
              </div>
              <div className="breakdown-item__answer breakdown-item__answer--p2">
                <div className="breakdown-item__answer-name">
                  {results.players[1].name}
                </div>
                {item.player2Answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="results__actions">
        <Button variant="primary" onClick={onPlayAgain}>
          Jugar de nuevo
        </Button>
        <Button
          variant="secondary"
          onClick={() => window.location.href = '/'}
        >
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
