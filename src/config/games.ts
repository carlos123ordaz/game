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
  {
    id: 'would-you-rather',
    name: '¿Qué Prefieres?',
    emoji: '🤔',
    description: 'Dilemas divertidos para descubrir qué tan parecidos piensan. Elige entre dos opciones y compara.',
    path: '/games/would-you-rather',
    namespace: '/would-you-rather',  // ← esto faltaba
    minPlayers: 2,
    maxPlayers: 2,
    color: '#f97316',
    tags: ['dilemas', 'pareja', 'amigos']
  },
  {
    id: 'pictionary',
    name: 'Pictionary',
    emoji: '🎨',
    description: 'Dibuja, adivina y diviértete. Elige una palabra, haz tu mejor dibujo y mira si te adivinan.',
    path: '/games/pictionary',
    namespace: '/pictionary',
    minPlayers: 2,
    maxPlayers: 8,
    color: '#10b981',
    tags: ['dibujo', 'multijugador', 'clásico']
  },
  {
    id: 'pixel-adventure',
    name: 'Aventura Pixelada',
    emoji: '👾',
    description: 'Serpientes, escaleras, trampas, items y decisiones en un tablero pixel art. ¡2-8 jugadores!',
    path: '/games/pixel-adventure',
    namespace: '/pixel-adventure',
    minPlayers: 2,
    maxPlayers: 8,
    color: '#ff6e6c',
    tags: ['tablero', 'pixel art', 'estrategia', 'multijugador']
  },
  {
    id: 'word-search',
    name: 'Busca Palabras',
    emoji: '🔎',
    description: 'Encuentra palabras ocultas en una cuadrícula. ¡2-8 jugadores!',
    path: '/games/word-search',
    namespace: '/word-search',
    minPlayers: 2,
    maxPlayers: 8,
    color: '#ff6e6c',
    tags: ['tablero', 'busqueda', 'multijugador']
  },
];

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find(g => g.id === id);
}
