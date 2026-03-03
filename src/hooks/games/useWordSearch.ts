import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type { Player } from '../../types/common';
import type {
    WordSearchPhase,
    WordSearchCategory,
    GridCell,
    WordPlacement,
    PlayerScore,
    FindWordResult,
    WordFoundEvent,
    GameResults,
    HintData,
} from '../../types/games/word-search';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */

interface WordSearchState {
    phase: WordSearchPhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: Player[];
    maxRounds: number;

    // Round data
    currentRound: number;
    category: WordSearchCategory | null;
    grid: string[][];
    gridSize: number;
    words: string[];
    foundWords: Map<string, { playerId: string; playerName: string; cells: GridCell[] }>;
    placements: WordPlacement[];
    timeRemaining: number;
    countdown: number;

    // Selection state
    selecting: boolean;
    selectionStart: GridCell | null;
    selectionCurrent: GridCell | null;
    selectedCells: GridCell[];

    // Scores
    scores: PlayerScore[];
    finalResults: GameResults | null;

    // Hint
    hint: HintData | null;

    // Feedback
    lastFindResult: FindWordResult | null;
    playerLeftMessage: string | null;
    error: string | null;
}

type Action =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; players: Player[]; status: string; maxRounds: number }
    | { type: 'COUNTDOWN'; roundIndex: number; maxRounds: number; category: WordSearchCategory; countdown: number }
    | { type: 'TICK_COUNTDOWN' }
    | { type: 'ROUND_START'; roundIndex: number; maxRounds: number; category: WordSearchCategory; grid: string[][]; gridSize: number; words: string[]; duration: number }
    | { type: 'TICK_TIMER' }
    | { type: 'SELECTION_START'; cell: GridCell }
    | { type: 'SELECTION_MOVE'; cell: GridCell }
    | { type: 'SELECTION_END' }
    | { type: 'SELECTION_CANCEL' }
    | { type: 'FIND_WORD_RESULT'; result: FindWordResult }
    | { type: 'WORD_FOUND'; event: WordFoundEvent }
    | { type: 'HINT'; data: HintData }
    | { type: 'ROUND_END'; placements: WordPlacement[]; scores: PlayerScore[] }
    | { type: 'BETWEEN_ROUNDS'; scores: PlayerScore[] }
    | { type: 'GAME_FINISHED'; results: GameResults }
    | { type: 'GAME_OVER'; message: string; scores: any }
    | { type: 'PLAYER_LEFT'; playerName: string }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'CLEAR_FIND_RESULT' }
    | { type: 'RESET' };

const initialState: WordSearchState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    maxRounds: 3,
    currentRound: -1,
    category: null,
    grid: [],
    gridSize: 14,
    words: [],
    foundWords: new Map(),
    placements: [],
    timeRemaining: 0,
    countdown: 0,
    selecting: false,
    selectionStart: null,
    selectionCurrent: null,
    selectedCells: [],
    scores: [],
    finalResults: null,
    hint: null,
    lastFindResult: null,
    playerLeftMessage: null,
    error: null,
};

/**
 * Given a start and end cell, compute all cells in a straight line between them.
 * Returns empty array if they don't form a valid line (horizontal, vertical, or diagonal).
 */
function computeLineCells(start: GridCell, end: GridCell): GridCell[] {
    const dr = Math.sign(end.row - start.row);
    const dc = Math.sign(end.col - start.col);
    const rowDist = Math.abs(end.row - start.row);
    const colDist = Math.abs(end.col - start.col);

    // Must be a straight line: horizontal, vertical, or 45° diagonal
    if (rowDist !== colDist && rowDist !== 0 && colDist !== 0) return [];

    const steps = Math.max(rowDist, colDist);
    const cells: GridCell[] = [];
    for (let i = 0; i <= steps; i++) {
        cells.push({ row: start.row + dr * i, col: start.col + dc * i });
    }
    return cells;
}

function reducer(state: WordSearchState, action: Action): WordSearchState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_JOINED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_UPDATE':
            return { ...state, players: action.players, maxRounds: action.maxRounds };

        case 'COUNTDOWN':
            return {
                ...state,
                phase: 'countdown',
                currentRound: action.roundIndex,
                maxRounds: action.maxRounds,
                category: action.category,
                countdown: action.countdown,
                hint: null,
                foundWords: new Map(),
                placements: [],
                lastFindResult: null,
            };

        case 'TICK_COUNTDOWN':
            return { ...state, countdown: Math.max(0, state.countdown - 1) };

        case 'ROUND_START':
            return {
                ...state,
                phase: 'playing',
                currentRound: action.roundIndex,
                maxRounds: action.maxRounds,
                category: action.category,
                grid: action.grid,
                gridSize: action.gridSize,
                words: action.words,
                timeRemaining: action.duration,
                foundWords: new Map(),
                placements: [],
                hint: null,
                selecting: false,
                selectionStart: null,
                selectionCurrent: null,
                selectedCells: [],
            };

        case 'TICK_TIMER':
            return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) };

        case 'SELECTION_START':
            return {
                ...state,
                selecting: true,
                selectionStart: action.cell,
                selectionCurrent: action.cell,
                selectedCells: [action.cell],
            };

        case 'SELECTION_MOVE': {
            if (!state.selecting || !state.selectionStart) return state;
            const cells = computeLineCells(state.selectionStart, action.cell);
            return {
                ...state,
                selectionCurrent: action.cell,
                selectedCells: cells.length > 0 ? cells : state.selectedCells,
            };
        }

        case 'SELECTION_END':
            return {
                ...state,
                selecting: false,
            };

        case 'SELECTION_CANCEL':
            return {
                ...state,
                selecting: false,
                selectionStart: null,
                selectionCurrent: null,
                selectedCells: [],
            };

        case 'FIND_WORD_RESULT': {
            if (action.result.success && action.result.cells) {
                // Clear selection after successful find
                return {
                    ...state,
                    lastFindResult: action.result,
                    selecting: false,
                    selectionStart: null,
                    selectionCurrent: null,
                    selectedCells: [],
                };
            }
            return {
                ...state,
                lastFindResult: action.result,
                selecting: false,
                selectionStart: null,
                selectionCurrent: null,
                selectedCells: [],
            };
        }

        case 'WORD_FOUND': {
            const newFound = new Map(state.foundWords);
            newFound.set(action.event.word, {
                playerId: action.event.playerId,
                playerName: action.event.playerName,
                cells: action.event.cells,
            });
            return {
                ...state,
                foundWords: newFound,
                scores: action.event.scores,
            };
        }

        case 'HINT':
            return { ...state, hint: action.data };

        case 'ROUND_END':
            return {
                ...state,
                phase: 'round-end',
                placements: action.placements,
                scores: action.scores,
                selecting: false,
                selectionStart: null,
                selectionCurrent: null,
                selectedCells: [],
            };

        case 'BETWEEN_ROUNDS':
            return { ...state, phase: 'between-rounds', scores: action.scores };

        case 'GAME_FINISHED':
            return { ...state, phase: 'results', finalResults: action.results };

        case 'GAME_OVER':
            return { ...state, phase: 'results', playerLeftMessage: action.message };

        case 'PLAYER_LEFT':
            return { ...state, playerLeftMessage: `${action.playerName} se desconectó.` };

        case 'SET_ERROR':
            return { ...state, error: action.message };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        case 'CLEAR_FIND_RESULT':
            return { ...state, lastFindResult: null };

        case 'RESET':
            return initialState;

        default:
            return state;
    }
}

/* ═══════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════ */

export function useWordSearch() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/word-search',
    });
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Socket listeners ──
    useEffect(() => {
        if (!socket) return;

        const handlers: Record<string, (...args: any[]) => void> = {
            'room-created': (data: { code: string; playerId: string }) => {
                dispatch({ type: 'ROOM_CREATED', code: data.code, playerId: data.playerId });
            },
            'room-joined': (data: { code: string; playerId: string }) => {
                dispatch({ type: 'ROOM_JOINED', code: data.code, playerId: data.playerId });
            },
            'room-update': (data: { players: Player[]; status: string; maxRounds: number }) => {
                dispatch({ type: 'ROOM_UPDATE', players: data.players, status: data.status, maxRounds: data.maxRounds });
            },
            'round-countdown': (data: any) => {
                dispatch({
                    type: 'COUNTDOWN',
                    roundIndex: data.roundIndex,
                    maxRounds: data.maxRounds,
                    category: data.category,
                    countdown: data.countdown,
                });
            },
            'round-start': (data: any) => {
                dispatch({
                    type: 'ROUND_START',
                    roundIndex: data.roundIndex,
                    maxRounds: data.maxRounds,
                    category: data.category,
                    grid: data.grid,
                    gridSize: data.gridSize,
                    words: data.words,
                    duration: data.duration,
                });
            },
            'find-word-result': (data: FindWordResult) => {
                dispatch({ type: 'FIND_WORD_RESULT', result: data });
            },
            'word-found': (data: WordFoundEvent) => {
                dispatch({ type: 'WORD_FOUND', event: data });
            },
            'hint': (data: HintData) => {
                dispatch({ type: 'HINT', data });
            },
            'round-end': (data: any) => {
                dispatch({ type: 'ROUND_END', placements: data.placements, scores: data.scores });
            },
            'waiting-next-round': (data: any) => {
                dispatch({ type: 'BETWEEN_ROUNDS', scores: data.scores });
            },
            'game-finished': (data: GameResults) => {
                dispatch({ type: 'GAME_FINISHED', results: data });
            },
            'game-over': (data: any) => {
                dispatch({ type: 'GAME_OVER', message: data.message, scores: data.scores });
            },
            'player-left': (data: { playerName: string }) => {
                dispatch({ type: 'PLAYER_LEFT', playerName: data.playerName });
            },
            'error': (data: { message: string }) => {
                dispatch({ type: 'SET_ERROR', message: data.message });
            },
        };

        Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
        return () => {
            Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
        };
    }, [socket]);

    // ── Round timer ──
    useEffect(() => {
        if (state.phase === 'playing' && state.timeRemaining > 0) {
            timerRef.current = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        }
        if (timerRef.current) clearInterval(timerRef.current);
    }, [state.phase, state.timeRemaining > 0]);

    // ── Countdown timer ──
    useEffect(() => {
        if (state.phase === 'countdown' && state.countdown > 0) {
            countdownRef.current = setInterval(() => dispatch({ type: 'TICK_COUNTDOWN' }), 1000);
            return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
        }
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, [state.phase, state.countdown > 0]);

    // ── Auto-clear find result feedback ──
    useEffect(() => {
        if (state.lastFindResult) {
            const t = setTimeout(() => dispatch({ type: 'CLEAR_FIND_RESULT' }), 2000);
            return () => clearTimeout(t);
        }
    }, [state.lastFindResult]);

    // ── Actions ──
    const setPlayerName = useCallback((name: string) => dispatch({ type: 'SET_NAME', name }), []);

    const createRoom = useCallback((rounds = 3) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim(), rounds });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((code: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const toggleReady = useCallback(() => {
        if (!socket) return;
        socket.emit('toggle-ready', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const startSelection = useCallback((cell: GridCell) => {
        dispatch({ type: 'SELECTION_START', cell });
    }, []);

    const moveSelection = useCallback((cell: GridCell) => {
        dispatch({ type: 'SELECTION_MOVE', cell });
    }, []);

    const endSelection = useCallback(() => {
        if (!socket || !state.selectionStart || state.selectedCells.length < 2) {
            dispatch({ type: 'SELECTION_CANCEL' });
            return;
        }

        // Build the word from selected cells
        const word = state.selectedCells.map(c => state.grid[c.row]?.[c.col] || '').join('');

        socket.emit('find-word', {
            roomCode: state.roomCode,
            word,
            cells: state.selectedCells,
        });

        dispatch({ type: 'SELECTION_END' });
    }, [socket, state.roomCode, state.selectionStart, state.selectedCells, state.grid]);

    const requestHint = useCallback(() => {
        if (!socket) return;
        socket.emit('request-hint', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const requestResults = useCallback(() => {
        if (!socket) return;
        socket.emit('get-results', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    // ── Derived ──
    const wordsRemaining = state.words.length - state.foundWords.size;
    const myFoundWords = [...state.foundWords.entries()]
        .filter(([, info]) => info.playerId === state.playerId)
        .map(([word]) => word);

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,
        wordsRemaining,
        myFoundWords,
        setPlayerName,
        createRoom,
        joinRoom,
        toggleReady,
        startSelection,
        moveSelection,
        endSelection,
        requestHint,
        requestResults,
        clearError,
        reset,
    };
}