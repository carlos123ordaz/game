import { usePictionary } from '../../hooks/games/usePictionary';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import '../../styles/components/pictionary.css';
import { PictionaryNameEntry } from '../../components/games/pictionary/PictionaryNameEntry';
import { PictionaryLobby } from '../../components/games/pictionary/PictionaryLobby';
import { WordSelect } from '../../components/games/pictionary/WordSelect';
import { WaitingForDrawer } from '../../components/games/pictionary/WaitingForDrawer';
import { PictionaryGame } from '../../components/games/pictionary/PictionaryGame';
import { TurnSummary } from '../../components/games/pictionary/TurnSummary';
import { GameResults } from '../../components/games/pictionary/GameResults';

export function PictionaryPage() {
    const game = usePictionary();

    const renderPhase = () => {
        if (game.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (game.phase) {
            case 'name':
                return (
                    <PictionaryNameEntry
                        playerName={game.playerName}
                        onSetName={game.setPlayerName}
                        onCreateRoom={game.createRoom}
                        onJoinRoom={game.joinRoom}
                        isConnected={game.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <PictionaryLobby
                        roomCode={game.roomCode}
                        players={game.players}
                        playerId={game.playerId}
                        isHost={game.isHost}
                        canStart={game.canStart}
                        onStartGame={game.startGame}
                        onKickPlayer={game.kickPlayer}
                    />
                );

            case 'word-select':
                // Drawer sees word options, guessers see waiting screen
                if (game.isDrawing && game.wordOptions.length > 0) {
                    return (
                        <WordSelect
                            options={game.wordOptions}
                            drawerName={game.drawerName}
                            onSelectWord={game.selectWord}
                            currentRound={game.currentRound}
                            totalRounds={game.totalRounds}
                        />
                    );
                }
                return (
                    <WaitingForDrawer
                        drawerName={game.drawerName}
                        currentRound={game.currentRound}
                        totalRounds={game.totalRounds}
                    />
                );

            case 'drawing':
                return (
                    <PictionaryGame
                        playerId={game.playerId}
                        isDrawing={game.isDrawing}
                        hasGuessed={game.hasGuessed}
                        drawerName={game.drawerName}
                        currentRound={game.currentRound}
                        totalRounds={game.totalRounds}
                        timeLeft={game.timeLeft}
                        currentWord={game.currentWord}
                        hint={game.hint}
                        wordLength={game.wordLength}
                        category={game.category}
                        strokes={game.strokes}
                        onSendStroke={game.sendStroke}
                        onClearCanvas={game.clearCanvas}
                        onUndo={game.undoStroke}
                        messages={game.messages}
                        onSendGuess={game.sendGuess}
                        players={game.players}
                        drawerId={game.drawerId}
                        guessedPlayerIds={game.guessedPlayerIds}
                    />
                );

            case 'turn-end':
                if (!game.turnEndData) return null;
                return <TurnSummary data={game.turnEndData} />;

            case 'game-end':
                if (!game.gameEndData) return null;
                return <GameResults data={game.gameEndData} onPlayAgain={game.reset} />;

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={game.isConnected} isConnecting={game.isConnecting}>
            {renderPhase()}

            {(game.error || game.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={game.error || game.socketError || ''}
                        type="error"
                        onClose={game.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}