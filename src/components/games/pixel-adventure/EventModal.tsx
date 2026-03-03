import type {
    GameEvent, GameTrap, GameDecision, GameItem, GamePlayer,
    TileEffect, TargetPrompt,
} from '../../../types/games/pixelAdventure';

const SPRITES = ['👾', '🤖', '👹', '🎃', '🐸', '🦊', '🐱', '🐼'];

interface Props {
    activeEvent: GameEvent | null;
    activeTrap: GameTrap | null;
    activeDecision: GameDecision | null;
    activeTileEffect: TileEffect | null;
    receivedItem: GameItem | null;
    targetPrompt: TargetPrompt | null;
    turnSkipped: { playerId: string; playerName: string } | null;
    isMyTurn: boolean;
    playerId: string;
    players: GamePlayer[];
    onMakeDecision: (choice: 'A' | 'B') => void;
    onSelectTarget: (targetId: string) => void;
    onEventTarget: (targetId: string) => void;
    onClearEffects: () => void;
}

export function EventModal({
    activeEvent, activeTrap, activeDecision, activeTileEffect,
    receivedItem, targetPrompt, turnSkipped,
    isMyTurn, playerId, players,
    onMakeDecision, onSelectTarget, onEventTarget, onClearEffects,
}: Props) {
    // Event
    if (activeEvent) {
        return (
            <div className="modal-overlay" onClick={onClearEffects}>
                <div className="pixel-modal" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--event">EVENTO</div>
                    <span className="pixel-modal__emoji">{activeEvent.emoji}</span>
                    <h3 className="pixel-modal__title">{activeEvent.name}</h3>
                    <p className="pixel-modal__desc">{activeEvent.description}</p>
                </div>
            </div>
        );
    }

    // Trap
    if (activeTrap) {
        return (
            <div className="modal-overlay" onClick={onClearEffects}>
                <div className="pixel-modal" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--trap">¡TRAMPA!</div>
                    <span className="pixel-modal__emoji">{activeTrap.emoji}</span>
                    <h3 className="pixel-modal__title">{activeTrap.name}</h3>
                    <p className="pixel-modal__desc">{activeTrap.description}</p>
                </div>
            </div>
        );
    }

    // Decision
    if (activeDecision && isMyTurn) {
        return (
            <div className="modal-overlay">
                <div className="pixel-modal pixel-modal--wide" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--decision">DECISIÓN</div>
                    <span className="pixel-modal__emoji">{activeDecision.emoji}</span>
                    <h3 className="pixel-modal__title">{activeDecision.name}</h3>
                    <p className="pixel-modal__desc">{activeDecision.description}</p>
                    <div className="pixel-modal__choices">
                        <button className="pixel-choice pixel-choice--a" onClick={() => onMakeDecision('A')}>
                            {activeDecision.optionA.label}
                        </button>
                        <span className="pixel-choice-vs">VS</span>
                        <button className="pixel-choice pixel-choice--b" onClick={() => onMakeDecision('B')}>
                            {activeDecision.optionB.label}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting for other player's decision
    if (activeDecision && !isMyTurn) {
        return (
            <div className="modal-overlay">
                <div className="pixel-modal" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--decision">DECISIÓN</div>
                    <span className="pixel-modal__emoji">{activeDecision.emoji}</span>
                    <h3 className="pixel-modal__title">{activeDecision.name}</h3>
                    <p className="pixel-modal__desc">Esperando decisión del jugador...</p>
                </div>
            </div>
        );
    }

    // Target selection
    if (targetPrompt && targetPrompt.playerId === playerId) {
        const isEventTarget = targetPrompt.action === 'event_swap';
        const targets = players.filter(p => p.id !== playerId && p.connected);

        return (
            <div className="modal-overlay">
                <div className="pixel-modal pixel-modal--wide" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--event">ELIGE JUGADOR</div>
                    <p className="pixel-modal__desc">{targetPrompt.message}</p>
                    <div className="pixel-modal__targets">
                        {targets.map(p => (
                            <button
                                key={p.id}
                                className="pixel-target"
                                onClick={() => isEventTarget ? onEventTarget(p.id) : onSelectTarget(p.id)}
                            >
                                <span className="pixel-target__sprite">{SPRITES[p.spriteIndex % SPRITES.length]}</span>
                                <span className="pixel-target__name">{p.name}</span>
                                <span className="pixel-target__pos">Cas. {p.position}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Tile effect (ladder/snake animation notification)
    if (activeTileEffect) {
        const msg = activeTileEffect.type === 'ladder' ? '🪜 ¡Escalera!' :
            activeTileEffect.type === 'snake' ? '🐍 ¡Serpiente!' :
                activeTileEffect.type === 'star' ? '⭐ ¡Estrella!' :
                    activeTileEffect.type === 'shield_block' ? '🛡️ ¡Escudo bloqueó!' : '';
        if (!msg) return null;

        return (
            <div className="modal-overlay modal-overlay--transparent" onClick={onClearEffects}>
                <div className="pixel-toast">
                    <span className="pixel-toast__text">{msg}</span>
                    {activeTileEffect.from !== undefined && activeTileEffect.to !== undefined && (
                        <span className="pixel-toast__detail">{activeTileEffect.from} → {activeTileEffect.to}</span>
                    )}
                </div>
            </div>
        );
    }

    // Item received
    if (receivedItem) {
        return (
            <div className="modal-overlay" onClick={onClearEffects}>
                <div className="pixel-modal" onClick={e => e.stopPropagation()}>
                    <div className="pixel-modal__header pixel-modal__header--item">¡ITEM!</div>
                    <span className="pixel-modal__emoji">{receivedItem.emoji}</span>
                    <h3 className="pixel-modal__title">{receivedItem.name}</h3>
                    <p className="pixel-modal__desc">{receivedItem.description}</p>
                    <span className={`pixel-modal__rarity pixel-modal__rarity--${receivedItem.rarity}`}>
                        {receivedItem.rarity.toUpperCase()}
                    </span>
                </div>
            </div>
        );
    }

    // Turn skipped
    if (turnSkipped) {
        return (
            <div className="modal-overlay modal-overlay--transparent" onClick={onClearEffects}>
                <div className="pixel-toast">
                    <span className="pixel-toast__text">⏭️ {turnSkipped.playerName} pierde su turno</span>
                </div>
            </div>
        );
    }

    return null;
}