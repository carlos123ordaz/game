/* File: src/components/games/ludo/LudoEntry.tsx */
import { useState } from 'react';
import { Button } from '../../common/Button';

interface Props {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: (numPlayers: number) => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function LudoEntry({ playerName, onSetName, onCreateRoom, onJoinRoom, isConnected }: Props) {
    const [joinCode, setJoinCode] = useState('');
    const [numPlayers, setNumPlayers] = useState(4);
    const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
    const canProceed = playerName.trim().length >= 2 && isConnected;

    return (
        <div className="ludo-entry">
            <div className="ludo-entry__header">
                <span className="ludo-entry__icon">🎲</span>
                <h1 className="ludo-entry__title">Ludo</h1>
                <p className="ludo-entry__subtitle">El clasico juego de mesa. Lleva tus fichas a casa antes que nadie.</p>
            </div>
            <div className="ludo-entry__form">
                <div className="ludo-entry__field">
                    <label className="ludo-entry__label" htmlFor="ludo-name">Tu nombre</label>
                    <input id="ludo-name" className="ludo-entry__input" type="text" placeholder="Escribe tu nombre..."
                        value={playerName} onChange={(e) => onSetName(e.target.value)} maxLength={20} autoFocus />
                </div>

                {mode === 'choose' && (
                    <div className="ludo-entry__actions">
                        <Button variant="primary" onClick={() => setMode('create')} disabled={!canProceed}>Crear sala</Button>
                        <Button variant="ghost" onClick={() => setMode('join')} disabled={!canProceed}>Unirme a una sala</Button>
                    </div>
                )}

                {mode === 'create' && (
                    <div className="ludo-entry__create">
                        <div className="ludo-entry__field">
                            <label className="ludo-entry__label">Numero de jugadores</label>
                            <div className="ludo-entry__players-btns">
                                {[2, 3, 4].map(n => (
                                    <button key={n} className={`ludo-entry__player-btn ${numPlayers === n ? 'ludo-entry__player-btn--active' : ''}`}
                                        onClick={() => setNumPlayers(n)}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <div className="ludo-entry__actions">
                            <Button variant="primary" onClick={() => onCreateRoom(numPlayers)} disabled={!canProceed}>
                                Crear sala ({numPlayers} jugadores)
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>Volver</Button>
                        </div>
                    </div>
                )}

                {mode === 'join' && (
                    <div className="ludo-entry__join">
                        <div className="ludo-entry__field">
                            <label className="ludo-entry__label" htmlFor="ludo-code">Codigo de sala</label>
                            <input id="ludo-code" className="ludo-entry__input ludo-entry__input--code" type="text"
                                placeholder="ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
                        </div>
                        <div className="ludo-entry__actions">
                            <Button variant="primary" onClick={() => onJoinRoom(joinCode)} disabled={!canProceed || joinCode.length < 4}>Unirme</Button>
                            <Button variant="ghost" size="sm" onClick={() => setMode('choose')}>Volver</Button>
                        </div>
                    </div>
                )}
            </div>
            {!isConnected && <div className="ludo-entry__status">Conectando al servidor...</div>}
        </div>
    );
}