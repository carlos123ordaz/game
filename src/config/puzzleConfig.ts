/* ═══════════════════════════════════════════
   PUZZLE IMAGE CATALOG — Frontend mirror
   Must stay in sync with server/games/puzzle.js
   ═══════════════════════════════════════════ */

export const PUZZLE_IMAGES = [
    { id: 0, name: 'Aurora Boreal', emoji: '🌌', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=800&fit=crop&crop=center' },
    { id: 1, name: 'Atardecer', emoji: '🌅', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&h=800&fit=crop&crop=center' },
    { id: 2, name: 'Océano', emoji: '🌊', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=800&fit=crop&crop=center' },
    { id: 3, name: 'Bosque', emoji: '🌲', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=800&fit=crop&crop=center' },
    { id: 4, name: 'Galaxia', emoji: '🪐', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=800&fit=crop&crop=center' },
    { id: 5, name: 'Desierto', emoji: '🏜️', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&h=800&fit=crop&crop=center' },
    { id: 6, name: 'Montañas', emoji: '🏔️', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop&crop=center' },
    { id: 7, name: 'Ciudad', emoji: '🌃', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=800&fit=crop&crop=center' },
    { id: 8, name: 'Flores', emoji: '🌸', url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&h=800&fit=crop&crop=center' },
] as const;

export const DIFFICULTY_CONFIG = {
    easy: { label: 'Fácil', desc: '3×3 — 9 piezas', emoji: '😊' },
    medium: { label: 'Medio', desc: '4×4 — 16 piezas', emoji: '🤔' },
    hard: { label: 'Difícil', desc: '5×5 — 25 piezas', emoji: '🔥' },
} as const;