/* ===================================================================
   LUDO - TypeScript Types
   File: src/types/games/ludo.ts
   =================================================================== */

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoColorData {
    label: string;
    hex: string;
    emoji: string;
}

export const COLOR_MAP: Record<LudoColor, LudoColorData> = {
    red: { label: 'Rojo', hex: '#EF4444', emoji: '\u{1F534}' },
    green: { label: 'Verde', hex: '#22C55E', emoji: '\u{1F7E2}' },
    yellow: { label: 'Amarillo', hex: '#EAB308', emoji: '\u{1F7E1}' },
    blue: { label: 'Azul', hex: '#3B82F6', emoji: '\u{1F535}' },
};

export interface BoardCell { r: number; c: number; }

export interface LudoPlayer {
    id: string;
    name: string;
    color: LudoColor;
    ready: boolean;
    tokens: number[] | null;
    finished: number;
    disconnected?: boolean;
}

export interface LudoMove {
    tokenIndex: number;
    from: number;
    to: number;
    isExit: boolean;
    isCapture: boolean;
    capturedColor: LudoColor | null;
    capturedTokenIdx: number | null;
    isFinish: boolean;
    isSafe: boolean;
}

export interface LudoEvent {
    type: string;
    player?: string;
    color?: LudoColor;
    message?: string;
    tokenIndex?: number;
    capturedPlayer?: string;
    capturedColor?: LudoColor;
    dice?: number;
    rank?: number;
    finished?: number;
}

export interface LudoGameState {
    code: string;
    status: 'waiting' | 'playing' | 'finished';
    players: LudoPlayer[];
    currentTurn: number;
    currentPlayerColor: LudoColor | null;
    diceValue: number | null;
    validMoves: LudoMove[];
    turnPhase: 'roll' | 'select' | 'moving';
    lastEvent: LudoEvent | null;
    consecutiveSixes: number;
    winner: LudoColor | null;
    rankings: LudoColor[];
}

export type LudoPhase = 'name' | 'lobby' | 'playing' | 'finished';

export const MAIN_PATH: BoardCell[] = [
    { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
    { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
    { r: 7, c: 0 }, { r: 6, c: 0 },
    { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
    { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
    { r: 0, c: 7 }, { r: 0, c: 8 },
    { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
    { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
    { r: 7, c: 14 }, { r: 8, c: 14 },
    { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
    { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
    { r: 14, c: 7 }, { r: 14, c: 6 },
];

export const START_POSITIONS: Record<LudoColor, number> = { red: 0, green: 13, yellow: 26, blue: 39 };

export const HOME_COLUMNS: Record<LudoColor, BoardCell[]> = {
    red: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 8, c: 7 }],
    green: [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }],
    yellow: [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }, { r: 6, c: 7 }],
    blue: [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }, { r: 7, c: 8 }],
};

export const BASE_POSITIONS: Record<LudoColor, BoardCell[]> = {
    red: [{ r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 }],
    green: [{ r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 }],
    yellow: [{ r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 }],
    blue: [{ r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 }],
};

export const SAFE_POSITIONS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export function relativeToAbsolute(color: LudoColor, relativePos: number): number | null {
    if (relativePos < 0 || relativePos > 50) return null;
    return (START_POSITIONS[color] + relativePos) % 52;
}

export function getTokenCoords(color: LudoColor, relativePos: number, tokenIndex: number): BoardCell {
    if (relativePos === -1) return BASE_POSITIONS[color][tokenIndex];
    if (relativePos >= 51 && relativePos <= 56) return HOME_COLUMNS[color][relativePos - 51];
    if (relativePos === 57) return { r: 7, c: 7 };
    const absPos = relativeToAbsolute(color, relativePos);
    if (absPos !== null) return MAIN_PATH[absPos];
    return BASE_POSITIONS[color][tokenIndex];
}