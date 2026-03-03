/* File: src/components/games/ludo/LudoLobby.tsx */
import { Button } from '../../common/Button';
import type { LudoPlayer } from '../../../types/games/ludo';
import { COLOR_MAP } from '../../../types/games/ludo';

interface Props {
    roomCode: string;
    players: LudoPlayer[];
    playerId: string;
    maxPlayers: number;
    onToggleReady: () => void;
}

export function LudoLobby({ roomCode, players, playerId, maxPlayers, onToggleReady }: Props) {
    const me = players.find(p => p.id === playerId);
    const allReady = players.length >= 2 && players.every(p => p.ready);
    const copyCode = () => { navigator.clipboard.writeText(roomCode).catch(() => { }); };

    return (
        <div className="ludo-lobby">
            <div className="ludo-lobby__header">
                <h2 className="ludo-lobby__title">Sala de espera</h2>
                <p className="ludo-lobby__info">{maxPlayers} jugadores</p>
            </div>
            <div className="ludo-lobby__code-box" onClick={copyCode}>
                <span className="ludo-lobby__code-label">CODIGO DE SALA</span>
                <span className="ludo-lobby__code">{roomCode}</span>
                <span className="ludo-lobby__code-hint">Toca para copiar</span>
            </div>
            <div className="ludo-lobby__players">
                <div className="ludo-lobby__players-header">
                    <span>Jugadores ({players.length}/{maxPlayers})</span>
                    {players.length < 2 && <span className="ludo-lobby__waiting">Esperando...</span>}
                </div>
                <ul className="ludo-lobby__player-list">
                    {players.map(p => {
                        const colorInfo = COLOR_MAP[p.color];
                        return (
                            <li key={p.id} className={`ludo-lobby__player ${p.ready ? "ludo-lobby__player--ready" : ""}`}
                                style={{ borderLeftColor: colorInfo.hex }}>
                                <span className="ludo-lobby__player-color" style={{ background: colorInfo.hex }}></span>
                                <span className="ludo-lobby__player-name">
                                    {p.name} {p.id === playerId && <span className="ludo-lobby__player-you">(tu)</span>}
                                </span>
                                <span className="ludo-lobby__player-color-label">{colorInfo.label}</span>
                                <span className={`ludo-lobby__player-status ${p.ready ? "ludo-lobby__player-status--ready" : ""}`}>
                                    {p.ready ? "\u2713 Listo" : "Esperando..."}
                                </span>
                            </li>
                        );
                    })}
                    {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
                        <li key={`empty-${i}`} className="ludo-lobby__player ludo-lobby__player--empty">
                            <span className="ludo-lobby__player-name">Esperando jugador...</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ludo-lobby__actions">
                <Button variant={me?.ready ? "ghost" : "success"} onClick={onToggleReady} disabled={players.length < 2}>
                    {me?.ready ? "Cancelar listo" : "Estoy listo!"}
                </Button>
                {allReady && <p className="ludo-lobby__starting">Todos listos! Iniciando...</p>}
            </div>
        </div>
    );
}