import { useState } from 'react';
import { Button } from '../../common/Button';

interface WSNameEntryProps {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: (rounds: number) => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function WSNameEntry({ playerName, onSetName, onCreateRoom, onJoinRoom, isConnected }: WSNameEntryProps) {
    const [joinCode, setJoinCode] = useState('');
    const [rounds, setRounds] = useState(3);
    const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');

    const canProceed = playerName.trim().length >= 2 && isConnected;

    return (
        <div className="ws-entry">
            <div className="ws-entry__header">
                <span className="ws-entry__icon">🔤</span>
                <h1 className="ws-entry__title">Sopa de Letras</h1>
                <p className="ws-entry__subtitle">Encuentra las palabras antes que tus rivales</p>
            </div>

            <div className="ws-entry__form">
                <div className="ws-entry__field">
                    <label className="ws-entry__label" htmlFor="ws-name">Tu nombre</label>
                    <input
                        id="ws-name"
                        className="ws-entry__input"
                        type="text"
                        placeholder="Escribe tu nombre..."
                        value={playerName}
                        onChange={(e) => onSetName(e.target.value)}
                        maxLength={20}
                        autoFocus
                    />
                </div>

                {mode === 'choose' && (
                    <div className="ws-entry__actions">
                        <Button variant="primary" onClick={() => setMode('create')} disabled={!canProceed}>
                            Crear sala
                        </Button>
                        <Button variant="ghost" onClick={() => setMode('join')} disabled={!canProceed}>
                            Unirme a una sala
                        </Button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="ws-entry__create">
                        <div className="ws-entry__field">
                            <label className="ws-entry__label">Número de rondas</label>
                            <div className="ws-entry__rounds">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        className={`ws-entry__round-btn ${rounds === n ? 'ws-entry__round-btn--active' : ''}`}
                                        onClick={() => setRounds(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="ws-entry__actions">
                            <Button variant="primary" onClick={() => onCreateRoom(rounds)} disabled={!canProceed}>
                                Crear sala ({rounds} {rounds === 1 ? 'ronda' : 'rondas'})
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                                ← Volver
                            </Button>
                        </div>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="ws-entry__join">
                        <div className="ws-entry__field">
                            <label className="ws-entry__label" htmlFor="ws-code">Código de sala</label>
                            <input
                                id="ws-code"
                                className="ws-entry__input ws-entry__input--code"
                                type="text"
                                placeholder="ABC123"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                            />
                        </div>
                        <div className="ws-entry__actions">
                            <Button variant="primary" onClick={() => onJoinRoom(joinCode)} disabled={!canProceed || joinCode.length < 4}>
                                Unirme
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>
                                ← Volver
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {!isConnected && (
                <div className="ws-entry__status">Conectando al servidor...</div>
            )}
        </div>
    );
}