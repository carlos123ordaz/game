/* ═══════════════════════════════════════════
   ANONYMOUS QUESTIONS — Types
   ═══════════════════════════════════════════ */

export type AnonPhase = 'name' | 'lobby' | 'writing' | 'answering' | 'guessing' | 'reveal';

export interface AnonSettings {
    questionsPerPlayer: number;
    allowSkipGuess: boolean;
    showTimers: boolean;
}

export interface AnonPlayer {
    id: string;
    name: string;
    ready: boolean;
    connected: boolean;
    score: number;
}

export interface AnonQuestion {
    id: string;
    text: string;
}

export interface AnonQuestionWithAnswers {
    id: string;
    text: string;
    answers: {
        playerId: string;
        playerName: string;
        answer: string;
    }[];
}

export interface PossibleAuthor {
    id: string;
    name: string;
}

export interface PhaseProgress {
    phase: string;
    completed: number;
    total: number;
}

/* ── Results ── */

export interface GuessResult {
    guesserId: string;
    guesserName: string;
    guessedId: string | null;
    guessedName: string;
    correct: boolean;
}

export interface QuestionResult {
    questionId: string;
    questionText: string;
    authorId: string;
    authorName: string;
    answers: {
        playerId: string;
        playerName: string;
        answer: string;
    }[];
    guesses: GuessResult[];
    correctGuessCount: number;
    totalGuessers: number;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    connected: boolean;
    questionsWritten: number;
    correctGuesses: number;
    timesFooled: number;
}

export interface AnonResults {
    questions: QuestionResult[];
    leaderboard: LeaderboardEntry[];
    totalPlayers: number;
    totalQuestions: number;
}

export interface RoomInfo {
    players: AnonPlayer[];
    settings: AnonSettings;
    host: string;
    phase: AnonPhase;
    timeRemaining: number | null;
}