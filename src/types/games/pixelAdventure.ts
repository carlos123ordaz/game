/* ═══════════════════════════════════════════
   PIXEL ADVENTURE — Types
   ═══════════════════════════════════════════ */

export type GamePhase = 'name' | 'lobby' | 'playing' | 'finished';
export type TurnPhase = 'idle' | 'item_phase' | 'precise_dice' | 'rolling' | 'moving' | 'resolving' | 'decision' | 'targeting' | 'event_targeting' | 'finished';

export interface BoardTile {
    id: number;
    type: 'normal' | 'ladder' | 'snake' | 'event' | 'item' | 'decision' | 'trap' | 'star';
    icon: string;
    label?: string;
    target?: number;
}

export interface GameItem {
    id: string;
    name: string;
    emoji: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic';
}

export interface GamePlayer {
    id: string;
    name: string;
    position: number;
    score: number;
    items: GameItem[];
    connected: boolean;
    isHost: boolean;
    colorIndex: number;
    spriteIndex: number;
    skipNextTurn: boolean;
    hasShield: boolean;
    turboNext: boolean;
}

export interface GameEvent {
    id: string;
    name: string;
    emoji: string;
    description: string;
    effect: string;
    value: number;
}

export interface GameTrap {
    id: string;
    name: string;
    emoji: string;
    description: string;
    effect: string;
    value: number;
}

export interface GameDecision {
    id: string;
    name: string;
    emoji: string;
    description: string;
    optionA: { label: string; effect: string; value?: number;[key: string]: any };
    optionB: { label: string; effect: string; value?: number;[key: string]: any };
}

export interface LogEntry {
    type: 'system' | 'event' | 'item' | 'dice';
    text: string;
    timestamp: number;
}

export interface DiceResult {
    playerId: string;
    diceValue: number;
    from: number;
    to: number;
    players: GamePlayer[];
}

export interface TileEffect {
    type: 'ladder' | 'snake' | 'star' | 'shield_block';
    playerId: string;
    from?: number;
    to?: number;
    players?: GamePlayer[];
}

export interface TargetPrompt {
    playerId: string;
    action: string;
    message: string;
}

export interface GameOverData {
    reason: 'winner' | 'not-enough-players';
    winnerId?: string;
    finalScores: GamePlayer[];
}