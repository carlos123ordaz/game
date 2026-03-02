/* ═══════════════════════════════════════════
   COMMON TYPES — Game Hub
   ═══════════════════════════════════════════ */

export interface GameConfig {
  id: string;
  name: string;
  description: string;
  emoji: string;
  minPlayers: number;
  maxPlayers: number;
  path: string;
  namespace: string;
  color: string;
  tags: string[];
}

export type GameStatus = 'idle' | 'connecting' | 'waiting' | 'playing' | 'finished' | 'error';

export interface Player {
  id: string;
  name: string;
  ready: boolean;
  answered: boolean;
}

export interface RoomState {
  code: string;
  playerId: string;
  players: Player[];
  status: GameStatus;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
