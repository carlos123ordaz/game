import { Button } from '../../common/Button';
import type { AnonPlayer, AnonSettings } from '../../../types/games/anonymous-questions';

interface AnonLobbyProps {
    roomCode: string;
    players: AnonPlayer[];
    playerId: string;
    host: string;
    settings: AnonSettings;
    isHost: boolean;
    onToggleReady: () => void;
    onChangeSettings: (s: Partial<AnonSettings>) => void;
    onStartGame: () => void;
    onLeave: () => void;
}

export function AnonLobby({
    roomCode,
    players,
    playerId,
    host,
    settings,
    isHost,
    onToggleReady,
    onChangeSettings,
    onStartGame,
    onLeave,
}: AnonLobbyProps) {
    const currentPlayer = players.find(p => p.id === playerId);
    const activePlayers = players.filter(p => p.connected);
    const allOthersReady = activePlayers.filter(p => p.id !== host).every(p => p.ready);
    const canStart = isHost && activePlayers.length >= 2 && allOthersReady;

    return (
        <div className="aq-lobby">
            <div className="aq-lobby__top-bar">
                <button className="aq-lobby__leave-btn" onClick={onLeave} title="Salir de la sala">
                    ← Salir
                </button>
            </div>

            <div className="aq-lobby__header">
                <h2 className="aq-lobby__title">Sala de espera</h2>
                <div className="aq-lobby__code-box">
                    <span className="aq-lobby__code-label">Comparte este código</span>
                    <div className="aq-lobby__code-row">
                        <span className="aq-lobby__code">{roomCode}</span>
                        <button
                            className="aq-lobby__copy"
                            onClick={() => navigator.clipboard?.writeText(roomCode)}
                        >
                            Copiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings (host only) */}
            {isHost && (
                <div className="aq-lobby__settings">
                    <div className="aq-lobby__setting">
                        <span className="aq-lobby__setting-label">Preguntas por persona</span>
                        <div className="aq-lobby__setting-controls">
                            {[1, 2, 3].map(n => (
                                <button
                                    key={n}
                                    className={`aq-lobby__pill ${settings.questionsPerPlayer === n ? 'aq-lobby__pill--active' : ''}`}
                                    onClick={() => onChangeSettings({ questionsPerPlayer: n })}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!isHost && (
                <div className="aq-lobby__settings-view">
                    <span>{settings.questionsPerPlayer} pregunta{settings.questionsPerPlayer > 1 ? 's' : ''} por persona</span>
                </div>
            )}

            {/* Player List */}
            <div className="aq-lobby__players">
                <div className="aq-lobby__players-title">
                    Jugadores ({activePlayers.length}/12)
                </div>
                {players.map(p => (
                    <div
                        key={p.id}
                        className={`aq-lobby__player ${p.id === playerId ? 'aq-lobby__player--you' : ''} ${!p.connected ? 'aq-lobby__player--disconnected' : ''}`}
                    >
                        <div className="aq-lobby__player-left">
                            <span className="aq-lobby__player-avatar">
                                {p.connected ? '🎭' : '💤'}
                            </span>
                            <span className="aq-lobby__player-name">
                                {p.name}
                                {p.id === host && <span className="aq-lobby__badge aq-lobby__badge--host">HOST</span>}
                                {p.id === playerId && <span className="aq-lobby__badge aq-lobby__badge--you">TÚ</span>}
                            </span>
                        </div>
                        <span className={`aq-lobby__player-status ${p.id === host ? '' : p.ready ? 'aq-lobby__player-status--ready' : ''}`}>
                            {!p.connected ? 'Desconectado' : p.id === host ? '⭐' : p.ready ? '✅ Listo' : '⏳'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="aq-lobby__actions">
                {isHost ? (
                    <Button variant="primary" onClick={onStartGame} disabled={!canStart}>
                        {activePlayers.length < 2
                            ? 'Esperando jugadores...'
                            : !allOthersReady
                                ? 'Esperando que estén listos...'
                                : '¡Comenzar!'}
                    </Button>
                ) : (
                    <Button
                        variant={currentPlayer?.ready ? 'ghost' : 'primary'}
                        onClick={onToggleReady}
                    >
                        {currentPlayer?.ready ? 'Cancelar listo' : 'Estoy listo ✓'}
                    </Button>
                )}
            </div>
        </div>
    );
}