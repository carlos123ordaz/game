import type { Player } from '../../../types/common';
import { Button } from '../../common/Button';

interface WSLobbyProps {
    roomCode: string;
    players: Player[];
    playerId: string;
    maxRounds: number;
    onToggleReady: () => void;
}

export function WSLobby({ roomCode, players, playerId, maxRounds, onToggleReady }: WSLobbyProps) {
    const me = players.find(p => p.id === playerId);
    const allReady = players.length >= 2 && players.every(p => p.ready);

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode).catch(() => { });
    };

    return (
        <div className="ws-lobby">
            <div className="ws-lobby__header">
                <h2 className="ws-lobby__title">Sala de espera</h2>
                <p className="ws-lobby__info">{maxRounds} {maxRounds === 1 ? 'ronda' : 'rondas'} · 90s por ronda</p>
            </div>

            <div className="ws-lobby__code-box" onClick={copyCode} title="Click para copiar">
                <span className="ws-lobby__code-label">Código de sala</span>
                <span className="ws-lobby__code">{roomCode}</span>
                <span className="ws-lobby__code-hint">Toca para copiar</span>
            </div>

            <div className="ws-lobby__players">
                <div className="ws-lobby__players-header">
                    <span>Jugadores ({players.length}/8)</span>
                    {players.length < 2 && <span className="ws-lobby__waiting">Esperando más jugadores...</span>}
                </div>

                <ul className="ws-lobby__player-list">
                    {players.map((p) => (
                        <li key={p.id} className={`ws-lobby__player ${p.ready ? 'ws-lobby__player--ready' : ''}`}>
                            <span className="ws-lobby__player-name">
                                {p.name}
                                {p.id === playerId && <span className="ws-lobby__player-you"> (tú)</span>}
                            </span>
                            <span className={`ws-lobby__player-status ${p.ready ? 'ws-lobby__player-status--ready' : ''}`}>
                                {p.ready ? '✓ Listo' : 'Esperando...'}
                            </span>
                        </li>
                    ))}

                    {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
                        <li key={`empty-${i}`} className="ws-lobby__player ws-lobby__player--empty">
                            <span className="ws-lobby__player-name">Esperando jugador...</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ws-lobby__actions">
                <Button
                    variant={me?.ready ? 'ghost' : 'success'}
                    onClick={onToggleReady}
                    disabled={players.length < 2}
                >
                    {me?.ready ? 'Cancelar listo' : '¡Estoy listo!'}
                </Button>
                {allReady && (
                    <p className="ws-lobby__starting">¡Todos listos! Iniciando...</p>
                )}
            </div>
        </div>
    );
}