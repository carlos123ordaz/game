import { useState } from 'react';
import { Button } from '../../common/Button';
import type { Difficulty } from '../../../types/games/minesweeper';

interface MinesweeperNameEntryProps {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: (difficulty?: Difficulty) => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

const DIFFICULTY_INFO: Record<Difficulty, { label: string; desc: string; emoji: string }> = {
    easy: { label: 'Fácil', desc: '9×9 · 10 minas', emoji: '🟢' },
    medium: { label: 'Medio', desc: '16×16 · 40 minas', emoji: '🟡' },
    hard: { label: 'Difícil', desc: '16×30 · 99 minas', emoji: '🔴' },
};

export function MinesweeperNameEntry({
    playerName,
    onSetName,
    onCreateRoom,
    onJoinRoom,
    isConnected,
}: MinesweeperNameEntryProps) {
    const [joinCode, setJoinCode] = useState('');
    const [showJoin, setShowJoin] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

    const canProceed = playerName.trim().length >= 2 && isConnected;

    return (
        <div className="ms-entry">
            <div className="ms-entry__header">
                <div className="ms-entry__icon">💣</div>
                <h1 className="ms-entry__title">Buscaminas</h1>
                <p className="ms-entry__subtitle">Competitivo</p>
            </div>

            <div className="ms-entry__form">
                <label className="ms-entry__label">Tu nombre</label>
                <input
                    className="ms-entry__input"
                    type="text"
                    placeholder="Escribe tu nombre..."
                    value={playerName}
                    onChange={(e) => onSetName(e.target.value)}
                    maxLength={20}
                    autoFocus
                />
            </div>

            {!showJoin ? (
                <>
                    <div className="ms-entry__difficulty">
                        <label className="ms-entry__label">Dificultad</label>
                        <div className="ms-entry__diff-options">
                            {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((d) => (
                                <button
                                    key={d}
                                    className={`ms-entry__diff-btn ${selectedDifficulty === d ? 'ms-entry__diff-btn--active' : ''}`}
                                    onClick={() => setSelectedDifficulty(d)}
                                >
                                    <span className="ms-entry__diff-emoji">{DIFFICULTY_INFO[d].emoji}</span>
                                    <span className="ms-entry__diff-label">{DIFFICULTY_INFO[d].label}</span>
                                    <span className="ms-entry__diff-desc">{DIFFICULTY_INFO[d].desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ms-entry__actions">
                        <Button
                            variant="primary"
                            onClick={() => onCreateRoom(selectedDifficulty)}
                            disabled={!canProceed}
                        >
                            Crear sala
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setShowJoin(true)}
                            disabled={!canProceed}
                        >
                            Unirse con código
                        </Button>
                    </div>
                </>
            ) : (
                <div className="ms-entry__join">
                    <label className="ms-entry__label">Código de sala</label>
                    <input
                        className="ms-entry__input ms-entry__input--code"
                        type="text"
                        placeholder="ABC123"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        autoFocus
                    />
                    <div className="ms-entry__actions">
                        <Button
                            variant="primary"
                            onClick={() => onJoinRoom(joinCode)}
                            disabled={!canProceed || joinCode.length < 4}
                        >
                            Unirse
                        </Button>
                        <Button variant="ghost" onClick={() => setShowJoin(false)}>
                            Volver
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}