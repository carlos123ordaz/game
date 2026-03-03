import { DrawingCanvas } from './DrawingCanvas';
import { GuessingChat } from './GuessingChat';
import { Scoreboard } from './Scoreboard';
import type { PictionaryPlayer, Stroke, ChatMessage } from '../../../types/games/pictionary';

interface Props {
    // Player
    playerId: string;
    isDrawing: boolean;
    hasGuessed: boolean;

    // Turn info
    drawerName: string;
    currentRound: number;
    totalRounds: number;
    timeLeft: number;
    currentWord: string | null;
    hint: string | null;
    wordLength: number;
    category: string;

    // Canvas
    strokes: Stroke[];
    onSendStroke: (stroke: Stroke) => void;
    onClearCanvas: () => void;
    onUndo: () => void;

    // Chat
    messages: ChatMessage[];
    onSendGuess: (text: string) => void;

    // Scores
    players: PictionaryPlayer[];
    drawerId: string;
    guessedPlayerIds: string[];
}

export function PictionaryGame(props: Props) {
    const {
        playerId, isDrawing, hasGuessed,
        drawerName, currentRound, totalRounds, timeLeft,
        currentWord, hint, wordLength, category,
        strokes, onSendStroke, onClearCanvas, onUndo,
        messages, onSendGuess,
        players, drawerId, guessedPlayerIds,
    } = props;

    const timerClass = timeLeft <= 10 ? 'pic-game__timer--urgent' : timeLeft <= 20 ? 'pic-game__timer--warning' : '';

    return (
        <div className="pic-game">
            {/* Top bar */}
            <div className="pic-game__topbar">
                <div className="pic-game__round">
                    Ronda {currentRound}/{totalRounds}
                </div>

                <div className="pic-game__word-area">
                    {isDrawing ? (
                        <div className="pic-game__word">
                            <span className="pic-game__word-label">Tu palabra:</span>
                            <span className="pic-game__word-value">{currentWord || '...'}</span>
                        </div>
                    ) : (
                        <div className="pic-game__hint">
                            <span className="pic-game__hint-chars">{hint || '_ '.repeat(wordLength || 5).trim()}</span>
                            {category && <span className="pic-game__hint-category">{category}</span>}
                        </div>
                    )}
                </div>

                <div className={`pic-game__timer ${timerClass}`}>
                    {timeLeft > 0 ? `⏱ ${timeLeft}s` : '⏱ --'}
                </div>
            </div>

            {/* Info banner */}
            <div className="pic-game__banner">
                {isDrawing ? (
                    <span>🎨 ¡Dibuja para que los demás adivinen!</span>
                ) : hasGuessed ? (
                    <span>✅ ¡Adivinaste! Esperando al resto...</span>
                ) : (
                    <span>🖊️ <strong>{drawerName}</strong> está dibujando — ¡Adivina la palabra!</span>
                )}
            </div>

            {/* Main layout: Scoreboard | Canvas | Chat */}
            <div className="pic-game__layout">
                <div className="pic-game__sidebar pic-game__sidebar--left">
                    <Scoreboard
                        players={players}
                        drawerId={drawerId}
                        guessedPlayerIds={guessedPlayerIds}
                        playerId={playerId}
                    />
                </div>

                <div className="pic-game__center">
                    <DrawingCanvas
                        strokes={strokes}
                        isDrawing={isDrawing}
                        onSendStroke={onSendStroke}
                        onClearCanvas={onClearCanvas}
                        onUndo={onUndo}
                    />
                </div>

                <div className="pic-game__sidebar pic-game__sidebar--right">
                    <GuessingChat
                        messages={messages}
                        onSendGuess={onSendGuess}
                        isDrawing={isDrawing}
                        hasGuessed={hasGuessed}
                        playerId={playerId}
                    />
                </div>
            </div>
        </div>
    );
}