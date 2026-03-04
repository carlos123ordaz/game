/* ═══════════════════════════════════════════
   PUZZLE TYPES
   ═══════════════════════════════════════════ */

export type PuzzleDifficulty = 'easy' | 'medium' | 'hard';

export type PuzzlePhase = 'name' | 'lobby' | 'countdown' | 'playing' | 'finished';

export interface PuzzleImage {
    id: number;
    name: string;
    emoji: string;
    url: string;
}

export interface PuzzleGameConfig {
    gridSize: number;
    timeLimit: number;
    imageIndex: number;
    image: PuzzleImage;
    seed: number;
    shuffledPieces: number[];
}

export interface OpponentProgress {
    playerId: string;
    playerName: string;
    progress: number;
    moves: number;
}

export interface PuzzlePlayerResult {
    id: string;
    name: string;
    progress: number;
    moves: number;
    completed: boolean;
    completionTime: number | null;
}

export interface PuzzleResults {
    winner: {
        name: string;
        time: number | null;
        moves: number;
        progress: number;
        completed: boolean;
    } | null;
    players: PuzzlePlayerResult[];
    difficulty: PuzzleDifficulty;
    gridSize: number;
    imageIndex: number;
    imageName: string;
}