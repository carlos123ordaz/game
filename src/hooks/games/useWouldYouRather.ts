import { useCallback, useEffect, useReducer } from 'react';
import { useSocket } from '../useSocket';
import type { Player } from '../../types/common';
import type {
    Dilemma,
    DilemmaChoice,
    DilemmaAnswer,
    WYRResults,
    WYRPhase,
} from '../../types/games/wouldYouRather';

/* ═══════════════════════════════════════════
   WYR STATE — Reducer pattern
   ═══════════════════════════════════════════ */

interface WYRState {
    phase: WYRPhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: Player[];
    dilemmas: Dilemma[];
    answers: DilemmaAnswer;
    currentDilemma: number;
    partnerAnswered: boolean;
    results: WYRResults | null;
    error: string | null;
}

type WYRAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; players: Player[] }
    | { type: 'GAME_START'; dilemmas: Dilemma[] }
    | { type: 'ANSWER_DILEMMA'; dilemmaId: number; choice: DilemmaChoice }
    | { type: 'NEXT_DILEMMA' }
    | { type: 'PREV_DILEMMA' }
    | { type: 'SUBMIT' }
    | { type: 'PARTNER_ANSWERED' }
    | { type: 'SHOW_RESULTS' }
    | { type: 'SET_RESULTS'; results: WYRResults }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

const initialState: WYRState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    dilemmas: [],
    answers: {},
    currentDilemma: 0,
    partnerAnswered: false,
    results: null,
    error: null,
};

function wyrReducer(state: WYRState, action: WYRAction): WYRState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return {
                ...state,
                phase: 'lobby',
                roomCode: action.code,
                playerId: action.playerId,
            };

        case 'ROOM_JOINED':
            return {
                ...state,
                phase: 'lobby',
                roomCode: action.code,
                playerId: action.playerId,
            };

        case 'ROOM_UPDATE':
            return { ...state, players: action.players };

        case 'GAME_START':
            return {
                ...state,
                phase: 'playing',
                dilemmas: action.dilemmas,
                currentDilemma: 0,
                answers: {},
            };

        case 'ANSWER_DILEMMA':
            return {
                ...state,
                answers: { ...state.answers, [action.dilemmaId]: action.choice },
            };

        case 'NEXT_DILEMMA':
            return {
                ...state,
                currentDilemma: Math.min(state.currentDilemma + 1, state.dilemmas.length - 1),
            };

        case 'PREV_DILEMMA':
            return {
                ...state,
                currentDilemma: Math.max(state.currentDilemma - 1, 0),
            };

        case 'SUBMIT':
            return { ...state, phase: 'waiting' };

        case 'PARTNER_ANSWERED':
            return { ...state, partnerAnswered: true };

        case 'SHOW_RESULTS':
            return { ...state, phase: 'results' };

        case 'SET_RESULTS':
            return { ...state, results: action.results };

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

export function useWouldYouRather() {
    const [state, dispatch] = useReducer(wyrReducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/would-you-rather',
    });

    // ── Socket event listeners ──
    useEffect(() => {
        if (!socket) return;

        const onRoomCreated = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_CREATED', code: data.code, playerId: data.playerId });
        };

        const onRoomJoined = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_JOINED', code: data.code, playerId: data.playerId });
        };

        const onRoomUpdate = (data: { players: Player[] }) => {
            dispatch({ type: 'ROOM_UPDATE', players: data.players });
        };

        const onGameStart = (data: { dilemmas: Dilemma[] }) => {
            dispatch({ type: 'GAME_START', dilemmas: data.dilemmas });
        };

        const onPartnerAnswered = () => {
            dispatch({ type: 'PARTNER_ANSWERED' });
        };

        const onShowResults = () => {
            dispatch({ type: 'SHOW_RESULTS' });
        };

        const onResultsData = (data: WYRResults) => {
            dispatch({ type: 'SET_RESULTS', results: data });
        };

        const onError = (data: { message: string }) => {
            dispatch({ type: 'SET_ERROR', message: data.message });
        };

        socket.on('room-created', onRoomCreated);
        socket.on('room-joined', onRoomJoined);
        socket.on('room-update', onRoomUpdate);
        socket.on('game-start', onGameStart);
        socket.on('partner-answered', onPartnerAnswered);
        socket.on('show-results', onShowResults);
        socket.on('results-data', onResultsData);
        socket.on('error', onError);

        return () => {
            socket.off('room-created', onRoomCreated);
            socket.off('room-joined', onRoomJoined);
            socket.off('room-update', onRoomUpdate);
            socket.off('game-start', onGameStart);
            socket.off('partner-answered', onPartnerAnswered);
            socket.off('show-results', onShowResults);
            socket.off('results-data', onResultsData);
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

    const answerDilemma = useCallback(
        (dilemmaId: number, choice: DilemmaChoice) => {
            dispatch({ type: 'ANSWER_DILEMMA', dilemmaId, choice });
        },
        []
    );

    const nextDilemma = useCallback(() => dispatch({ type: 'NEXT_DILEMMA' }), []);
    const prevDilemma = useCallback(() => dispatch({ type: 'PREV_DILEMMA' }), []);

    const submitAnswers = useCallback(() => {
        if (!socket) return;
        socket.emit('submit-answers', {
            roomCode: state.roomCode,
            playerName: state.playerName,
            answers: state.answers,
        });
        dispatch({ type: 'SUBMIT' });
    }, [socket, state.roomCode, state.playerName, state.answers]);

    const requestResults = useCallback(() => {
        if (!socket) return;
        socket.emit('get-results', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const setPlayerName = useCallback((name: string) => {
        dispatch({ type: 'SET_NAME', name });
    }, []);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    // ── Derived ──
    const allAnswered =
        state.dilemmas.length > 0 &&
        Object.keys(state.answers).length === state.dilemmas.length;

    const progress =
        state.dilemmas.length > 0
            ? Math.round((Object.keys(state.answers).length / state.dilemmas.length) * 100)
            : 0;

    return {
        // State
        ...state,
        isConnected,
        isConnecting,
        socketError,

        // Derived
        allAnswered,
        progress,

        // Actions
        setPlayerName,
        createRoom,
        joinRoom,
        answerDilemma,
        nextDilemma,
        prevDilemma,
        submitAnswers,
        requestResults,
        clearError,
        reset,
    };
}