import { useAnonQuestions } from '../../hooks/games/useAnonQuestions';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AnonNameEntry } from '../../components/games/anonymous-questions/AnonNameEntry';
import { AnonLobby } from '../../components/games/anonymous-questions/AnonLobby';
import { AnonWriting } from '../../components/games/anonymous-questions/AnonWriting';
import { AnonAnswering } from '../../components/games/anonymous-questions/AnonAnswering';
import { AnonGuessing } from '../../components/games/anonymous-questions/AnonGuessing';
import { AnonReveal } from '../../components/games/anonymous-questions/AnonReveal';
import '../../styles/components/anonymous-questions.css';

export function AnonQuestionsPage() {
    const aq = useAnonQuestions();

    const renderPhase = () => {
        if (aq.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (aq.phase) {
            case 'name':
                return (
                    <AnonNameEntry
                        playerName={aq.playerName}
                        onSetName={aq.setPlayerName}
                        onCreateRoom={aq.createRoom}
                        onJoinRoom={aq.joinRoom}
                        isConnected={aq.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <AnonLobby
                        roomCode={aq.roomCode}
                        players={aq.players}
                        playerId={aq.playerId}
                        host={aq.host}
                        settings={aq.settings}
                        isHost={aq.isHost}
                        onToggleReady={aq.toggleReady}
                        onChangeSettings={aq.changeSettings}
                        onStartGame={aq.startGame}
                        onLeave={aq.leaveRoom}
                    />
                );

            case 'writing':
                return (
                    <AnonWriting
                        draftQuestions={aq.draftQuestions}
                        hasSubmitted={aq.hasSubmittedQuestions}
                        validCount={aq.validDraftQuestions}
                        questionsPerPlayer={aq.settings.questionsPerPlayer}
                        formattedTime={aq.formattedTime}
                        phaseProgress={aq.phaseProgress}
                        onUpdateQuestion={aq.updateDraftQuestion}
                        onSubmit={aq.submitQuestions}
                        onLeave={aq.leaveRoom}
                    />
                );

            case 'answering':
                return (
                    <AnonAnswering
                        questions={aq.questions}
                        draftAnswers={aq.draftAnswers}
                        currentIndex={aq.currentQuestionIndex}
                        answeredCount={aq.answeredCount}
                        hasSubmitted={aq.hasSubmittedAnswers}
                        formattedTime={aq.formattedTime}
                        phaseProgress={aq.phaseProgress}
                        onUpdateAnswer={aq.updateDraftAnswer}
                        onSetIndex={aq.setAnswerIndex}
                        onSubmit={aq.submitAnswers}
                        onLeave={aq.leaveRoom}
                    />
                );

            case 'guessing':
                return (
                    <AnonGuessing
                        questions={aq.questionsWithAnswers}
                        possibleAuthors={aq.possibleAuthors}
                        draftGuesses={aq.draftGuesses}
                        currentIndex={aq.currentGuessIndex}
                        guessedCount={aq.guessedCount}
                        playerId={aq.playerId}
                        hasSubmitted={aq.hasSubmittedGuesses}
                        formattedTime={aq.formattedTime}
                        phaseProgress={aq.phaseProgress}
                        onUpdateGuess={aq.updateDraftGuess}
                        onSetIndex={aq.setGuessIndex}
                        onSubmit={aq.submitGuesses}
                        onLeave={aq.leaveRoom}
                    />
                );

            case 'reveal':
                return (
                    <AnonReveal
                        results={aq.results}
                        playerId={aq.playerId}
                        isHost={aq.isHost}
                        onRequestResults={aq.requestResults}
                        onPlayAgain={aq.playAgain}
                        onLeave={aq.leaveRoom}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={aq.isConnected} isConnecting={aq.isConnecting}>
            {renderPhase()}

            {(aq.error || aq.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={aq.error || aq.socketError || ''}
                        type="error"
                        onClose={aq.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}