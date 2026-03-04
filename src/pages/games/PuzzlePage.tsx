import { usePuzzle } from '../../hooks/games/usePuzzle';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PuzzleNameEntry } from '../../components/games/puzzle/PuzzleNameEntry';
import { PuzzleLobby } from '../../components/games/puzzle/PuzzleLobby';
import { PuzzleCountdown } from '../../components/games/puzzle/PuzzleCountdown';
import { PuzzleGame } from '../../components/games/puzzle/PuzzleGame';
import { PuzzleResults } from '../../components/games/puzzle/PuzzleResults';
import '../../styles/components/puzzle.css';

export function PuzzlePage() {
    const puzzle = usePuzzle();

    const isHost = puzzle.players.length > 0 && puzzle.players[0]?.id === puzzle.playerId;

    const renderPhase = () => {
        if (puzzle.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (puzzle.phase) {
            case 'name':
                return (
                    <PuzzleNameEntry
                        playerName={puzzle.playerName}
                        onSetName={puzzle.setPlayerName}
                        onCreateRoom={puzzle.createRoom}
                        onJoinRoom={puzzle.joinRoom}
                        isConnected={puzzle.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <PuzzleLobby
                        roomCode={puzzle.roomCode}
                        players={puzzle.players}
                        playerId={puzzle.playerId}
                        difficulty={puzzle.difficulty}
                        imageIndex={puzzle.imageIndex}
                        isHost={isHost}
                        onChangeSettings={puzzle.changeSettings}
                    />
                );

            case 'countdown':
                return <PuzzleCountdown seconds={puzzle.countdownSeconds} />;

            case 'playing':
                return (
                    <PuzzleGame
                        pieces={puzzle.pieces}
                        gridSize={puzzle.gridSize}
                        image={puzzle.image}
                        moves={puzzle.moves}
                        myProgress={puzzle.myProgress}
                        correctCount={puzzle.correctCount}
                        totalPieces={puzzle.totalPieces}
                        elapsed={puzzle.elapsed}
                        timeRemaining={puzzle.timeRemaining}
                        timeLimit={puzzle.timeLimit}
                        opponentProgress={puzzle.opponentProgress}
                        opponentMoves={puzzle.opponentMoves}
                        opponentName={puzzle.opponentName}
                        opponentCompleted={puzzle.opponentCompleted}
                        playerName={puzzle.playerName}
                        isComplete={puzzle.isComplete}
                        onSwap={puzzle.swapPieces}
                    />
                );

            case 'finished':
                return (
                    <PuzzleResults
                        results={puzzle.results}
                        playerId={puzzle.playerId}
                        onPlayAgain={puzzle.reset}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={puzzle.isConnected} isConnecting={puzzle.isConnecting}>
            {renderPhase()}

            {(puzzle.error || puzzle.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={puzzle.error || puzzle.socketError || ''}
                        type="error"
                        onClose={puzzle.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}