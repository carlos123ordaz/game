import { useState } from 'react';
import type { GamePlayer } from '../../../types/games/pixelAdventure';

const SPRITES = ['👾', '🤖', '👹', '🎃', '🐸', '🦊', '🐱', '🐼'];

interface Props {
    roomCode: string;
    players: GamePlayer[];
    playerId: string;
    isHost: boolean;
    canStart: boolean;
    onStartGame: () => void;
    onKickPlayer: (id: string) => void;
}

export function PALobby({ roomCode, players, playerId, isHost, canStart, onStartGame, onKickPlayer }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(roomCode); } catch {
            const i = document.createElement('input'); i.value = roomCode;
            document.body.appendChild(i); i.select(); document.execCommand('copy'); document.body.removeChild(i);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pa-center">
            <div className="pixel-card">
                <div className="pixel-card__header">
                    <span className="pixel-title-icon">⚔️</span>
                    <h2 className="pixel-title">SALA DE ESPERA</h2>
                </div>

                <div className="pixel-code-box">
                    <span className="pixel-code-label">CÓDIGO</span>
                    <span className="pixel-code">{roomCode}</span>
                    <button className="pixel-btn pixel-btn--small" onClick={handleCopy}>
                        {copied ? '✓ OK' : '📋 COPIAR'}
                    </button>
                </div>

                <div className="pixel-players">
                    <div className="pixel-players__header">
                        JUGADORES ({players.length}/8)
                    </div>
                    {players.map((p, i) => (
                        <div key={p.id} className={`pixel-player ${!p.connected ? 'pixel-player--offline' : ''}`}>
                            <span className="pixel-player__sprite">{SPRITES[i % SPRITES.length]}</span>
                            <span className="pixel-player__name">
                                {p.name}{p.id === playerId ? ' (tú)' : ''}
                            </span>
                            {p.isHost && <span className="pixel-badge pixel-badge--host">HOST</span>}
                            {!p.connected && <span className="pixel-badge pixel-badge--off">OFF</span>}
                            {isHost && p.id !== playerId && (
                                <button className="pixel-kick" onClick={() => onKickPlayer(p.id)}>✕</button>
                            )}
                        </div>
                    ))}
                    {players.length < 2 && (
                        <div className="pixel-waiting">
                            Esperando jugadores<span className="pixel-dots"><span /><span /><span /></span>
                        </div>
                    )}
                </div>

                {isHost ? (
                    <button className="pixel-btn pixel-btn--primary pixel-btn--full" onClick={onStartGame} disabled={!canStart}>
                        {canStart ? '🚀 INICIAR JUEGO' : 'ESPERANDO JUGADORES...'}
                    </button>
                ) : (
                    <div className="pixel-waiting-host">
                        Esperando al host<span className="pixel-dots"><span /><span /><span /></span>
                    </div>
                )}
            </div>
        </div>
    );
}