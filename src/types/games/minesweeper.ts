/* ═══════════════════════════════════════════
   MINESWEEPER TYPES
   ═══════════════════════════════════════════ */

export type Difficulty = 'easy' | 'medium' | 'hard';

export type MinesweeperPhase = 'name' | 'lobby' | 'playing' | 'results';

export type CellState = 'hidden' | 'revealed' | 'flagged' | 'mine';

export interface CellData {
    row: number;
    col: number;
    state: CellState;
    value: number; // 0-8 adjacent mines, -1 for mine
}

export interface PlayerStats {
    id: string;
    name: string;
    score: number;
    lives: number;
    status: 'playing' | 'eliminated' | 'cleared';
    cellsRevealed: number;
    correctFlags: number;
    progress: number;
}

export interface RevealedCell {
    row: number;
    col: number;
    value: number;
}

export interface GameStartData {
    rows: number;
    cols: number;
    mines: number;
    duration: number;
    players: PlayerStats[];
}

export interface MinesweeperResultPlayer {
    name: string;
    score: number;
    lives: number;
    status: 'playing' | 'eliminated' | 'cleared';
    cellsRevealed: number;
    correctFlags: number;
    minesHit: number;
    progress: number;
}

export interface MinesweeperResults {
    players: MinesweeperResultPlayer[];
    duration: number;
    difficulty: Difficulty;
    boardSize: string;
    totalMines: number;
    safeCells: number;
}

export interface RoomUpdateData {
    players: { id: string; name: string; ready: boolean }[];
    difficulty: Difficulty;
    host: string;
}