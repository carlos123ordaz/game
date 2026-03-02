import type { GameConfig } from '../types/common';

/* ═══════════════════════════════════════════
   GAME REGISTRY — Add new games here
   ═══════════════════════════════════════════ */

export const GAMES: GameConfig[] = [
  {
    id: 'quiz',
    name: '¿Qué tanto se conocen?',
    description: 'Descubran qué tan compatibles son respondiendo las mismas preguntas y comparando sus respuestas.',
    emoji: '💜',
    minPlayers: 2,
    maxPlayers: 2,
    path: '/games/quiz',
    namespace: '/quiz',
    color: '#6c5ce7',
    tags: ['parejas', 'amigos', '2 jugadores'],
  },
  // ── Add more games here ──
  // {
  //   id: 'trivia',
  //   name: 'Trivia Battle',
  //   description: 'Compite contra otros en trivia de cultura general.',
  //   emoji: '🧠',
  //   minPlayers: 2,
  //   maxPlayers: 6,
  //   path: '/games/trivia',
  //   namespace: '/trivia',
  //   color: '#00cec9',
  //   tags: ['multijugador', 'trivia'],
  // },
];

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find(g => g.id === id);
}
