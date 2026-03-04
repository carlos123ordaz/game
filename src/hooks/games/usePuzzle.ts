import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type { Player } from '../../types/common';
import type {
    PuzzleDifficulty,
    PuzzlePhase,
    PuzzleImage,
    PuzzleGameConfig,
    OpponentProgress,
    PuzzleResults,
} from '../../types/games/puzzle';

/* ═══════════════════════════════════════════
   PUZZLE STATE — Reducer pattern
   ═══════════════════════════════════════════ */

interface PuzzleState {
    phase: PuzzlePhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: Player[];
    difficulty: PuzzleDifficulty;
    imageIndex: number;

    // Game
    gridSize: number;
    timeLimit: number;
    image: PuzzleImage | null;
    seed: number;
    pieces: number[];             // current board: pieces[slotIndex] = pieceId
    moves: number;
    correctCount: number;
    startTime: number | null;
    elapsed: number;
    countdownSeconds: number;

    // Opponent
    opponentProgress: number;
    opponentMoves: number;
    opponentName: string;
    opponentCompleted: boolean;

    // Results
    results: PuzzleResults | null;
    error: string | null;
}

type PuzzleAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; players: Player[]; difficulty: PuzzleDifficulty; imageIndex: number }
    | { type: 'SETTINGS_UPDATED'; difficulty: PuzzleDifficulty; imageIndex: number }
    | { type: 'COUNTDOWN'; seconds: number }
    | { type: 'GAME_START'; config: PuzzleGameConfig }
    | { type: 'SWAP_PIECES'; fromIndex: number; toIndex: number }
    | { type: 'TICK'; elapsed: number }
    | { type: 'OPPONENT_PROGRESS'; data: OpponentProgress }
    | { type: 'OPPONENT_COMPLETED'; playerName: string }
    | { type: 'PLAYER_LEFT'; playerName: string }
    | { type: 'GAME_OVER'; results: PuzzleResults }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

const initialState: PuzzleState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    difficulty: 'medium',
    imageIndex: 0,
    gridSize: 4,
    timeLimit: 180,
    image: null,
    seed: 0,
    pieces: [],
    moves: 0,
    correctCount: 0,
    startTime: null,
    elapsed: 0,
    countdownSeconds: 0,
    opponentProgress: 0,
    opponentMoves: 0,
    opponentName: '',
    opponentCompleted: false,
    results: null,
    error: null,
};

function countCorrect(pieces: number[]): number {
    return pieces.reduce((count, pieceId, slotIndex) => count + (pieceId === slotIndex ? 1 : 0), 0);
}

function puzzleReducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_JOINED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_UPDATE':
            return {
                ...state,
                players: action.players,
                difficulty: action.difficulty,
                imageIndex: action.imageIndex,
            };

        case 'SETTINGS_UPDATED':
            return { ...state, difficulty: action.difficulty, imageIndex: action.imageIndex };

        case 'COUNTDOWN':
            return { ...state, phase: 'countdown', countdownSeconds: action.seconds };

        case 'GAME_START': {
            const { gridSize, timeLimit, image, seed, shuffledPieces, imageIndex } = action.config;
            return {
                ...state,
                phase: 'playing',
                gridSize,
                timeLimit,
                image,
                imageIndex,
                seed,
                pieces: [...shuffledPieces],
                moves: 0,
                correctCount: countCorrect(shuffledPieces),
                startTime: Date.now(),
                elapsed: 0,
                opponentProgress: 0,
                opponentMoves: 0,
                opponentCompleted: false,
            };
        }

        case 'SWAP_PIECES': {
            const newPieces = [...state.pieces];
            [newPieces[action.fromIndex], newPieces[action.toIndex]] =
                [newPieces[action.toIndex], newPieces[action.fromIndex]];
            return {
                ...state,
                pieces: newPieces,
                moves: state.moves + 1,
                correctCount: countCorrect(newPieces),
            };
        }

        case 'TICK':
            return { ...state, elapsed: action.elapsed };

        case 'OPPONENT_PROGRESS':
            return {
                ...state,
                opponentProgress: action.data.progress,
                opponentMoves: action.data.moves,
                opponentName: action.data.playerName,
            };

        case 'OPPONENT_COMPLETED':
            return { ...state, opponentCompleted: true, opponentName: action.playerName };

        case 'PLAYER_LEFT':
            return { ...state, error: `${action.playerName} abandonó la partida` };

        case 'GAME_OVER':
            return { ...state, phase: 'finished', results: action.results };

        case 'SET_ERROR':
            return { ...state, error: action.message };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

/* ═══════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════ */

export function usePuzzle() {
    const [state, dispatch] = useReducer(puzzleReducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/puzzle',
    });
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Timer ──
    useEffect(() => {
        if (state.phase === 'playing' && state.startTime) {
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - state.startTime!) / 1000);
                dispatch({ type: 'TICK', elapsed });
            }, 250);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.phase, state.startTime]);

    // ── Socket listeners ──
    useEffect(() => {
        if (!socket) return;

        const onRoomCreated = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_CREATED', code: data.code, playerId: data.playerId });
        };

        const onRoomJoined = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_JOINED', code: data.code, playerId: data.playerId });
        };

        const onRoomUpdate = (data: { players: Player[]; difficulty: PuzzleDifficulty; imageIndex: number }) => {
            dispatch({ type: 'ROOM_UPDATE', players: data.players, difficulty: data.difficulty, imageIndex: data.imageIndex });
        };

        const onSettingsUpdated = (data: { difficulty: PuzzleDifficulty; imageIndex: number }) => {
            dispatch({ type: 'SETTINGS_UPDATED', difficulty: data.difficulty, imageIndex: data.imageIndex });
        };

        const onCountdown = (data: { seconds: number }) => {
            dispatch({ type: 'COUNTDOWN', seconds: data.seconds });
        };

        const onGameStart = (config: PuzzleGameConfig) => {
            dispatch({ type: 'GAME_START', config });
        };

        const onOpponentProgress = (data: OpponentProgress) => {
            dispatch({ type: 'OPPONENT_PROGRESS', data });
        };

        const onOpponentCompleted = (data: { playerName: string }) => {
            dispatch({ type: 'OPPONENT_COMPLETED', playerName: data.playerName });
        };

        const onPlayerLeft = (data: { playerName: string }) => {
            dispatch({ type: 'PLAYER_LEFT', playerName: data.playerName });
        };

        const onGameOver = (results: PuzzleResults) => {
            dispatch({ type: 'GAME_OVER', results });
        };

        const onError = (data: { message: string }) => {
            dispatch({ type: 'SET_ERROR', message: data.message });
        };

        socket.on('room-created', onRoomCreated);
        socket.on('room-joined', onRoomJoined);
        socket.on('room-update', onRoomUpdate);
        socket.on('settings-updated', onSettingsUpdated);
        socket.on('game-countdown', onCountdown);
        socket.on('game-start', onGameStart);
        socket.on('opponent-progress', onOpponentProgress);
        socket.on('opponent-completed', onOpponentCompleted);
        socket.on('player-left', onPlayerLeft);
        socket.on('game-over', onGameOver);
        socket.on('error', onError);

        return () => {
            socket.off('room-created', onRoomCreated);
            socket.off('room-joined', onRoomJoined);
            socket.off('room-update', onRoomUpdate);
            socket.off('settings-updated', onSettingsUpdated);
            socket.off('game-countdown', onCountdown);
            socket.off('game-start', onGameStart);
            socket.off('opponent-progress', onOpponentProgress);
            socket.off('opponent-completed', onOpponentCompleted);
            socket.off('player-left', onPlayerLeft);
            socket.off('game-over', onGameOver);
            socket.off('error', onError);
        };
    }, [socket]);

    // ── Actions ──
    const createRoom = useCallback(() => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const joinRoom = useCallback(
        (roomCode: string) => {
            if (!socket || !state.playerName.trim()) return;
            socket.emit('join-room', {
                roomCode: roomCode.toUpperCase(),
                playerName: state.playerName.trim(),
            });
        },
        [socket, state.playerName]
    );

    const changeSettings = useCallback(
        (difficulty?: PuzzleDifficulty, imageIndex?: number) => {
            if (!socket) return;
            socket.emit('change-settings', {
                roomCode: state.roomCode,
                difficulty,
                imageIndex,
            });
        },
        [socket, state.roomCode]
    );

    const swapPieces = useCallback(
        (fromIndex: number, toIndex: number) => {
            if (!socket || state.phase !== 'playing') return;
            if (fromIndex === toIndex) return;

            // Optimistic update
            dispatch({ type: 'SWAP_PIECES', fromIndex, toIndex });

            // Calculate new state after swap
            const newPieces = [...state.pieces];
            [newPieces[fromIndex], newPieces[toIndex]] = [newPieces[toIndex], newPieces[fromIndex]];
            const correct = newPieces.reduce((c, pid, sid) => c + (pid === sid ? 1 : 0), 0);

            socket.emit('move-piece', {
                roomCode: state.roomCode,
                fromIndex,
                toIndex,
                pieces: newPieces,
                correctCount: correct,
                moveCount: state.moves + 1,
            });
        },
        [socket, state.roomCode, state.pieces, state.moves, state.phase]
    );

    const setPlayerName = useCallback((name: string) => {
        dispatch({ type: 'SET_NAME', name });
    }, []);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    // ── Derived ──
    const totalPieces = state.gridSize * state.gridSize;
    const myProgress = totalPieces > 0
        ? Math.round((state.correctCount / totalPieces) * 100)
        : 0;
    const isComplete = state.correctCount === totalPieces && totalPieces > 0;
    const timeRemaining = Math.max(0, state.timeLimit - state.elapsed);

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,

        // Derived
        totalPieces,
        myProgress,
        isComplete,
        timeRemaining,

        // Actions
        setPlayerName,
        createRoom,
        joinRoom,
        changeSettings,
        swapPieces,
        clearError,
        reset,
    };
}