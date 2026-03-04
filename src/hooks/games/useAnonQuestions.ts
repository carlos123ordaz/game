import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type {
    AnonPhase,
    AnonSettings,
    AnonPlayer,
    AnonQuestion,
    AnonQuestionWithAnswers,
    PossibleAuthor,
    AnonResults,
    RoomInfo,
} from '../../types/games/anonymous-questions';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */

interface AnonState {
    phase: AnonPhase;
    playerName: string;
    roomCode: string;
    playerId: string;

    // Room
    players: AnonPlayer[];
    host: string;
    settings: AnonSettings;

    // Writing
    draftQuestions: string[];
    hasSubmittedQuestions: boolean;

    // Answering
    questions: AnonQuestion[];
    draftAnswers: Record<string, string>;
    currentQuestionIndex: number;
    hasSubmittedAnswers: boolean;

    // Guessing
    questionsWithAnswers: AnonQuestionWithAnswers[];
    possibleAuthors: PossibleAuthor[];
    draftGuesses: Record<string, string>;
    currentGuessIndex: number;
    hasSubmittedGuesses: boolean;

    // Progress
    phaseProgress: { completed: number; total: number } | null;
    timeRemaining: number | null;

    // Results
    results: AnonResults | null;

    error: string | null;
}

const defaultSettings: AnonSettings = {
    questionsPerPlayer: 2,
    allowSkipGuess: true,
    showTimers: true,
};

const initialState: AnonState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    host: '',
    settings: { ...defaultSettings },
    draftQuestions: ['', ''],
    hasSubmittedQuestions: false,
    questions: [],
    draftAnswers: {},
    currentQuestionIndex: 0,
    hasSubmittedAnswers: false,
    questionsWithAnswers: [],
    possibleAuthors: [],
    draftGuesses: {},
    currentGuessIndex: 0,
    hasSubmittedGuesses: false,
    phaseProgress: null,
    timeRemaining: null,
    results: null,
    error: null,
};

/* ═══════════════════════════════════════════
   ACTIONS
   ═══════════════════════════════════════════ */

type AnonAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string; reconnected: boolean }
    | { type: 'ROOM_UPDATE'; info: RoomInfo }
    | { type: 'PHASE_CHANGE'; phase: AnonPhase; data?: any }
    | { type: 'ALREADY_SUBMITTED'; phase: string }
    | { type: 'PHASE_PROGRESS'; completed: number; total: number }
    | { type: 'UPDATE_DRAFT_QUESTION'; index: number; text: string }
    | { type: 'QUESTIONS_ACCEPTED' }
    | { type: 'UPDATE_DRAFT_ANSWER'; questionId: string; text: string }
    | { type: 'SET_ANSWER_INDEX'; index: number }
    | { type: 'ANSWERS_ACCEPTED' }
    | { type: 'UPDATE_DRAFT_GUESS'; questionId: string; playerId: string }
    | { type: 'SET_GUESS_INDEX'; index: number }
    | { type: 'GUESSES_ACCEPTED' }
    | { type: 'TICK'; remaining: number }
    | { type: 'SET_RESULTS'; results: AnonResults }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'LEFT_ROOM' }
    | { type: 'RESET' };

/* ═══════════════════════════════════════════
   REDUCER
   ═══════════════════════════════════════════ */

function anonReducer(state: AnonState, action: AnonAction): AnonState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return { ...state, phase: 'lobby', roomCode: action.code, playerId: action.playerId };

        case 'ROOM_JOINED':
            return { ...state, roomCode: action.code, playerId: action.playerId, phase: action.reconnected ? state.phase : 'lobby' };

        case 'ROOM_UPDATE':
            return {
                ...state,
                players: action.info.players,
                host: action.info.host,
                settings: action.info.settings,
                draftQuestions: state.draftQuestions.length === action.info.settings.questionsPerPlayer
                    ? state.draftQuestions
                    : Array.from({ length: action.info.settings.questionsPerPlayer }, (_, i) => state.draftQuestions[i] || ''),
            };

        case 'PHASE_CHANGE': {
            const base = { ...state, phase: action.phase, phaseProgress: null };

            switch (action.phase) {
                case 'lobby':
                    return { ...base, hasSubmittedQuestions: false, hasSubmittedAnswers: false, hasSubmittedGuesses: false, draftQuestions: Array(state.settings.questionsPerPlayer).fill(''), draftAnswers: {}, draftGuesses: {}, questions: [], questionsWithAnswers: [], results: null };
                case 'writing':
                    return { ...base, hasSubmittedQuestions: false, draftQuestions: Array(action.data?.questionsPerPlayer || state.settings.questionsPerPlayer).fill(''), timeRemaining: action.data?.timeLimit || null };
                case 'answering':
                    return { ...base, hasSubmittedAnswers: false, questions: action.data?.questions || [], draftAnswers: {}, currentQuestionIndex: 0, timeRemaining: action.data?.timeLimit || null };
                case 'guessing':
                    return { ...base, hasSubmittedGuesses: false, questionsWithAnswers: action.data?.questions || [], possibleAuthors: action.data?.possibleAuthors || [], draftGuesses: {}, currentGuessIndex: 0, timeRemaining: action.data?.timeLimit || null };
                case 'reveal':
                    return { ...base, timeRemaining: null };
                default:
                    return base;
            }
        }

        case 'ALREADY_SUBMITTED':
            if (action.phase === 'writing') return { ...state, hasSubmittedQuestions: true };
            if (action.phase === 'answering') return { ...state, hasSubmittedAnswers: true };
            if (action.phase === 'guessing') return { ...state, hasSubmittedGuesses: true };
            return state;

        case 'PHASE_PROGRESS':
            return { ...state, phaseProgress: { completed: action.completed, total: action.total } };

        case 'UPDATE_DRAFT_QUESTION': {
            const qs = [...state.draftQuestions];
            qs[action.index] = action.text;
            return { ...state, draftQuestions: qs };
        }

        case 'QUESTIONS_ACCEPTED':
            return { ...state, hasSubmittedQuestions: true };

        case 'UPDATE_DRAFT_ANSWER':
            return { ...state, draftAnswers: { ...state.draftAnswers, [action.questionId]: action.text } };

        case 'SET_ANSWER_INDEX':
            return { ...state, currentQuestionIndex: action.index };

        case 'ANSWERS_ACCEPTED':
            return { ...state, hasSubmittedAnswers: true };

        case 'UPDATE_DRAFT_GUESS':
            return { ...state, draftGuesses: { ...state.draftGuesses, [action.questionId]: action.playerId } };

        case 'SET_GUESS_INDEX':
            return { ...state, currentGuessIndex: action.index };

        case 'GUESSES_ACCEPTED':
            return { ...state, hasSubmittedGuesses: true };

        case 'TICK':
            return { ...state, timeRemaining: action.remaining };

        case 'SET_RESULTS':
            return { ...state, results: action.results, phase: 'reveal' };

        case 'SET_ERROR':
            return { ...state, error: action.message };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        case 'LEFT_ROOM':
        case 'RESET':
            return { ...initialState, playerName: state.playerName };

        default:
            return state;
    }
}

/* ═══════════════════════════════════════════
   HOOK
   ═══════════════════════════════════════════ */

export function useAnonQuestions() {
    const [state, dispatch] = useReducer(anonReducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/anonymous-questions',
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const phaseStartRef = useRef<number>(0);
    const phaseLimitRef = useRef<number>(0);

    // ── Cleanup ──
    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // ── Timer helper ──
    const startTimer = useCallback((timeLimit: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        phaseStartRef.current = Date.now();
        phaseLimitRef.current = timeLimit;

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - phaseStartRef.current;
            const remaining = Math.max(0, phaseLimitRef.current - elapsed);
            dispatch({ type: 'TICK', remaining });
            if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
        }, 250);
    }, []);

    // ── Socket listeners ──
    useEffect(() => {
        if (!socket) return;

        const onRoomCreated = (d: { code: string; playerId: string }) =>
            dispatch({ type: 'ROOM_CREATED', code: d.code, playerId: d.playerId });

        const onRoomJoined = (d: { code: string; playerId: string; reconnected: boolean }) =>
            dispatch({ type: 'ROOM_JOINED', code: d.code, playerId: d.playerId, reconnected: d.reconnected });

        const onRoomUpdate = (info: RoomInfo) =>
            dispatch({ type: 'ROOM_UPDATE', info });

        const onPhaseChange = (d: { phase: AnonPhase; timeLimit?: number;[k: string]: any }) => {
            dispatch({ type: 'PHASE_CHANGE', phase: d.phase, data: d });
            if (d.timeLimit) startTimer(d.timeLimit);
            else if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        };

        const onAlreadySubmitted = (d: { phase: string }) =>
            dispatch({ type: 'ALREADY_SUBMITTED', phase: d.phase });

        const onPhaseProgress = (d: { phase: string; completed: number; total: number }) =>
            dispatch({ type: 'PHASE_PROGRESS', completed: d.completed, total: d.total });

        const onQuestionsAccepted = () =>
            dispatch({ type: 'QUESTIONS_ACCEPTED' });

        const onAnswersAccepted = () =>
            dispatch({ type: 'ANSWERS_ACCEPTED' });

        const onGuessesAccepted = () =>
            dispatch({ type: 'GUESSES_ACCEPTED' });

        const onResultsData = (d: AnonResults) =>
            dispatch({ type: 'SET_RESULTS', results: d });

        const onLeftRoom = () =>
            dispatch({ type: 'LEFT_ROOM' });

        const onPlayerDisconnected = (d: { playerName: string }) =>
            dispatch({ type: 'SET_ERROR', message: `${d.playerName} se desconectó` });

        const onPlayerReconnected = (d: { playerName: string }) =>
            dispatch({ type: 'SET_ERROR', message: `${d.playerName} se reconectó` });

        const onPlayerLeft = (d: { playerName: string }) =>
            dispatch({ type: 'SET_ERROR', message: `${d.playerName} salió de la sala` });

        const onError = (d: { message: string }) =>
            dispatch({ type: 'SET_ERROR', message: d.message });

        socket.on('room-created', onRoomCreated);
        socket.on('room-joined', onRoomJoined);
        socket.on('room-update', onRoomUpdate);
        socket.on('phase-change', onPhaseChange);
        socket.on('already-submitted', onAlreadySubmitted);
        socket.on('phase-progress', onPhaseProgress);
        socket.on('questions-accepted', onQuestionsAccepted);
        socket.on('answers-accepted', onAnswersAccepted);
        socket.on('guesses-accepted', onGuessesAccepted);
        socket.on('results-data', onResultsData);
        socket.on('left-room', onLeftRoom);
        socket.on('player-disconnected', onPlayerDisconnected);
        socket.on('player-reconnected', onPlayerReconnected);
        socket.on('player-left', onPlayerLeft);
        socket.on('error', onError);

        return () => {
            socket.off('room-created', onRoomCreated);
            socket.off('room-joined', onRoomJoined);
            socket.off('room-update', onRoomUpdate);
            socket.off('phase-change', onPhaseChange);
            socket.off('already-submitted', onAlreadySubmitted);
            socket.off('phase-progress', onPhaseProgress);
            socket.off('questions-accepted', onQuestionsAccepted);
            socket.off('answers-accepted', onAnswersAccepted);
            socket.off('guesses-accepted', onGuessesAccepted);
            socket.off('results-data', onResultsData);
            socket.off('left-room', onLeftRoom);
            socket.off('player-disconnected', onPlayerDisconnected);
            socket.off('player-reconnected', onPlayerReconnected);
            socket.off('player-left', onPlayerLeft);
            socket.off('error', onError);
        };
    }, [socket, startTimer]);

    // ── Actions ──

    const setPlayerName = useCallback((name: string) =>
        dispatch({ type: 'SET_NAME', name }), []);

    const createRoom = useCallback(() => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((code: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const leaveRoom = useCallback(() => {
        if (!socket) return;
        socket.emit('leave-room', { roomCode: state.roomCode });
        dispatch({ type: 'LEFT_ROOM' });
    }, [socket, state.roomCode]);

    const toggleReady = useCallback(() => {
        if (!socket) return;
        socket.emit('toggle-ready', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const changeSettings = useCallback((settings: Partial<AnonSettings>) => {
        if (!socket) return;
        socket.emit('change-settings', { roomCode: state.roomCode, settings });
    }, [socket, state.roomCode]);

    const startGame = useCallback(() => {
        if (!socket) return;
        socket.emit('start-game', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const updateDraftQuestion = useCallback((index: number, text: string) =>
        dispatch({ type: 'UPDATE_DRAFT_QUESTION', index, text }), []);

    const submitQuestions = useCallback(() => {
        if (!socket) return;
        const questions = state.draftQuestions.filter(q => q.trim().length > 0);
        if (questions.length === 0) return;
        socket.emit('submit-questions', { roomCode: state.roomCode, questions });
    }, [socket, state.roomCode, state.draftQuestions]);

    const updateDraftAnswer = useCallback((questionId: string, text: string) =>
        dispatch({ type: 'UPDATE_DRAFT_ANSWER', questionId, text }), []);

    const setAnswerIndex = useCallback((index: number) =>
        dispatch({ type: 'SET_ANSWER_INDEX', index }), []);

    const submitAnswers = useCallback(() => {
        if (!socket) return;
        socket.emit('submit-answers', { roomCode: state.roomCode, answers: state.draftAnswers });
    }, [socket, state.roomCode, state.draftAnswers]);

    const updateDraftGuess = useCallback((questionId: string, playerId: string) =>
        dispatch({ type: 'UPDATE_DRAFT_GUESS', questionId, playerId }), []);

    const setGuessIndex = useCallback((index: number) =>
        dispatch({ type: 'SET_GUESS_INDEX', index }), []);

    const submitGuesses = useCallback(() => {
        if (!socket) return;
        socket.emit('submit-guesses', { roomCode: state.roomCode, guesses: state.draftGuesses });
    }, [socket, state.roomCode, state.draftGuesses]);

    const requestResults = useCallback(() => {
        if (!socket) return;
        socket.emit('get-results', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const playAgain = useCallback(() => {
        if (!socket) return;
        socket.emit('play-again', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

    const reset = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        dispatch({ type: 'RESET' });
    }, []);

    // ── Derived ──
    const isHost = state.playerId === state.host;
    const formattedTime = (() => {
        if (state.timeRemaining == null) return null;
        const secs = Math.ceil(state.timeRemaining / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    })();

    const validDraftQuestions = state.draftQuestions.filter(q => q.trim().length > 0).length;
    const answeredCount = Object.keys(state.draftAnswers).filter(k => state.draftAnswers[k]?.trim()).length;
    const guessedCount = Object.keys(state.draftGuesses).length;

    // Questions I can guess (not my own)
    const guessableQuestions = state.questionsWithAnswers;

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,

        // Derived
        isHost,
        formattedTime,
        validDraftQuestions,
        answeredCount,
        guessedCount,
        guessableQuestions,

        // Actions
        setPlayerName,
        createRoom,
        joinRoom,
        leaveRoom,
        toggleReady,
        changeSettings,
        startGame,
        updateDraftQuestion,
        submitQuestions,
        updateDraftAnswer,
        setAnswerIndex,
        submitAnswers,
        updateDraftGuess,
        setGuessIndex,
        submitGuesses,
        requestResults,
        playAgain,
        clearError,
        reset,
    };
}