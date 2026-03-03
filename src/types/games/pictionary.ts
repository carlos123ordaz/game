/* ═══════════════════════════════════════════
   PICTIONARY TYPES
   ═══════════════════════════════════════════ */

export type PictionaryPhase =
    | 'name'
    | 'lobby'
    | 'word-select'
    | 'drawing'
    | 'turn-end'
    | 'game-end';

export interface PictionaryPlayer {
    id: string;
    name: string;
    score: number;
    connected: boolean;
    isHost: boolean;
}

export interface WordOption {
    word: string;
    category: string;
    difficulty: number;
}

export interface Stroke {
    points: { x: number; y: number }[];
    color: string;
    width: number;
    tool: 'pen' | 'eraser';
}

export interface ChatMessage {
    type: 'guess' | 'correct' | 'close' | 'system';
    playerId?: string;
    playerName?: string;
    text: string;
    isClose?: boolean;
    timestamp?: number;
}

export interface TurnScore {
    playerId: string;
    playerName: string;
    points: number;
    isFirst: boolean;
}

export interface TurnEndData {
    word: string;
    reason: 'time-up' | 'all-guessed' | 'drawer-left';
    scores: TurnScore[];
    players: PictionaryPlayer[];
}

export interface GameEndData {
    reason: 'complete' | 'not-enough-players';
    finalScores: PictionaryPlayer[];
}

export interface GameRestoreData {
    currentRound: number;
    totalRounds: number;
    drawerId: string;
    drawerName: string;
    isDrawing: boolean;
    word: string | null;
    hint: string | null;
    wordLength: number;
    strokes: Stroke[];
    messages: ChatMessage[];
    guessedPlayerIds: string[];
    timeLeft: number;
}