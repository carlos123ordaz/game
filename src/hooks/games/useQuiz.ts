import { useCallback, useEffect, useReducer } from 'react';
import { useSocket } from '../useSocket';
import type { Player } from '../../types/common';
import type { Question, QuizAnswer, QuizResults, QuizPhase } from '../../types/games/quiz';

/* ═══════════════════════════════════════════
   QUIZ STATE — Reducer pattern
   ═══════════════════════════════════════════ */

interface QuizState {
  phase: QuizPhase;
  playerName: string;
  roomCode: string;
  playerId: string;
  players: Player[];
  questions: Question[];
  answers: QuizAnswer;
  currentQuestion: number;
  partnerAnswered: boolean;
  results: QuizResults | null;
  error: string | null;
}

type QuizAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'ROOM_CREATED'; code: string; playerId: string }
  | { type: 'ROOM_JOINED'; code: string; playerId: string }
  | { type: 'ROOM_UPDATE'; players: Player[] }
  | { type: 'GAME_START'; questions: Question[] }
  | { type: 'ANSWER_QUESTION'; questionId: number; optionIndex: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'SUBMIT' }
  | { type: 'PARTNER_ANSWERED' }
  | { type: 'SHOW_RESULTS' }
  | { type: 'SET_RESULTS'; results: QuizResults }
  | { type: 'SET_ERROR'; message: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

const initialState: QuizState = {
  phase: 'name',
  playerName: '',
  roomCode: '',
  playerId: '',
  players: [],
  questions: [],
  answers: {},
  currentQuestion: 0,
  partnerAnswered: false,
  results: null,
  error: null,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
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
        questions: action.questions,
        currentQuestion: 0,
        answers: {},
      };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionIndex },
      };

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: Math.min(state.currentQuestion + 1, state.questions.length - 1),
      };

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestion: Math.max(state.currentQuestion - 1, 0),
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

export function useQuiz() {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { socket, isConnected, isConnecting, error: socketError } = useSocket({
    namespace: '/quiz',
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

    const onGameStart = (data: { questions: Question[] }) => {
      dispatch({ type: 'GAME_START', questions: data.questions });
    };

    const onPartnerAnswered = () => {
      dispatch({ type: 'PARTNER_ANSWERED' });
    };

    const onShowResults = () => {
      dispatch({ type: 'SHOW_RESULTS' });
    };

    const onResultsData = (data: QuizResults) => {
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

  const answerQuestion = useCallback(
    (questionId: number, optionIndex: number) => {
      dispatch({ type: 'ANSWER_QUESTION', questionId, optionIndex });
    },
    []
  );

  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), []);
  const prevQuestion = useCallback(() => dispatch({ type: 'PREV_QUESTION' }), []);

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
  const allAnswered = state.questions.length > 0 &&
    Object.keys(state.answers).length === state.questions.length;

  const progress = state.questions.length > 0
    ? Math.round((Object.keys(state.answers).length / state.questions.length) * 100)
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
    answerQuestion,
    nextQuestion,
    prevQuestion,
    submitAnswers,
    requestResults,
    clearError,
    reset,
  };
}
