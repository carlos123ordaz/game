/* ═══════════════════════════════════════════
   WORD SEARCH — Type definitions
   ═══════════════════════════════════════════ */

export interface WordSearchCategory {
    id: string;
    name: string;
    emoji: string;
}

export interface GridCell {
    row: number;
    col: number;
}

export interface WordPlacement {
    word: string;
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
    direction: string;
    cells: GridCell[];
}

export interface FoundWordInfo {
    playerId: string;
    playerName: string;
    timestamp: number;
}

export interface WordFoundEvent {
    word: string;
    playerId: string;
    playerName: string;
    cells: GridCell[];
    remainingWords: number;
    scores: PlayerScore[];
}

export interface FindWordResult {
    success: boolean;
    word: string;
    reason?: string;
    points?: number;
    cells?: GridCell[];
}

export interface PlayerScore {
    playerId: string;
    name: string;
    score: number;
    wordsFound: number;
}

export interface RoundWordDetail {
    word: string;
    basePoints: number;
    firstBonus: number;
    speedBonus: number;
    total: number;
    isFirst: boolean;
}

export interface RoundDetail {
    roundIndex: number;
    category: string;
    points: number;
    words: RoundWordDetail[];
}

export interface FinalPlayerScore {
    playerId: string;
    name: string;
    total: number;
    wordsFound: number;
    rounds: RoundDetail[];
}

export interface RoundSummary {
    category: WordSearchCategory;
    totalWords: number;
    foundWords: number;
}

export interface GameResults {
    scores: FinalPlayerScore[];
    rounds: RoundSummary[];
}

export interface HintData {
    firstCell: GridCell;
    wordLength: number;
    direction: string;
}

export type WordSearchPhase =
    | 'name'
    | 'lobby'
    | 'countdown'
    | 'playing'
    | 'round-end'
    | 'between-rounds'
    | 'results';