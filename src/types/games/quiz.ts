export interface Question {
  id: number;
  emoji: string;
  text: string;
  options: string[];
}

export interface QuizAnswer {
  [questionId: number]: number;
}

export interface BreakdownItem {
  questionId: number;
  questionText: string;
  emoji: string;
  player1Answer: string;
  player2Answer: string;
  matched: boolean;
}

export interface QuizResults {
  percentage: number;
  matchedQuestions: number;
  totalQuestions: number;
  breakdown: BreakdownItem[];
  players: { name: string }[];
}

export type QuizPhase = 'name' | 'lobby' | 'playing' | 'waiting' | 'results';
