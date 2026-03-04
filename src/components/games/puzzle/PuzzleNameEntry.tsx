import { useState } from 'react';
import { Button } from '../../common/Button';

interface PuzzleNameEntryProps {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function PuzzleNameEntry({
    playerName,
    onSetName,
    onCreateRoom,
    onJoinRoom,
    isConnected,
}: PuzzleNameEntryProps) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState<'choose' | 'join'>('choose');

    const canProceed = playerName.trim().length >= 2 && isConnected;

    return (
        <div className="puzzle-entry">
            <div className="puzzle-entry__icon">🧩</div>
            <h1 className="puzzle-entry__title">Rompecabezas</h1>
            <p className="puzzle-entry__subtitle">
                Compite armando el mismo rompecabezas. ¡El más rápido gana!
            </p>

            <div className="puzzle-entry__field">
                <label className="puzzle-entry__label">Tu nombre</label>
                <input
                    className="puzzle-entry__input"
                    type="text"
                    placeholder="Escribe tu nombre..."
                    value={playerName}
                    onChange={(e) => onSetName(e.target.value)}
                    maxLength={20}
                    autoFocus
                />
            </div>

            {mode === 'choose' ? (
                <div className="puzzle-entry__actions">
                    <Button
                        variant="primary"
                        onClick={onCreateRoom}
                        disabled={!canProceed}
                    >
                        🏠 Crear sala
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setMode('join')}
                        disabled={!canProceed}
                    >
                        🔗 Unirme a sala
                    </Button>
                </div>
            ) : (
                <div className="puzzle-entry__join">
                    <input
                        className="puzzle-entry__input puzzle-entry__input--code"
                        type="text"
                        placeholder="Código de sala"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                    />
                    <div className="puzzle-entry__actions">
                        <Button
                            variant="primary"
                            onClick={() => onJoinRoom(joinCode)}
                            disabled={!canProceed || joinCode.length < 4}
                        >
                            Entrar
                        </Button>
                        <Button variant="ghost" onClick={() => setMode('choose')}>
                            ← Volver
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}