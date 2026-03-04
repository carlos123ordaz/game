import { useState } from 'react';
import { Button } from '../../common/Button';

interface AnonNameEntryProps {
    playerName: string;
    onSetName: (name: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isConnected: boolean;
}

export function AnonNameEntry({
    playerName,
    onSetName,
    onCreateRoom,
    onJoinRoom,
    isConnected,
}: AnonNameEntryProps) {
    const [joinCode, setJoinCode] = useState('');
    const [showJoin, setShowJoin] = useState(false);

    const canProceed = playerName.trim().length >= 2 && isConnected;

    return (
        <div className="aq-entry">
            <div className="aq-entry__header">
                <div className="aq-entry__mask">🎭</div>
                <h1 className="aq-entry__title">Preguntas Anónimas</h1>
                <p className="aq-entry__subtitle">
                    Escribe preguntas en secreto, responde las de todos, y adivina quién preguntó qué
                </p>
            </div>

            <div className="aq-entry__form">
                <label className="aq-entry__label">Tu nombre</label>
                <input
                    className="aq-entry__input"
                    type="text"
                    placeholder="¿Cómo te llamas?"
                    value={playerName}
                    onChange={(e) => onSetName(e.target.value)}
                    maxLength={20}
                    autoFocus
                />
            </div>

            {!showJoin ? (
                <div className="aq-entry__actions">
                    <Button variant="primary" onClick={onCreateRoom} disabled={!canProceed}>
                        Crear sala
                    </Button>
                    <Button variant="ghost" onClick={() => setShowJoin(true)} disabled={!canProceed}>
                        Tengo un código
                    </Button>
                </div>
            ) : (
                <div className="aq-entry__join">
                    <label className="aq-entry__label">Código de sala</label>
                    <input
                        className="aq-entry__input aq-entry__input--code"
                        type="text"
                        placeholder="ABC123"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        autoFocus
                    />
                    <div className="aq-entry__actions">
                        <Button variant="primary" onClick={() => onJoinRoom(joinCode)} disabled={!canProceed || joinCode.length < 4}>
                            Unirse
                        </Button>
                        <Button variant="ghost" onClick={() => setShowJoin(false)}>
                            Volver
                        </Button>
                    </div>
                </div>
            )}

            <div className="aq-entry__how">
                <div className="aq-entry__how-title">¿Cómo funciona?</div>
                <div className="aq-entry__how-steps">
                    <div className="aq-entry__step">
                        <span className="aq-entry__step-num">1</span>
                        <span>Todos escriben preguntas en secreto</span>
                    </div>
                    <div className="aq-entry__step">
                        <span className="aq-entry__step-num">2</span>
                        <span>Todos responden todas las preguntas</span>
                    </div>
                    <div className="aq-entry__step">
                        <span className="aq-entry__step-num">3</span>
                        <span>Adivina quién hizo cada pregunta</span>
                    </div>
                    <div className="aq-entry__step">
                        <span className="aq-entry__step-num">4</span>
                        <span>¡Se revela todo! Puntos por adivinar</span>
                    </div>
                </div>
            </div>
        </div>
    );
}