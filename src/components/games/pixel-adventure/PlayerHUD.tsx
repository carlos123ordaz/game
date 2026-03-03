import { useState } from 'react';
import type { GamePlayer, TurnPhase } from '../../../types/games/pixelAdventure';

const SPRITES = ['👾', '🤖', '👹', '🎃', '🐸', '🦊', '🐱', '🐼'];

interface Props {
    players: GamePlayer[];
    myPlayer: GamePlayer | null;
    currentPlayerId: string;
    isMyTurn: boolean;
    turnPhase: TurnPhase;
    isRolling: boolean;
    diceValue: number | null;
    preciseDicePrompt: boolean;
    onRollDice: () => void;
    onUseItem: (index: number) => void;
    onPreciseDice: (value: number) => void;
}

export function PlayerHUD({
    players, myPlayer, currentPlayerId, isMyTurn, turnPhase,
    isRolling, diceValue, preciseDicePrompt,
    onRollDice, onUseItem, onPreciseDice,
}: Props) {
    const [preciseVal, setPreciseVal] = useState(6);
    const currentPlayer = players.find(p => p.id === currentPlayerId);

    return (
        <div className="hud">
            {/* Current turn indicator */}
            <div className={`hud__turn ${isMyTurn ? 'hud__turn--mine' : ''}`}>
                <span className="hud__turn-sprite">
                    {currentPlayer ? SPRITES[currentPlayer.spriteIndex % SPRITES.length] : '?'}
                </span>
                <div className="hud__turn-info">
                    <span className="hud__turn-label">
                        {isMyTurn ? '¡TU TURNO!' : `Turno de ${currentPlayer?.name || '...'}`}
                    </span>
                    <span className="hud__turn-phase">
                        {turnPhase === 'item_phase' && isMyTurn && 'Usa un item o tira el dado'}
                        {turnPhase === 'moving' && 'Moviendo...'}
                        {turnPhase === 'resolving' && 'Resolviendo casilla...'}
                        {turnPhase === 'decision' && isMyTurn && '¡Toma una decisión!'}
                        {(turnPhase === 'targeting' || turnPhase === 'event_targeting') && isMyTurn && 'Elige un jugador'}
                    </span>
                </div>
            </div>

            {/* Dice section */}
            {isMyTurn && turnPhase === 'item_phase' && (
                <button
                    className={`hud__dice-btn ${isRolling ? 'hud__dice-btn--rolling' : ''}`}
                    onClick={onRollDice}
                    disabled={isRolling}
                >
                    <span className="hud__dice-face">
                        {isRolling ? '🎲' : diceValue ? diceValue : '🎲'}
                    </span>
                    <span className="hud__dice-label">
                        {isRolling ? 'TIRANDO...' : 'TIRAR DADO'}
                    </span>
                </button>
            )}

            {/* Precise dice prompt */}
            {isMyTurn && preciseDicePrompt && (
                <div className="hud__precise">
                    <span className="hud__precise-label">🎯 ELIGE UN NÚMERO (1-12)</span>
                    <div className="hud__precise-controls">
                        <input
                            type="range"
                            min={1}
                            max={12}
                            value={preciseVal}
                            onChange={(e) => setPreciseVal(parseInt(e.target.value))}
                            className="hud__precise-slider"
                        />
                        <span className="hud__precise-value">{preciseVal}</span>
                        <button className="pixel-btn pixel-btn--primary" onClick={() => onPreciseDice(preciseVal)}>
                            CONFIRMAR
                        </button>
                    </div>
                </div>
            )}

            {/* Dice result display */}
            {diceValue && turnPhase === 'moving' && (
                <div className="hud__dice-result">
                    <span className="hud__dice-number">{diceValue}</span>
                </div>
            )}

            {/* My items */}
            {myPlayer && (
                <div className="hud__items">
                    <span className="hud__items-title">📦 ITEMS ({myPlayer.items.length}/3)</span>
                    <div className="hud__items-grid">
                        {myPlayer.items.map((item, i) => (
                            <button
                                key={`${item.id}-${i}`}
                                className={`hud__item hud__item--${item.rarity}`}
                                onClick={() => onUseItem(i)}
                                disabled={!isMyTurn || turnPhase !== 'item_phase'}
                                title={`${item.name}: ${item.description}`}
                            >
                                <span className="hud__item-emoji">{item.emoji}</span>
                                <span className="hud__item-name">{item.name}</span>
                            </button>
                        ))}
                        {Array.from({ length: 3 - (myPlayer.items.length || 0) }).map((_, i) => (
                            <div key={`empty-${i}`} className="hud__item hud__item--empty">
                                <span className="hud__item-emoji">·</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Scoreboard */}
            <div className="hud__scores">
                <span className="hud__scores-title">🏆 POSICIONES</span>
                {[...players].sort((a, b) => b.position - a.position).map((p, i) => (
                    <div key={p.id} className={`hud__score-row ${p.id === myPlayer?.id ? 'hud__score-row--me' : ''} ${!p.connected ? 'hud__score-row--off' : ''}`}>
                        <span className="hud__score-rank">#{i + 1}</span>
                        <span className="hud__score-sprite">{SPRITES[p.spriteIndex % SPRITES.length]}</span>
                        <span className="hud__score-name">{p.name}</span>
                        <span className="hud__score-pos">Cas. {p.position}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}