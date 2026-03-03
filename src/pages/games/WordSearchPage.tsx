/* WORD SEARCH - Page Component | File: src/pages/games/WordSearchPage.tsx */

import { useWordSearch } from '../../hooks/games/useWordSearch';
import { Layout } from '../../components/common/Layout';
import { Toast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { WSNameEntry } from '../../components/games/word-search/WSNameEntry';
import { WSLobby } from '../../components/games/word-search/WSLobby';
import { WSCountdown } from '../../components/games/word-search/WSCountdown';
import { WSGame } from '../../components/games/word-search/WSGame';
import { WordSearchResults } from '../../components/games/word-search/WordSearchResults';
import '../../styles/components/word-search.css';
import { WSRoundEnd } from '../../components/games/word-search/WordSearchRoundEnd';

export function WordSearchPage() {
    const ws = useWordSearch();

    const renderPhase = () => {
        if (ws.isConnecting) {
            return <LoadingSpinner text="Conectando al servidor..." />;
        }

        switch (ws.phase) {
            case 'name':
                return (
                    <WSNameEntry
                        playerName={ws.playerName}
                        onSetName={ws.setPlayerName}
                        onCreateRoom={ws.createRoom}
                        onJoinRoom={ws.joinRoom}
                        isConnected={ws.isConnected}
                    />
                );

            case 'lobby':
                return (
                    <WSLobby
                        roomCode={ws.roomCode}
                        players={ws.players}
                        playerId={ws.playerId}
                        maxRounds={ws.maxRounds}
                        onToggleReady={ws.toggleReady}
                    />
                );

            case 'countdown':
                return (
                    <WSCountdown
                        roundIndex={ws.currentRound}
                        maxRounds={ws.maxRounds}
                        category={ws.category}
                        countdown={ws.countdown}
                    />
                );

            case 'playing':
                return (
                    <WSGame
                        grid={ws.grid}
                        gridSize={ws.gridSize}
                        words={ws.words}
                        foundWords={ws.foundWords}
                        placements={ws.placements}
                        playerId={ws.playerId}
                        category={ws.category}
                        currentRound={ws.currentRound}
                        maxRounds={ws.maxRounds}
                        timeRemaining={ws.timeRemaining}
                        scores={ws.scores}
                        selecting={ws.selecting}
                        selectedCells={ws.selectedCells}
                        hint={ws.hint}
                        lastFindResult={ws.lastFindResult}
                        onSelectionStart={ws.startSelection}
                        onSelectionMove={ws.moveSelection}
                        onSelectionEnd={ws.endSelection}
                        onRequestHint={ws.requestHint}
                    />
                );

            case 'round-end':
            case 'between-rounds':
                return (
                    <WSRoundEnd
                        roundIndex={ws.currentRound}
                        maxRounds={ws.maxRounds}
                        placements={ws.placements}
                        scores={ws.scores}
                        playerId={ws.playerId}
                    />
                );

            case 'results':
                return (
                    <WordSearchResults
                        results={ws.finalResults}
                        playerLeftMessage={ws.playerLeftMessage}
                        onRequestResults={ws.requestResults}
                        onPlayAgain={ws.reset}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Layout showStatus isConnected={ws.isConnected} isConnecting={ws.isConnecting}>
            {renderPhase()}
            {(ws.error || ws.socketError) && (
                <div className="toast-container">
                    <Toast
                        message={ws.error || ws.socketError || ''}
                        type="error"
                        onClose={ws.clearError}
                    />
                </div>
            )}
        </Layout>
    );
}