import type { WordOption } from '../../../types/games/pictionary';

interface Props {
    options: WordOption[];
    drawerName: string;
    onSelectWord: (index: number) => void;
    currentRound: number;
    totalRounds: number;
}

const difficultyLabels: Record<number, { text: string; color: string }> = {
    1: { text: 'Fácil', color: '#22c55e' },
    2: { text: 'Medio', color: '#f59e0b' },
    3: { text: 'Difícil', color: '#ef4444' },
};

export function WordSelect({ options, drawerName, onSelectWord, currentRound, totalRounds }: Props) {
    return (
        <div className="pic">
            <div className="pic__card pic__card--wide">
                <div className="pic__round-badge">Ronda {currentRound}/{totalRounds}</div>
                <span className="pic__emoji">🎨</span>
                <h2 className="pic__title">¡Te toca dibujar, {drawerName}!</h2>
                <p className="pic__subtitle">Elige una palabra para dibujar</p>

                <div className="pic__word-options">
                    {options.map((opt, i) => {
                        const diff = difficultyLabels[opt.difficulty] || difficultyLabels[2];
                        return (
                            <button key={i} className="pic__word-option" onClick={() => onSelectWord(i)}>
                                <span className="pic__word-text">{opt.word}</span>
                                <div className="pic__word-meta">
                                    <span className="pic__word-category">{opt.category}</span>
                                    <span className="pic__word-diff" style={{ color: diff.color }}>
                                        {diff.text}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <p className="pic__hint-text">
                    Si no eliges en 15 segundos, se seleccionará una automáticamente
                </p>
            </div>
        </div>
    );
}