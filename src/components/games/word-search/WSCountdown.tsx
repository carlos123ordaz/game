// ═══════════════════════════════════════════
//  WSCountdown.tsx
// ═══════════════════════════════════════════

import type { WordSearchCategory } from '../../../types/games/word-search';

interface WSCountdownProps {
    roundIndex: number;
    maxRounds: number;
    category: WordSearchCategory | null;
    countdown: number;
}

export function WSCountdown({ roundIndex, maxRounds, category, countdown }: WSCountdownProps) {
    return (
        <div className="ws-countdown">
            <div className="ws-countdown__round">Ronda {roundIndex + 1} de {maxRounds}</div>
            {category && (
                <div className="ws-countdown__category">
                    <span className="ws-countdown__category-emoji">{category.emoji}</span>
                    <span className="ws-countdown__category-name">{category.name}</span>
                </div>
            )}
            <div className="ws-countdown__number" key={countdown}>
                {countdown > 0 ? countdown : '¡YA!'}
            </div>
            <p className="ws-countdown__hint">Prepárate para buscar palabras...</p>
        </div>
    );
}