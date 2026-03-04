import { useMinesweeper } from '../../hooks/games/useMinesweeper';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MinesweeperNameEntry } from '../../components/games/minesweeper/MinesweeperNameEntry';
import { MinesweeperLobby } from '../../components/games/minesweeper/MinesweeperLobby';
import { MinesweeperGame } from '../../components/games/minesweeper/MinesweeperGame';
import { MinesweeperResultsView } from '../../components/games/minesweeper/MinesweeperResults';
import '../../styles/components/minesweeper.css';

export function MinesweeperPage() {
    const ms = useMinesweeper();

    const renderPhase = () => {
        if (ms.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (ms.phase) {
            case 'name':
                return (
                    <MinesweeperNameEntry
                        playerName={ms.playerName}
                        onSetName={ms.setPlayerName}
                        onCreateRoom={ms.createRoom}
                        onJoinRoom={ms.joinRoom}
                        isConnected={ms.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <MinesweeperLobby
                        roomCode={ms.roomCode}
                        players={ms.players}
                        playerId={ms.playerId}
                        host={ms.host}
                        difficulty={ms.difficulty}
                        isHost={ms.isHost}
                        onToggleReady={ms.toggleReady}
                        onChangeDifficulty={ms.changeDifficulty}
                        onStartGame={ms.startGame}
                    />
                );

            case 'playing':
                return (
                    <MinesweeperGame
                        board={ms.board}
                        rows={ms.rows}
                        cols={ms.cols}
                        totalMines={ms.totalMines}
                        flagCount={ms.flagCount}
                        score={ms.score}
                        lives={ms.lives}
                        playerStatus={ms.playerStatus}
                        formattedTime={ms.formattedTime}
                        timeRemaining={ms.timeRemaining}
                        progress={ms.progress}
                        allPlayerStats={ms.allPlayerStats}
                        playerId={ms.playerId}
                        onReveal={ms.revealCell}
                        onFlag={ms.toggleFlag}
                    />
                );

            case 'results':
                return (
                    <MinesweeperResultsView
                        results={ms.results}
                        onRequestResults={ms.requestResults}
                        onPlayAgain={ms.reset}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={ms.isConnected} isConnecting={ms.isConnecting}>
            {renderPhase()}

            {(ms.error || ms.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={ms.error || ms.socketError || ''}
                        type="error"
                        onClose={ms.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}