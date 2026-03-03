import { useState } from 'react';
import type { PictionaryPlayer } from '../../../types/games/pictionary';

interface Props {
    roomCode: string;
    players: PictionaryPlayer[];
    playerId: string;
    isHost: boolean;
    canStart: boolean;
    onStartGame: () => void;
    onKickPlayer: (id: string) => void;
}

export function PictionaryLobby({ roomCode, players, playerId, isHost, canStart, onStartGame, onKickPlayer }: Props) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
        } catch {
            const input = document.createElement('input');
            input.value = roomCode;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="pic">
            <div className="pic__card">
                <span className="pic__emoji">🎨</span>
                <h2 className="pic__title">Sala de espera</h2>
                <p className="pic__subtitle">Invita a tus amigos a unirse</p>

                <div className="lobby__code-box">
                    <div className="lobby__code-label">Código de sala</div>
                    <div className="lobby__code">{roomCode}</div>
                    <button className="lobby__copy-btn" onClick={handleCopy}>
                        {copied ? '✓ Copiado' : '📋 Copiar código'}
                    </button>
                </div>

                <div className="pic__players-list">
                    <div className="pic__players-header">
                        <span>Jugadores ({players.length}/8)</span>
                        <span className="pic__players-min">Mínimo 2 para jugar</span>
                    </div>

                    {players.map((player, i) => (
                        <div className={`pic__player ${!player.connected ? 'pic__player--disconnected' : ''}`} key={player.id}>
                            <div className={`pic__player-avatar pic__player-avatar--c${(i % 6) + 1}`}>
                                {player.name[0].toUpperCase()}
                            </div>
                            <span className="pic__player-name">
                                {player.name}
                                {player.id === playerId && ' (tú)'}
                            </span>
                            <div className="pic__player-badges">
                                {player.isHost && <span className="pic__badge pic__badge--host">Host</span>}
                                {!player.connected && <span className="pic__badge pic__badge--offline">Desconectado</span>}
                            </div>
                            {isHost && player.id !== playerId && (
                                <button className="pic__kick-btn" onClick={() => onKickPlayer(player.id)} title="Expulsar">
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {isHost && (
                    <button className="pic__btn pic__btn--primary pic__btn--full" onClick={onStartGame} disabled={!canStart}>
                        {canStart ? '🚀 Iniciar juego' : `Esperando jugadores (${players.length}/2 mín)...`}
                    </button>
                )}

                {!isHost && (
                    <div className="pic__waiting-host">
                        <span>Esperando a que el host inicie el juego</span>
                        <div className="pic__dots"><span /><span /><span /></div>
                    </div>
                )}
            </div>
        </div>
    );
}