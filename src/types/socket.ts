import type { Player } from './common';
import type { Question, QuizResults } from './games/quiz';

/* ═══════════════════════════════════════════
   SOCKET EVENT MAPS — Type-safe events
   ═══════════════════════════════════════════ */

// Quiz namespace events
export interface QuizClientEvents {
  'create-room': (data: { playerName: string }) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'get-room-state': (data: { roomCode: string }) => void;
  'submit-answers': (data: {
    roomCode: string;
    playerName: string;
    answers: { [questionId: number]: number };
  }) => void;
  'get-results': (data: { roomCode: string }) => void;
}

export interface QuizServerEvents {
  'room-created': (data: { code: string; playerId: string }) => void;
  'room-joined': (data: { code: string; playerId: string }) => void;
  'room-update': (data: { players: Player[] }) => void;
  'game-start': (data: { questions: Question[] }) => void;
  'partner-answered': () => void;
  'show-results': () => void;
  'results-data': (data: QuizResults) => void;
  'error': (data: { message: string }) => void;
}
