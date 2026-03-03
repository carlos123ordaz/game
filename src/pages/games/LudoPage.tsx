/* File: src/pages/games/LudoPage.tsx */
import { useLudo } from '../../hooks/games/useLudo';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import '../../styles/components/ludo.css';
import { LudoEntry } from '../../components/games/ludo/LudoEntry';
import { LudoLobby } from '../../components/games/ludo/LudoLobby';
import { LudoGame } from '../../components/games/ludo/LudoGame';
import { LudoResults } from '../../components/games/ludo/LudoResults';

export function LudoPage() {
    const ludo = useLudo();

    const renderPhase = () => {
        if (ludo.isConnecting) return <LoadingSpinner text="Conectando al servidor..." />;

        switch (ludo.phase) {
            case 'name':
                return (
                    <LudoEntry
                        playerName={ludo.playerName}
                        onSetName={ludo.setPlayerName}
                        onCreateRoom={ludo.createRoom}
                        onJoinRoom={ludo.joinRoom}
                        isConnected={ludo.isConnected}
                    />
                );
            case 'lobby':
                return ludo.game ? (
                    <LudoLobby
                        roomCode={ludo.roomCode}
                        players={ludo.game.players}
                        playerId={ludo.playerId}
                        maxPlayers={ludo.game.players.length}
                        onToggleReady={ludo.toggleReady}
                    />
                ) : <LoadingSpinner text="Cargando sala..." />;
            case 'playing':
                return ludo.game ? (
                    <LudoGame
                        game={ludo.game}
                        playerId={ludo.playerId}
                        myColor={ludo.myColor}
                        isMyTurn={ludo.isMyTurn}
                        canRoll={ludo.canRoll}
                        canSelect={ludo.canSelect}
                        selectableTokens={ludo.selectableTokens}
                        onRollDice={ludo.rollDice}
                        onSelectMove={ludo.selectMove}
                    />
                ) : <LoadingSpinner text="Cargando..." />;
            case 'finished':
                return ludo.game ? (
                    <LudoResults game={ludo.game} playerId={ludo.playerId} onPlayAgain={ludo.reset} />
                ) : null;
            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={ludo.isConnected} isConnecting={ludo.isConnecting}>
            {renderPhase()}
            {(ludo.error || ludo.socketError) && (
                <div className="toast-container">
                    <Toast message={ludo.error || ludo.socketError || ''} type="error" onClose={ludo.clearError} />
                </div>
            )}
        </Layout>
    );
}