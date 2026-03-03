import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type {
    GamePhase, TurnPhase, BoardTile, GamePlayer, GameItem,
    GameEvent, GameTrap, GameDecision, LogEntry, DiceResult,
    TileEffect, TargetPrompt, GameOverData,
} from '../../types/games/pixelAdventure';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */

interface PAState {
    phase: GamePhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: GamePlayer[];
    hostId: string;
    board: BoardTile[];

    // Turn
    currentPlayerId: string;
    turnPhase: TurnPhase;

    // Dice
    diceResult: DiceResult | null;
    isRolling: boolean;

    // Events/Effects
    activeEvent: GameEvent | null;
    activeTrap: GameTrap | null;
    activeDecision: GameDecision | null;
    activeTileEffect: TileEffect | null;
    targetPrompt: TargetPrompt | null;
    preciseDicePrompt: boolean;

    // Items
    receivedItem: GameItem | null;

    // End
    gameOverData: GameOverData | null;
    turnSkipped: { playerId: string; playerName: string } | null;

    // Log
    gameLog: LogEntry[];

    error: string | null;
}

type PAAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; players: GamePlayer[]; hostId: string; status: string; currentPlayerId?: string; turnPhase?: TurnPhase }
    | { type: 'GAME_STARTED'; board: BoardTile[]; players: GamePlayer[]; currentPlayerId: string }
    | { type: 'FULL_STATE'; data: any }
    | { type: 'TURN_START'; currentPlayerId: string; turnPhase: TurnPhase; players: GamePlayer[] }
    | { type: 'DICE_ROLLING' }
    | { type: 'DICE_RESULT'; data: DiceResult }
    | { type: 'TILE_EFFECT'; data: TileEffect }
    | { type: 'EVENT_TRIGGERED'; event: GameEvent }
    | { type: 'TRAP_TRIGGERED'; trap: GameTrap }
    | { type: 'DECISION_PROMPT'; decision: GameDecision }
    | { type: 'DECISION_RESULT'; players: GamePlayer[] }
    | { type: 'TARGET_PROMPT'; data: TargetPrompt }
    | { type: 'PRECISE_DICE_PROMPT' }
    | { type: 'ITEM_RECEIVED'; item: GameItem; players: GamePlayer[] }
    | { type: 'CORRECT_GUESS'; players: GamePlayer[] }
    | { type: 'TURN_SKIPPED'; playerId: string; playerName: string }
    | { type: 'GAME_OVER'; data: GameOverData }
    | { type: 'GAME_LOG'; entry: LogEntry }
    | { type: 'CLEAR_EFFECTS' }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

const initialState: PAState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    hostId: '',
    board: [],
    currentPlayerId: '',
    turnPhase: 'idle',
    diceResult: null,
    isRolling: false,
    activeEvent: null,
    activeTrap: null,
    activeDecision: null,
    activeTileEffect: null,
    targetPrompt: null,
    preciseDicePrompt: false,
    receivedItem: null,
    gameOverData: null,
    turnSkipped: null,
    gameLog: [],
    error: null,
};

function reducer(state: PAState, action: PAAction): PAState {
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
                hostId: action.hostId,
                currentPlayerId: action.currentPlayerId || state.currentPlayerId,
                turnPhase: (action.turnPhase as TurnPhase) || state.turnPhase,
            };
        case 'GAME_STARTED':
            return {
                ...state,
                phase: 'playing',
                board: action.board,
                players: action.players,
                currentPlayerId: action.currentPlayerId,
                turnPhase: 'item_phase',
            };
        case 'FULL_STATE': {
            const d = action.data;
            return {
                ...state,
                phase: d.status === 'playing' ? 'playing' : d.status === 'finished' ? 'finished' : 'lobby',
                board: d.board || state.board,
                players: d.players,
                hostId: d.hostId,
                currentPlayerId: d.currentPlayerId || '',
                turnPhase: d.turnPhase || 'idle',
                gameLog: d.gameLog || [],
            };
        }
        case 'TURN_START':
            return {
                ...state,
                currentPlayerId: action.currentPlayerId,
                turnPhase: action.turnPhase,
                players: action.players,
                diceResult: null,
                isRolling: false,
                activeEvent: null,
                activeTrap: null,
                activeDecision: null,
                activeTileEffect: null,
                targetPrompt: null,
                preciseDicePrompt: false,
                receivedItem: null,
                turnSkipped: null,
            };
        case 'DICE_ROLLING':
            return { ...state, isRolling: true };
        case 'DICE_RESULT':
            return { ...state, isRolling: false, diceResult: action.data, players: action.data.players, turnPhase: 'moving' };
        case 'TILE_EFFECT':
            return { ...state, activeTileEffect: action.data, players: action.data.players || state.players };
        case 'EVENT_TRIGGERED':
            return { ...state, activeEvent: action.event };
        case 'TRAP_TRIGGERED':
            return { ...state, activeTrap: action.trap };
        case 'DECISION_PROMPT':
            return { ...state, activeDecision: action.decision, turnPhase: 'decision' };
        case 'DECISION_RESULT':
            return { ...state, activeDecision: null, players: action.players };
        case 'TARGET_PROMPT':
            return { ...state, targetPrompt: action.data, turnPhase: action.data.action === 'event_swap' ? 'event_targeting' as TurnPhase : 'targeting' };
        case 'PRECISE_DICE_PROMPT':
            return { ...state, preciseDicePrompt: true, turnPhase: 'precise_dice' };
        case 'ITEM_RECEIVED':
            return { ...state, receivedItem: action.item, players: action.players };
        case 'TURN_SKIPPED':
            return { ...state, turnSkipped: { playerId: action.playerId, playerName: action.playerName } };
        case 'GAME_OVER':
            return { ...state, phase: 'finished', gameOverData: action.data };
        case 'GAME_LOG':
            return { ...state, gameLog: [...state.gameLog.slice(-50), action.entry] };
        case 'CLEAR_EFFECTS':
            return {
                ...state,
                activeEvent: null,
                activeTrap: null,
                activeTileEffect: null,
                receivedItem: null,
                turnSkipped: null,
            };
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

export function usePixelAdventure() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/pixel-adventure',
    });
    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
        if (!socket) return;

        const on = (ev: string, fn: (...args: any[]) => void) => socket.on(ev, fn);

        on('room-created', (d: any) => {
            dispatch({ type: 'ROOM_CREATED', code: d.code, playerId: d.playerId });
            try { sessionStorage.setItem('pa-room', d.code); sessionStorage.setItem('pa-player', d.playerId); } catch { }
        });
        on('room-joined', (d: any) => {
            dispatch({ type: 'ROOM_JOINED', code: d.code, playerId: d.playerId });
            try { sessionStorage.setItem('pa-room', d.code); sessionStorage.setItem('pa-player', d.playerId); } catch { }
        });
        on('room-update', (d: any) => dispatch({ type: 'ROOM_UPDATE', ...d }));
        on('full-state', (d: any) => dispatch({ type: 'FULL_STATE', data: d }));
        on('game-started', (d: any) => dispatch({ type: 'GAME_STARTED', ...d }));
        on('turn-start', (d: any) => dispatch({ type: 'TURN_START', ...d }));
        on('dice-result', (d: DiceResult) => dispatch({ type: 'DICE_RESULT', data: d }));
        on('tile-effect', (d: TileEffect) => dispatch({ type: 'TILE_EFFECT', data: d }));
        on('event-triggered', (d: any) => dispatch({ type: 'EVENT_TRIGGERED', event: d.event }));
        on('trap-triggered', (d: any) => dispatch({ type: 'TRAP_TRIGGERED', trap: d.trap }));
        on('decision-prompt', (d: any) => dispatch({ type: 'DECISION_PROMPT', decision: d.decision }));
        on('decision-result', (d: any) => dispatch({ type: 'DECISION_RESULT', players: d.players }));
        on('target-prompt', (d: TargetPrompt) => dispatch({ type: 'TARGET_PROMPT', data: d }));
        on('precise-dice-prompt', () => dispatch({ type: 'PRECISE_DICE_PROMPT' }));
        on('item-received', (d: any) => dispatch({ type: 'ITEM_RECEIVED', item: d.item, players: d.players }));
        on('turn-skipped', (d: any) => dispatch({ type: 'TURN_SKIPPED', ...d }));
        on('game-over', (d: GameOverData) => dispatch({ type: 'GAME_OVER', data: d }));
        on('game-log', (entry: LogEntry) => dispatch({ type: 'GAME_LOG', entry }));
        on('kicked', () => { dispatch({ type: 'SET_ERROR', message: 'Fuiste expulsado.' }); dispatch({ type: 'RESET' }); });
        on('error', (d: any) => dispatch({ type: 'SET_ERROR', message: d.message }));

        return () => { socket.removeAllListeners(); };
    }, [socket]);

    // Auto-reconnect
    useEffect(() => {
        if (!socket || !isConnected) return;
        try {
            const r = sessionStorage.getItem('pa-room');
            const p = sessionStorage.getItem('pa-player');
            if (r && p && !stateRef.current.roomCode) {
                socket.emit('reconnect-player', { roomCode: r, playerId: p });
            }
        } catch { }
    }, [socket, isConnected]);

    // Actions
    const createRoom = useCallback(() => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((code: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: code.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const startGame = useCallback(() => { socket?.emit('start-game'); }, [socket]);

    const rollDice = useCallback(() => {
        if (!socket) return;
        dispatch({ type: 'DICE_ROLLING' });
        socket.emit('roll-dice');
    }, [socket]);

    const useItem = useCallback((itemIndex: number, targetPlayerId?: string) => {
        socket?.emit('use-item', { itemIndex, targetPlayerId });
    }, [socket]);

    const selectTarget = useCallback((targetPlayerId: string) => {
        socket?.emit('select-target', { targetPlayerId });
    }, [socket]);

    const eventTarget = useCallback((targetPlayerId: string) => {
        socket?.emit('event-target', { targetPlayerId });
    }, [socket]);

    const makeDecision = useCallback((choice: 'A' | 'B') => {
        socket?.emit('make-decision', { choice });
    }, [socket]);

    const preciseDiceValue = useCallback((value: number) => {
        socket?.emit('precise-dice-value', { value });
    }, [socket]);

    const kickPlayer = useCallback((id: string) => {
        socket?.emit('kick-player', { targetPlayerId: id });
    }, [socket]);

    const setPlayerName = useCallback((name: string) => dispatch({ type: 'SET_NAME', name }), []);
    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const clearEffects = useCallback(() => dispatch({ type: 'CLEAR_EFFECTS' }), []);
    const reset = useCallback(() => {
        try { sessionStorage.removeItem('pa-room'); sessionStorage.removeItem('pa-player'); } catch { }
        dispatch({ type: 'RESET' });
    }, []);

    // Derived
    const isHost = state.playerId === state.hostId;
    const isMyTurn = state.currentPlayerId === state.playerId;
    const canStart = isHost && state.players.filter(p => p.connected).length >= 2;
    const myPlayer = state.players.find(p => p.id === state.playerId) || null;

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,
        isHost,
        isMyTurn,
        canStart,
        myPlayer,
        setPlayerName,
        createRoom,
        joinRoom,
        startGame,
        rollDice,
        useItem,
        selectTarget,
        eventTarget,
        makeDecision,
        preciseDiceValue,
        kickPlayer,
        clearError,
        clearEffects,
        reset,
    };
}