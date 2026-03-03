export interface Dilemma {
    id: number;
    emoji: string;
    text: string;
    optionA: string;
    optionB: string;
}

export type DilemmaChoice = 'A' | 'B';

export interface DilemmaAnswer {
    [dilemmaId: number]: DilemmaChoice;
}

export interface WYRBreakdownItem {
    dilemmaId: number;
    emoji: string;
    optionA: string;
    optionB: string;
    player1Choice: DilemmaChoice | null;
    player2Choice: DilemmaChoice | null;
    matched: boolean;
}

export interface WYRResults {
    percentage: number;
    matchedCount: number;
    totalCount: number;
    breakdown: WYRBreakdownItem[];
    players: { name: string }[];
}

export type WYRPhase = 'name' | 'lobby' | 'playing' | 'waiting' | 'results';