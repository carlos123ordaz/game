import { useCallback } from 'react';
import { useQuiz } from '../../hooks/games/useQuiz';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { QuizNameEntry } from '../../components/games/quiz/QuizNameEntry';
import { QuizLobby } from '../../components/games/quiz/QuizLobby';
import { QuizGame } from '../../components/games/quiz/QuizGame';
import { QuizWaiting } from '../../components/games/quiz/QuizWaiting';
import { QuizResults } from '../../components/games/quiz/QuizResults';
import '../../styles/components/quiz.css';

export function QuizPage() {
  const quiz = useQuiz();

  const handleGoTo = useCallback(
    (index: number) => {
      const diff = index - quiz.currentQuestion;
      if (diff > 0) for (let i = 0; i < diff; i++) quiz.nextQuestion();
      else for (let i = 0; i < Math.abs(diff); i++) quiz.prevQuestion();
    },
    [quiz]
  );

  const renderPhase = () => {
    if (quiz.isConnecting) {
      return <LoadingSpinner text="Conectando al servidor..." />;
    }

    switch (quiz.phase) {
      case 'name':
        return (
          <QuizNameEntry
            playerName={quiz.playerName}
            onSetName={quiz.setPlayerName}
            onCreateRoom={quiz.createRoom}
            onJoinRoom={quiz.joinRoom}
            isConnected={quiz.isConnected}
          />
        );

      case 'lobby':
        return (
          <QuizLobby
            roomCode={quiz.roomCode}
            players={quiz.players}
            playerId={quiz.playerId}
          />
        );

      case 'playing':
        return (
          <QuizGame
            questions={quiz.questions}
            answers={quiz.answers}
            currentQuestion={quiz.currentQuestion}
            progress={quiz.progress}
            allAnswered={quiz.allAnswered}
            onAnswer={quiz.answerQuestion}
            onNext={quiz.nextQuestion}
            onPrev={quiz.prevQuestion}
            onGoTo={handleGoTo}
            onSubmit={quiz.submitAnswers}
          />
        );

      case 'waiting':
        return <QuizWaiting partnerAnswered={quiz.partnerAnswered} />;

      case 'results':
        return (
          <QuizResults
            results={quiz.results}
            onRequestResults={quiz.requestResults}
            onPlayAgain={quiz.reset}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout showStatus isConnected={quiz.isConnected} isConnecting={quiz.isConnecting}>
      {renderPhase()}

      {(quiz.error || quiz.socketError) && (
        <div className="toast-container">
          <Toast
            message={quiz.error || quiz.socketError || ''}
            type="error"
            onClose={quiz.clearError}
          />
        </div>
      )}
    </Layout>
  );
}
