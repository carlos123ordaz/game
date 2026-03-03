import { useState } from 'react';

interface Props {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function PANameEntry({ playerName, onSetName, onCreateRoom, onJoinRoom, isConnected }: Props) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState<'choose' | 'join'>('choose');
    const canProceed = playerName.trim().length > 0 && isConnected;

    return (
        <div className="pa-center">
            <div className="pixel-card">
                <div className="pixel-card__header">
                    <span className="pixel-title-icon">👾</span>
                    <h2 className="pixel-title">AVENTURA PIXELADA</h2>
                </div>
                <p className="pixel-subtitle">
                    Un juego de tablero con trampas, items y decisiones. 2-8 jugadores.
                </p>

                <div className="pixel-input-group">
                    <label className="pixel-label">NOMBRE</label>
                    <input
                        className="pixel-input"
                        type="text"
                        placeholder="Tu nombre..."
                        value={playerName}
                        onChange={(e) => onSetName(e.target.value)}
                        maxLength={16}
                    />
                </div>

                {mode === 'choose' ? (
                    <div className="pixel-actions">
                        <button className="pixel-btn pixel-btn--primary" onClick={onCreateRoom} disabled={!canProceed}>
                            ⚔️ CREAR SALA
                        </button>
                        <button className="pixel-btn pixel-btn--secondary" onClick={() => setMode('join')} disabled={!canProceed}>
                            🔗 UNIRME
                        </button>
                    </div>
                ) : (
                    <div className="pixel-join">
                        <div className="pixel-input-group">
                            <label className="pixel-label">CÓDIGO</label>
                            <input
                                className="pixel-input pixel-input--code"
                                type="text"
                                placeholder="ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </div>
                        <div className="pixel-actions">
                            <button className="pixel-btn pixel-btn--primary" onClick={() => onJoinRoom(joinCode)} disabled={!canProceed || joinCode.length < 4}>
                                ENTRAR
                            </button>
                            <button className="pixel-btn pixel-btn--ghost" onClick={() => setMode('choose')}>
                                ← VOLVER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}