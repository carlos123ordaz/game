import { useCallback, useEffect, useReducer, useRef } from 'react';
import { useSocket } from '../useSocket';
import type { Player } from '../../types/common';
import type {
    Difficulty,
    MinesweeperPhase,
    CellData,
    PlayerStats,
    RevealedCell,
    MinesweeperResults,
    GameStartData,
    RoomUpdateData,
} from '../../types/games/minesweeper';

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */

interface MinesweeperState {
    phase: MinesweeperPhase;
    playerName: string;
    roomCode: string;
    playerId: string;
    players: { id: string; name: string; ready: boolean }[];
    host: string;
    difficulty: Difficulty;

    // Board
    rows: number;
    cols: number;
    totalMines: number;
    board: CellData[][];
    gameDuration: number;
    timeRemaining: number;

    // Player stats
    score: number;
    lives: number;
    cellsRevealed: number;
    playerStatus: 'playing' | 'eliminated' | 'cleared';
    allPlayerStats: PlayerStats[];

    // Results
    results: MinesweeperResults | null;
    error: string | null;
}

type MinesweeperAction =
    | { type: 'SET_NAME'; name: string }
    | { type: 'ROOM_CREATED'; code: string; playerId: string }
    | { type: 'ROOM_JOINED'; code: string; playerId: string }
    | { type: 'ROOM_UPDATE'; data: RoomUpdateData }
    | { type: 'GAME_START'; data: GameStartData }
    | { type: 'CELLS_REVEALED'; cells: RevealedCell[]; score: number; cellsRevealed: number }
    | { type: 'MINE_HIT'; row: number; col: number; lives: number; score: number }
    | { type: 'FLAG_UPDATE'; row: number; col: number; flagged: boolean; score: number }
    | { type: 'PLAYER_ELIMINATED'; reason: string }
    | { type: 'BOARD_CLEARED'; score: number }
    | { type: 'PLAYER_STATS_UPDATE'; players: PlayerStats[] }
    | { type: 'GAME_OVER'; results: MinesweeperResults }
    | { type: 'SET_RESULTS'; results: MinesweeperResults }
    | { type: 'TICK'; timeRemaining: number }
    | { type: 'SET_ERROR'; message: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'RESET' };

function createEmptyBoard(rows: number, cols: number): CellData[][] {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => ({
            row: r,
            col: c,
            state: 'hidden' as const,
            value: 0,
        }))
    );
}

const initialState: MinesweeperState = {
    phase: 'name',
    playerName: '',
    roomCode: '',
    playerId: '',
    players: [],
    host: '',
    difficulty: 'medium',
    rows: 0,
    cols: 0,
    totalMines: 0,
    board: [],
    gameDuration: 0,
    timeRemaining: 0,
    score: 0,
    lives: 3,
    cellsRevealed: 0,
    playerStatus: 'playing',
    allPlayerStats: [],
    results: null,
    error: null,
};

function minesweeperReducer(state: MinesweeperState, action: MinesweeperAction): MinesweeperState {
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
                players: action.data.players,
                difficulty: action.data.difficulty,
                host: action.data.host,
            };

        case 'GAME_START': {
            const { rows, cols, mines, duration, players } = action.data;
            return {
                ...state,
                phase: 'playing',
                rows,
                cols,
                totalMines: mines,
                gameDuration: duration,
                timeRemaining: duration,
                board: createEmptyBoard(rows, cols),
                score: 0,
                lives: 3,
                cellsRevealed: 0,
                playerStatus: 'playing',
                allPlayerStats: players,
            };
        }

        case 'CELLS_REVEALED': {
            const newBoard = state.board.map(row => row.map(cell => ({ ...cell })));
            action.cells.forEach(({ row, col, value }) => {
                if (newBoard[row]?.[col]) {
                    newBoard[row][col] = { row, col, state: 'revealed', value };
                }
            });
            return {
                ...state,
                board: newBoard,
                score: action.score,
                cellsRevealed: action.cellsRevealed,
            };
        }

        case 'MINE_HIT': {
            const newBoard = state.board.map(row => row.map(cell => ({ ...cell })));
            if (newBoard[action.row]?.[action.col]) {
                newBoard[action.row][action.col] = {
                    row: action.row,
                    col: action.col,
                    state: 'mine',
                    value: -1,
                };
            }
            return {
                ...state,
                board: newBoard,
                lives: action.lives,
                score: action.score,
            };
        }

        case 'FLAG_UPDATE': {
            const newBoard = state.board.map(row => row.map(cell => ({ ...cell })));
            if (newBoard[action.row]?.[action.col]) {
                newBoard[action.row][action.col] = {
                    ...newBoard[action.row][action.col],
                    state: action.flagged ? 'flagged' : 'hidden',
                };
            }
            return { ...state, board: newBoard, score: action.score };
        }

        case 'PLAYER_ELIMINATED':
            return { ...state, playerStatus: 'eliminated' };

        case 'BOARD_CLEARED':
            return { ...state, playerStatus: 'cleared', score: action.score };

        case 'PLAYER_STATS_UPDATE':
            return { ...state, allPlayerStats: action.players };

        case 'GAME_OVER':
            return { ...state, phase: 'results', results: action.results };

        case 'SET_RESULTS':
            return { ...state, results: action.results };

        case 'TICK':
            return { ...state, timeRemaining: action.timeRemaining };

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

export function useMinesweeper() {
    const [state, dispatch] = useReducer(minesweeperReducer, initialState);
    const { socket, isConnected, isConnecting, error: socketError } = useSocket({
        namespace: '/minesweeper',
    });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    // ── Cleanup timer ──
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // ── Socket listeners ──
    useEffect(() => {
        if (!socket) return;

        const onRoomCreated = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_CREATED', code: data.code, playerId: data.playerId });
        };

        const onRoomJoined = (data: { code: string; playerId: string }) => {
            dispatch({ type: 'ROOM_JOINED', code: data.code, playerId: data.playerId });
        };

        const onRoomUpdate = (data: RoomUpdateData) => {
            dispatch({ type: 'ROOM_UPDATE', data });
        };

        const onGameStart = (data: GameStartData) => {
            dispatch({ type: 'GAME_START', data });
            startTimeRef.current = Date.now();

            // Start countdown timer
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, data.duration - elapsed);
                dispatch({ type: 'TICK', timeRemaining: remaining });
                if (remaining <= 0 && timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }, 250);
        };

        const onCellsRevealed = (data: { cells: RevealedCell[]; score: number; cellsRevealed: number }) => {
            dispatch({ type: 'CELLS_REVEALED', cells: data.cells, score: data.score, cellsRevealed: data.cellsRevealed });
        };

        const onMineHit = (data: { row: number; col: number; lives: number; score: number }) => {
            dispatch({ type: 'MINE_HIT', row: data.row, col: data.col, lives: data.lives, score: data.score });
        };

        const onFlagUpdate = (data: { row: number; col: number; flagged: boolean; score: number; correctFlags: number }) => {
            dispatch({ type: 'FLAG_UPDATE', row: data.row, col: data.col, flagged: data.flagged, score: data.score });
        };

        const onPlayerEliminated = (data: { reason: string }) => {
            dispatch({ type: 'PLAYER_ELIMINATED', reason: data.reason });
        };

        const onBoardCleared = (data: { score: number }) => {
            dispatch({ type: 'BOARD_CLEARED', score: data.score });
        };

        const onPlayerStatsUpdate = (data: { players: PlayerStats[] }) => {
            dispatch({ type: 'PLAYER_STATS_UPDATE', players: data.players });
        };

        const onGameOver = (data: { reason: string; results: MinesweeperResults }) => {
            if (timerRef.current) clearInterval(timerRef.current);
            dispatch({ type: 'GAME_OVER', results: data.results });
        };

        const onResultsData = (data: MinesweeperResults) => {
            dispatch({ type: 'SET_RESULTS', results: data });
        };

        const onError = (data: { message: string }) => {
            dispatch({ type: 'SET_ERROR', message: data.message });
        };

        socket.on('room-created', onRoomCreated);
        socket.on('room-joined', onRoomJoined);
        socket.on('room-update', onRoomUpdate);
        socket.on('game-start', onGameStart);
        socket.on('cells-revealed', onCellsRevealed);
        socket.on('mine-hit', onMineHit);
        socket.on('flag-update', onFlagUpdate);
        socket.on('player-eliminated', onPlayerEliminated);
        socket.on('board-cleared', onBoardCleared);
        socket.on('player-stats-update', onPlayerStatsUpdate);
        socket.on('game-over', onGameOver);
        socket.on('results-data', onResultsData);
        socket.on('error', onError);

        return () => {
            socket.off('room-created', onRoomCreated);
            socket.off('room-joined', onRoomJoined);
            socket.off('room-update', onRoomUpdate);
            socket.off('game-start', onGameStart);
            socket.off('cells-revealed', onCellsRevealed);
            socket.off('mine-hit', onMineHit);
            socket.off('flag-update', onFlagUpdate);
            socket.off('player-eliminated', onPlayerEliminated);
            socket.off('board-cleared', onBoardCleared);
            socket.off('player-stats-update', onPlayerStatsUpdate);
            socket.off('game-over', onGameOver);
            socket.off('results-data', onResultsData);
            socket.off('error', onError);
        };
    }, [socket]);

    // ── Actions ──
    const setPlayerName = useCallback((name: string) => {
        dispatch({ type: 'SET_NAME', name });
    }, []);

    const createRoom = useCallback((difficulty: Difficulty = 'medium') => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('create-room', { playerName: state.playerName.trim(), difficulty });
    }, [socket, state.playerName]);

    const joinRoom = useCallback((roomCode: string) => {
        if (!socket || !state.playerName.trim()) return;
        socket.emit('join-room', { roomCode: roomCode.toUpperCase(), playerName: state.playerName.trim() });
    }, [socket, state.playerName]);

    const toggleReady = useCallback(() => {
        if (!socket) return;
        socket.emit('toggle-ready', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const changeDifficulty = useCallback((difficulty: Difficulty) => {
        if (!socket) return;
        socket.emit('change-difficulty', { roomCode: state.roomCode, difficulty });
    }, [socket, state.roomCode]);

    const startGame = useCallback(() => {
        if (!socket) return;
        socket.emit('start-game', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const revealCell = useCallback((row: number, col: number) => {
        if (!socket || state.playerStatus !== 'playing') return;
        socket.emit('reveal-cell', { roomCode: state.roomCode, row, col });
    }, [socket, state.roomCode, state.playerStatus]);

    const toggleFlag = useCallback((row: number, col: number) => {
        if (!socket || state.playerStatus !== 'playing') return;
        socket.emit('toggle-flag', { roomCode: state.roomCode, row, col });
    }, [socket, state.roomCode, state.playerStatus]);

    const requestResults = useCallback(() => {
        if (!socket) return;
        socket.emit('get-results', { roomCode: state.roomCode });
    }, [socket, state.roomCode]);

    const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
    const reset = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        dispatch({ type: 'RESET' });
    }, []);

    // ── Derived ──
    const isHost = state.playerId === state.host;
    const safeCells = (state.rows * state.cols) - state.totalMines;
    const progress = safeCells > 0 ? Math.round((state.cellsRevealed / safeCells) * 100) : 0;
    const formattedTime = (() => {
        const secs = Math.ceil(state.timeRemaining / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    })();

    const flagCount = state.board.flat().filter(c => c.state === 'flagged').length;

    return {
        ...state,
        isConnected,
        isConnecting,
        socketError,

        // Derived
        isHost,
        safeCells,
        progress,
        formattedTime,
        flagCount,

        // Actions
        setPlayerName,
        createRoom,
        joinRoom,
        toggleReady,
        changeDifficulty,
        startGame,
        revealCell,
        toggleFlag,
        requestResults,
        clearError,
        reset,
    };
}