import { usePixelAdventure } from '../../hooks/games/usePixelAdventure';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { PANameEntry } from '../../components/games/pixel-adventure/PANameEntry';
import { PALobby } from '../../components/games/pixel-adventure/PALobby';
import { GameBoard } from '../../components/games/pixel-adventure/GameBoard';
import { PlayerHUD } from '../../components/games/pixel-adventure/PlayerHUD';
import { EventModal } from '../../components/games/pixel-adventure/EventModal';
import { GameLog } from '../../components/games/pixel-adventure/GameLog';
import { PAGameOver } from '../../components/games/pixel-adventure/PAGameOver';
import '../../styles/components/pixel-adventure.css';

export function PixelAdventurePage() {
    const game = usePixelAdventure();

    const renderPhase = () => {
        if (game.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (game.phase) {
            case 'name':
                return (
                    <PANameEntry
                        playerName={game.playerName}
                        onSetName={game.setPlayerName}
                        onCreateRoom={game.createRoom}
                        onJoinRoom={game.joinRoom}
                        isConnected={game.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <PALobby
                        roomCode={game.roomCode}
                        players={game.players}
                        playerId={game.playerId}
                        isHost={game.isHost}
                        canStart={game.canStart}
                        onStartGame={game.startGame}
                        onKickPlayer={game.kickPlayer}
                    />
                );

            case 'playing':
                return (
                    <div className="pa-game-layout">
                        {/* Left: HUD */}
                        <div className="pa-game-layout__left">
                            <PlayerHUD
                                players={game.players}
                                myPlayer={game.myPlayer}
                                currentPlayerId={game.currentPlayerId}
                                isMyTurn={game.isMyTurn}
                                turnPhase={game.turnPhase}
                                isRolling={game.isRolling}
                                diceValue={game.diceResult?.diceValue || null}
                                preciseDicePrompt={game.preciseDicePrompt}
                                onRollDice={game.rollDice}
                                onUseItem={game.useItem}
                                onPreciseDice={game.preciseDiceValue}
                            />
                        </div>

                        {/* Center: Board */}
                        <div className="pa-game-layout__center">
                            <GameBoard
                                board={game.board}
                                players={game.players}
                                currentPlayerId={game.currentPlayerId}
                            />
                        </div>

                        {/* Right: Game log */}
                        <div className="pa-game-layout__right">
                            <GameLog logs={game.gameLog} />
                        </div>

                        {/* Event modals */}
                        <EventModal
                            activeEvent={game.activeEvent}
                            activeTrap={game.activeTrap}
                            activeDecision={game.activeDecision}
                            activeTileEffect={game.activeTileEffect}
                            receivedItem={game.receivedItem}
                            targetPrompt={game.targetPrompt}
                            turnSkipped={game.turnSkipped}
                            isMyTurn={game.isMyTurn}
                            playerId={game.playerId}
                            players={game.players}
                            onMakeDecision={game.makeDecision}
                            onSelectTarget={game.selectTarget}
                            onEventTarget={game.eventTarget}
                            onClearEffects={game.clearEffects}
                        />
                    </div>
                );

            case 'finished':
                if (!game.gameOverData) return null;
                return <PAGameOver data={game.gameOverData} onPlayAgain={game.reset} />;

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