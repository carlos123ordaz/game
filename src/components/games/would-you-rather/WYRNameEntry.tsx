import { useState } from 'react';

interface WYRNameEntryProps {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function WYRNameEntry({
    playerName,
    onSetName,
    onCreateRoom,
    onJoinRoom,
    isConnected,
}: WYRNameEntryProps) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState<'choose' | 'join'>('choose');

    const canProceed = playerName.trim().length > 0 && isConnected;

    return (
        <div className="wyr">
            <div className="wyr__card">
                <span className="wyr__emoji">🤔</span>
                <h2 className="wyr__title">¿Qué Prefieres?</h2>
                <p className="wyr__subtitle">
                    Dilemas divertidos para descubrir qué tan parecidos piensan
                </p>

                <div className="wyr__input-group">
                    <label className="wyr__label" htmlFor="wyr-name">
                        Tu nombre
                    </label>
                    <input
                        id="wyr-name"
                        className="wyr__input"
                        type="text"
                        placeholder="Escribe tu nombre..."
                        value={playerName}
                        onChange={(e) => onSetName(e.target.value)}
                        maxLength={20}
                    />
                </div>

                {mode === 'choose' ? (
                    <div className="wyr__actions">
                        <button
                            className="wyr__btn wyr__btn--primary"
                            onClick={onCreateRoom}
                            disabled={!canProceed}
                        >
                            🎮 Crear sala
                        </button>
                        <button
                            className="wyr__btn wyr__btn--secondary"
                            onClick={() => setMode('join')}
                            disabled={!canProceed}
                        >
                            🔗 Unirme con código
                        </button>
                    </div>
                ) : (
                    <div className="wyr__join-section">
                        <div className="wyr__input-group">
                            <label className="wyr__label" htmlFor="wyr-code">
                                Código de sala
                            </label>
                            <input
                                id="wyr-code"
                                className="wyr__input wyr__input--code"
                                type="text"
                                placeholder="Ej: ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </div>
                        <div className="wyr__actions">
                            <button
                                className="wyr__btn wyr__btn--primary"
                                onClick={() => onJoinRoom(joinCode)}
                                disabled={!canProceed || joinCode.length < 4}
                            >
                                Unirme
                            </button>
                            <button
                                className="wyr__btn wyr__btn--ghost"
                                onClick={() => setMode('choose')}
                            >
                                ← Volver
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}