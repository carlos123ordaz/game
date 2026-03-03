import { useState } from 'react';

interface Props {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function PictionaryNameEntry({ playerName, onSetName, onCreateRoom, onJoinRoom, isConnected }: Props) {
    const [joinCode, setJoinCode] = useState('');
    const [mode, setMode] = useState<'choose' | 'join'>('choose');
    const canProceed = playerName.trim().length > 0 && isConnected;

    return (
        <div className="pic">
            <div className="pic__card">
                <span className="pic__emoji">🎨</span>
                <h2 className="pic__title">Pictionary</h2>
                <p className="pic__subtitle">
                    Dibuja, adivina y diviértete con amigos. ¿Podrán descifrar tus obras maestras?
                </p>

                <div className="pic__input-group">
                    <label className="pic__label" htmlFor="pic-name">Tu nombre</label>
                    <input
                        id="pic-name"
                        className="pic__input"
                        type="text"
                        placeholder="Escribe tu nombre..."
                        value={playerName}
                        onChange={(e) => onSetName(e.target.value)}
                        maxLength={20}
                    />
                </div>

                {mode === 'choose' ? (
                    <div className="pic__actions">
                        <button className="pic__btn pic__btn--primary" onClick={onCreateRoom} disabled={!canProceed}>
                            🎨 Crear sala
                        </button>
                        <button className="pic__btn pic__btn--secondary" onClick={() => setMode('join')} disabled={!canProceed}>
                            🔗 Unirme con código
                        </button>
                    </div>
                ) : (
                    <div className="pic__join-section">
                        <div className="pic__input-group">
                            <label className="pic__label" htmlFor="pic-code">Código de sala</label>
                            <input
                                id="pic-code"
                                className="pic__input pic__input--code"
                                type="text"
                                placeholder="Ej: ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </div>
                        <div className="pic__actions">
                            <button className="pic__btn pic__btn--primary" onClick={() => onJoinRoom(joinCode)} disabled={!canProceed || joinCode.length < 4}>
                                Unirme
                            </button>
                            <button className="pic__btn pic__btn--ghost" onClick={() => setMode('choose')}>
                                ← Volver
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}