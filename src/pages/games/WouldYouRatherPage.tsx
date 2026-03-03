import { useCallback } from 'react';
import { useWouldYouRather } from '../../hooks/games/useWouldYouRather';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WYRNameEntry } from '../../components/games/would-you-rather/WYRNameEntry';
import { WYRLobby } from '../../components/games/would-you-rather/WYRLobby';
import { WYRGame } from '../../components/games/would-you-rather/WYRGame';
import { WYRWaiting } from '../../components/games/would-you-rather/WYRWaiting';
import { WYRResults } from '../../components/games/would-you-rather/WYRResults';
import '../../styles/components/wyr.css';

export function WouldYouRatherPage() {
    const wyr = useWouldYouRather();

    const handleGoTo = useCallback(
        (index: number) => {
            const diff = index - wyr.currentDilemma;
            if (diff > 0) for (let i = 0; i < diff; i++) wyr.nextDilemma();
            else for (let i = 0; i < Math.abs(diff); i++) wyr.prevDilemma();
        },
        [wyr]
    );

    const renderPhase = () => {
        if (wyr.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (wyr.phase) {
            case 'name':
                return (
                    <WYRNameEntry
                        playerName={wyr.playerName}
                        onSetName={wyr.setPlayerName}
                        onCreateRoom={wyr.createRoom}
                        onJoinRoom={wyr.joinRoom}
                        isConnected={wyr.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <WYRLobby
                        roomCode={wyr.roomCode}
                        players={wyr.players}
                        playerId={wyr.playerId}
                    />
                );

            case 'playing':
                return (
                    <WYRGame
                        dilemmas={wyr.dilemmas}
                        answers={wyr.answers}
                        currentDilemma={wyr.currentDilemma}
                        progress={wyr.progress}
                        allAnswered={wyr.allAnswered}
                        onAnswer={wyr.answerDilemma}
                        onNext={wyr.nextDilemma}
                        onPrev={wyr.prevDilemma}
                        onGoTo={handleGoTo}
                        onSubmit={wyr.submitAnswers}
                    />
                );

            case 'waiting':
                return <WYRWaiting partnerAnswered={wyr.partnerAnswered} />;

            case 'results':
                return (
                    <WYRResults
                        results={wyr.results}
                        onRequestResults={wyr.requestResults}
                        onPlayAgain={wyr.reset}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={wyr.isConnected} isConnecting={wyr.isConnecting}>
            {renderPhase()}

            {(wyr.error || wyr.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={wyr.error || wyr.socketError || ''}
                        type="error"
                        onClose={wyr.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}