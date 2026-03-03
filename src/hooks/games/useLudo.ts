import { useCallback, useEffect, useReducer } from 'react';
import { useSocket } from '../useSocket';
import type { LudoPhase, LudoGameState, LudoColor } from '../../types/games/ludo';

/* ===================================================================
   LUDO - useLudo Hook
   File: src/hooks/games/useLudo.ts
   =================================================================== */

interface LudoState {
    phase: LudoPhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    myColor: LudoColor | null;
    game: LudoGameState | null;
    error: string | null;
    playerLeftMessage: string | null;
}

type Action =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string; color: LudoColor }
    | { type: 'ROOM_JOINED'; code: string; playerId: string; color: LudoColor }
    | { type: 'GAME_STATE'; state: LudoGameState }
    | { type: 'GAME_STARTED'; state: LudoGameState }
    | { type: 'PLAYER_LEFT'; playerName: string }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

const initialState: LudoState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    myColor: null,
    game: null,
    error: null,
    playerLeftMessage: null,
};

function reducer(state: LudoState, action: Action): LudoState {
    switch (action.type) {
        case 'SET_NAME':
            return { ...state, playerName: action.name };

        case 'ROOM_CREATED':
            return {
                ...state, phase: 'lobby',
                roomCode: action.code, playerId: action.playerId, myColor: action.color,
            };

        case 'ROOM_JOINED':
            return {
                ...state, phase: 'lobby',
                roomCode: action.code, playerId: action.playerId, myColor: action.color,
            };

        case 'GAME_STATE': {
            const gs = action.state;
            let phase: LudoPhase = state.phase;
            if (gs.status === 'waiting') phase = 'lobby';
            else if (gs.status === 'playing') phase = 'playing';
            else if (gs.status === 'finished') phase = 'finished';
            return { ...state, phase, game: gs };
        }

        case 'GAME_STARTED':
            return { ...state, phase: 'playing', game: action.state };

        case 'PLAYER_LEFT':
            return { ...state, playerLeftMessage: action.playerName + ' se desconecto.' };

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

export function useLudo() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/ludo',
    });

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handlers: Record<string, (...args: any[]) => void> = {
            'room-created': (data: { code: string; playerId: string; color: LudoColor }) => {
                dispatch({ type: 'ROOM_CREATED', code: data.code, playerId: data.playerId, color: data.color });
            },
            'room-joined': (data: { code: string; playerId: string; color: LudoColor }) => {
                dispatch({ type: 'ROOM_JOINED', code: data.code, playerId: data.playerId, color: data.color });
            },
            'game-state': (data: LudoGameState) => {
                dispatch({ type: 'GAME_STATE', state: data });
            },
            'game-started': (data: LudoGameState) => {
                dispatch({ type: 'GAME_STARTED', state: data });
            },
            'player-left': (data: { playerName: string }) => {
                dispatch({ type: 'PLAYER_LEFT', playerName: data.playerName });
            },
            'error': (data: { message: string }) => {
                dispatch({ type: 'SET_ERROR', message: data.message });
            },
        };

        Object.entries(handlers).forEach(([ev, fn]) => socket.on(ev, fn));
        return () => { Object.entries(handlers).forEach(([ev, fn]) => socket.off(ev, fn)); };
    }, [socket]);

    // Actions
    const setPlayerName = useCallback((name: string) => dispatch({ type: 'SET_NAME', name }), []);

    const createRoom = useCallback((numPlayers = 4) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim(), numPlayers });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((code: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const toggleReady = useCallback(() => {
        if (!socket) return;
        socket.emit('toggle-ready', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const rollDice = useCallback(() => {
        if (!socket) return;
        socket.emit('roll-dice', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const selectMove = useCallback((tokenIndex: number) => {
        if (!socket) return;
        socket.emit('select-move', { roomCode: state.roomCode, tokenIndex });
    }, [socket, state.roomCode]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

    // Derived
    const isMyTurn = state.game?.players[state.game.currentTurn]?.id === state.playerId;
    const myPlayer = state.game?.players.find(p => p.id === state.playerId) || null;
    const canRoll = isMyTurn && state.game?.turnPhase === 'roll';
    const canSelect = isMyTurn && state.game?.turnPhase === 'select';
    const selectableTokens = canSelect ? (state.game?.validMoves || []).map(m => m.tokenIndex) : [];

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,
        isMyTurn,
        myPlayer,
        canRoll,
        canSelect,
        selectableTokens,
        setPlayerName,
        createRoom,
        joinRoom,
        toggleReady,
        rollDice,
        selectMove,
        clearError,
        reset,
    };
}