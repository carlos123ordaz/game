import type { PuzzleImage } from '../../../types/games/puzzle';
import { PuzzleBoard } from './PuzzleBoard';

interface PuzzleGameProps {
    pieces: number[];
    gridSize: number;
    image: PuzzleImage | null;
    moves: number;
    myProgress: number;
    correctCount: number;
    totalPieces: number;
    elapsed: number;
    timeRemaining: number;
    timeLimit: number;
    opponentProgress: number;
    opponentMoves: number;
    opponentName: string;
    opponentCompleted: boolean;
    playerName: string;
    isComplete: boolean;
    onSwap: (from: number, to: number) => void;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PuzzleGame({
    pieces,
    gridSize,
    image,
    moves,
    myProgress,
    correctCount,
    totalPieces,
    elapsed,
    timeRemaining,
    timeLimit,
    opponentProgress,
    opponentMoves,
    opponentName,
    opponentCompleted,
    playerName,
    isComplete,
    onSwap,
}: PuzzleGameProps) {
    const timePercentage = (timeRemaining / timeLimit) * 100;
    const isLowTime = timeRemaining <= 30;

    return (
        <div className="puzzle-game">
            {/* Timer bar */}
            <div className={`puzzle-game__timer ${isLowTime ? 'puzzle-game__timer--danger' : ''}`}>
                <div className="puzzle-game__timer-bar">
                    <div
                        className="puzzle-game__timer-fill"
                        style={{ width: `${timePercentage}%` }}
                    />
                </div>
                <span className="puzzle-game__timer-text">
                    ⏱️ {formatTime(timeRemaining)}
                </span>
            </div>

            {/* Progress comparison */}
            <div className="puzzle-game__versus">
                <div className="puzzle-game__player-card puzzle-game__player-card--me">
                    <span className="puzzle-game__player-name">🧩 {playerName}</span>
                    <div className="puzzle-game__progress-bar">
                        <div
                            className="puzzle-game__progress-fill puzzle-game__progress-fill--me"
                            style={{ width: `${myProgress}%` }}
                        />
                    </div>
                    <div className="puzzle-game__player-stats">
                        <span>{myProgress}%</span>
                        <span>{correctCount}/{totalPieces} piezas</span>
                        <span>{moves} movimientos</span>
                    </div>
                </div>

                <div className="puzzle-game__vs-divider">VS</div>

                <div className="puzzle-game__player-card puzzle-game__player-card--opponent">
                    <span className="puzzle-game__player-name">
                        🎮 {opponentName || 'Oponente'}
                        {opponentCompleted && ' ✅'}
                    </span>
                    <div className="puzzle-game__progress-bar">
                        <div
                            className="puzzle-game__progress-fill puzzle-game__progress-fill--opponent"
                            style={{ width: `${opponentProgress}%` }}
                        />
                    </div>
                    <div className="puzzle-game__player-stats">
                        <span>{opponentProgress}%</span>
                        <span>{opponentMoves} movimientos</span>
                    </div>
                </div>
            </div>

            {/* Opponent completed warning */}
            {opponentCompleted && !isComplete && (
                <div className="puzzle-game__alert puzzle-game__alert--warning">
                    ⚡ ¡{opponentName} terminó! ¡Apúrate!
                </div>
            )}

            {/* Puzzle board */}
            <div className="puzzle-game__board-container">
                <PuzzleBoard
                    pieces={pieces}
                    gridSize={gridSize}
                    image={image || { id: 0, name: 'Puzzle', emoji: '🧩', url: '' }}
                    onSwap={onSwap}
                    disabled={isComplete}
                />
            </div>

            {isComplete && (
                <div className="puzzle-game__alert puzzle-game__alert--success">
                    🎉 ¡Completaste el rompecabezas en {formatTime(elapsed)} con {moves} movimientos!
                </div>
            )}

            <p className="puzzle-game__hint">
                Arrastra las piezas o toca dos piezas para intercambiarlas
            </p>
        </div>
    );
}