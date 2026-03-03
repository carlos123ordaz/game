import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type {
    PictionaryPhase,
    PictionaryPlayer,
    WordOption,
    Stroke,
    ChatMessage,
    TurnEndData,
    GameEndData,
    GameRestoreData,
} from '../../types/games/pictionary';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */

interface PictionaryState {
    phase: PictionaryPhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: PictionaryPlayer[];
    hostId: string;

    // Turn state
    currentRound: number;
    totalRounds: number;
    drawerId: string;
    drawerName: string;
    isDrawing: boolean;
    wordOptions: WordOption[];
    currentWord: string | null;
    hint: string | null;
    wordLength: number;
    category: string;
    timeLeft: number;

    // Canvas
    strokes: Stroke[];

    // Chat
    messages: ChatMessage[];
    guessedPlayerIds: string[];

    // Turn end
    turnEndData: TurnEndData | null;

    // Game end
    gameEndData: GameEndData | null;

    error: string | null;
}

type PictionaryAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; players: PictionaryPlayer[]; hostId: string; status: string }
    | { type: 'GAME_STARTED'; totalRounds: number; players: PictionaryPlayer[] }
    | { type: 'TURN_START'; drawerId: string; drawerName: string; currentRound: number; totalRounds: number; players: PictionaryPlayer[] }
    | { type: 'WORD_OPTIONS'; options: WordOption[] }
    | { type: 'WORD_CONFIRMED'; word: string }
    | { type: 'WORD_SELECTED'; wordLength: number; hint: string; category: string }
    | { type: 'DRAW_STROKE'; stroke: Stroke }
    | { type: 'CLEAR_CANVAS' }
    | { type: 'UNDO_STROKE'; strokes: Stroke[] }
    | { type: 'TIMER_UPDATE'; timeLeft: number }
    | { type: 'HINT_UPDATE'; hint: string }
    | { type: 'CHAT_MESSAGE'; message: ChatMessage }
    | { type: 'CORRECT_GUESS'; playerId: string; playerName: string; points: number; isFirst: boolean; players: PictionaryPlayer[] }
    | { type: 'TURN_END'; data: TurnEndData }
    | { type: 'GAME_END'; data: GameEndData }
    | { type: 'GAME_STATE_RESTORE'; data: GameRestoreData; players: PictionaryPlayer[]; hostId: string }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

const initialState: PictionaryState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    hostId: '',
    currentRound: 0,
    totalRounds: 0,
    drawerId: '',
    drawerName: '',
    isDrawing: false,
    wordOptions: [],
    currentWord: null,
    hint: null,
    wordLength: 0,
    category: '',
    timeLeft: 0,
    strokes: [],
    messages: [],
    guessedPlayerIds: [],
    turnEndData: null,
    gameEndData: null,
    error: null,
};

function reducer(state: PictionaryState, action: PictionaryAction): PictionaryState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_JOINED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_UPDATE':
            return { ...state, players: action.players, hostId: action.hostId };

        case 'GAME_STARTED':
            return { ...state, totalRounds: action.totalRounds, players: action.players };

        case 'TURN_START':
            return {
                ...state,
                phase: action.drawerId === state.playerId ? 'word-select' : 'drawing',
                drawerId: action.drawerId,
                drawerName: action.drawerName,
                currentRound: action.currentRound,
                totalRounds: action.totalRounds,
                isDrawing: action.drawerId === state.playerId,
                currentWord: null,
                hint: null,
                wordLength: 0,
                category: '',
                strokes: [],
                messages: [],
                guessedPlayerIds: [],
                turnEndData: null,
                wordOptions: [],
                timeLeft: 0,
                players: action.players,
            };

        case 'WORD_OPTIONS':
            return { ...state, wordOptions: action.options };

        case 'WORD_CONFIRMED':
            return { ...state, phase: 'drawing', currentWord: action.word, wordOptions: [] };

        case 'WORD_SELECTED':
            return { ...state, phase: 'drawing', wordLength: action.wordLength, hint: action.hint, category: action.category };

        case 'DRAW_STROKE':
            return { ...state, strokes: [...state.strokes, action.stroke] };

        case 'CLEAR_CANVAS':
            return { ...state, strokes: [] };

        case 'UNDO_STROKE':
            return { ...state, strokes: action.strokes };

        case 'TIMER_UPDATE':
            return { ...state, timeLeft: action.timeLeft };

        case 'HINT_UPDATE':
            return { ...state, hint: action.hint };

        case 'CHAT_MESSAGE':
            return { ...state, messages: [...state.messages, action.message] };

        case 'CORRECT_GUESS':
            return {
                ...state,
                guessedPlayerIds: [...state.guessedPlayerIds, action.playerId],
                players: action.players,
            };

        case 'TURN_END':
            return { ...state, phase: 'turn-end', turnEndData: action.data, players: action.data.players };

        case 'GAME_END':
            return { ...state, phase: 'game-end', gameEndData: action.data };

        case 'GAME_STATE_RESTORE': {
            const d = action.data;
            if (!d) return { ...state, players: action.players, hostId: action.hostId };
            return {
                ...state,
                phase: 'drawing',
                players: action.players,
                hostId: action.hostId,
                currentRound: d.currentRound,
                totalRounds: d.totalRounds,
                drawerId: d.drawerId,
                drawerName: d.drawerName,
                isDrawing: d.isDrawing,
                currentWord: d.word,
                hint: d.hint,
                wordLength: d.wordLength,
                strokes: d.strokes,
                messages: d.messages,
                guessedPlayerIds: d.guessedPlayerIds,
                timeLeft: d.timeLeft,
            };
        }

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

export function usePictionary() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/pictionary',
    });
    const stateRef = useRef(state);
    stateRef.current = state;

    // ── Socket listeners ──
    useEffect(() => {
        if (!socket) return;

        const on = (event: string, handler: (...args: any[]) => void) => {
            socket.on(event, handler);
        };

        on('room-created', (d: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_CREATED', code: d.code, playerId: d.playerId });
            // Store for reconnect
            try {
                sessionStorage.setItem('pictionary-room', d.code);
                sessionStorage.setItem('pictionary-player', d.playerId);
            } catch { }
        });

        on('room-joined', (d: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_JOINED', code: d.code, playerId: d.playerId });
            try {
                sessionStorage.setItem('pictionary-room', d.code);
                sessionStorage.setItem('pictionary-player', d.playerId);
            } catch { }
        });

        on('room-update', (d: { players: PictionaryPlayer[]; hostId: string; status: string }) => {
            dispatch({ type: 'ROOM_UPDATE', ...d });
        });

        on('game-started', (d: { totalRounds: number; players: PictionaryPlayer[] }) => {
            dispatch({ type: 'GAME_STARTED', ...d });
        });

        on('turn-start', (d: any) => {
            dispatch({ type: 'TURN_START', ...d });
        });

        on('word-options', (d: { options: WordOption[] }) => {
            dispatch({ type: 'WORD_OPTIONS', options: d.options });
        });

        on('word-confirmed', (d: { word: string }) => {
            dispatch({ type: 'WORD_CONFIRMED', word: d.word });
        });

        on('word-selected', (d: { wordLength: number; hint: string; category: string }) => {
            dispatch({ type: 'WORD_SELECTED', ...d });
        });

        on('draw-stroke', (stroke: Stroke) => {
            dispatch({ type: 'DRAW_STROKE', stroke });
        });

        on('clear-canvas', () => {
            dispatch({ type: 'CLEAR_CANVAS' });
        });

        on('undo-stroke', (d: { strokes: Stroke[] }) => {
            dispatch({ type: 'UNDO_STROKE', strokes: d.strokes });
        });

        on('timer-update', (d: { timeLeft: number }) => {
            dispatch({ type: 'TIMER_UPDATE', timeLeft: d.timeLeft });
        });

        on('hint-update', (d: { hint: string }) => {
            dispatch({ type: 'HINT_UPDATE', hint: d.hint });
        });

        on('chat-message', (msg: ChatMessage) => {
            dispatch({ type: 'CHAT_MESSAGE', message: msg });
        });

        on('correct-guess', (d: any) => {
            dispatch({ type: 'CORRECT_GUESS', ...d });
        });

        on('turn-end', (d: TurnEndData) => {
            dispatch({ type: 'TURN_END', data: d });
        });

        on('game-end', (d: GameEndData) => {
            dispatch({ type: 'GAME_END', data: d });
        });

        on('game-state-restore', (d: any) => {
            dispatch({ type: 'GAME_STATE_RESTORE', data: d.gameData, players: d.players, hostId: d.hostId });
        });

        on('kicked', () => {
            dispatch({ type: 'SET_ERROR', message: 'Has sido expulsado de la sala.' });
            dispatch({ type: 'RESET' });
        });

        on('error', (d: { message: string }) => {
            dispatch({ type: 'SET_ERROR', message: d.message });
        });

        return () => {
            socket.removeAllListeners();
        };
    }, [socket]);

    // ── Auto-reconnect ──
    useEffect(() => {
        if (!socket || !isConnected) return;
        try {
            const savedRoom = sessionStorage.getItem('pictionary-room');
            const savedPlayer = sessionStorage.getItem('pictionary-player');
            if (savedRoom && savedPlayer && !stateRef.current.roomCode) {
                socket.emit('reconnect-player', { roomCode: savedRoom, playerId: savedPlayer });
            }
        } catch { }
    }, [socket, isConnected]);

    // ── Actions ──
    const createRoom = useCallback(() => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((code: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const startGame = useCallback(() => {
        if (!socket) return;
        socket.emit('start-game');
    }, [socket]);

    const selectWord = useCallback((index: number) => {
        if (!socket) return;
        socket.emit('select-word', { wordIndex: index });
    }, [socket]);

    const sendStroke = useCallback((stroke: Stroke) => {
        if (!socket) return;
        socket.emit('draw-stroke', stroke);
        dispatch({ type: 'DRAW_STROKE', stroke });
    }, [socket]);

    const clearCanvas = useCallback(() => {
        if (!socket) return;
        socket.emit('clear-canvas');
        dispatch({ type: 'CLEAR_CANVAS' });
    }, [socket]);

    const undoStroke = useCallback(() => {
        if (!socket) return;
        socket.emit('undo-stroke');
    }, [socket]);

    const sendGuess = useCallback((text: string) => {
        if (!socket) return;
        socket.emit('guess', { text });
    }, [socket]);

    const kickPlayer = useCallback((targetPlayerId: string) => {
        if (!socket) return;
        socket.emit('kick-player', { targetPlayerId });
    }, [socket]);

    const setPlayerName = useCallback((name: string) => {
        dispatch({ type: 'SET_NAME', name });
    }, []);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

    const reset = useCallback(() => {
        try {
            sessionStorage.removeItem('pictionary-room');
            sessionStorage.removeItem('pictionary-player');
        } catch { }
        dispatch({ type: 'RESET' });
    }, []);

    // ── Derived ──
    const isHost = state.playerId === state.hostId;
    const canStart = isHost && state.players.filter(p => p.connected).length >= 2;
    const hasGuessed = state.guessedPlayerIds.includes(state.playerId);

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,
        isHost,
        canStart,
        hasGuessed,
        setPlayerName,
        createRoom,
        joinRoom,
        startGame,
        selectWord,
        sendStroke,
        clearCanvas,
        undoStroke,
        sendGuess,
        kickPlayer,
        clearError,
        reset,
    };
}