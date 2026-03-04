import { Button } from '../../common/Button';
import type { Difficulty } from '../../../types/games/minesweeper';

interface LobbyPlayer {
    id: string;
    name: string;
    ready: boolean;
}

interface MinesweeperLobbyProps {
    roomCode: string;
    players: LobbyPlayer[];
    playerId: string;
    host: string;
    difficulty: Difficulty;
    isHost: boolean;
    onToggleReady: () => void;
    onChangeDifficulty: (d: Difficulty) => void;
    onStartGame: () => void;
}

const DIFF_LABELS: Record<Difficulty, string> = {
    easy: '🟢 Fácil (9×9)',
    medium: '🟡 Medio (16×16)',
    hard: '🔴 Difícil (16×30)',
};

export function MinesweeperLobby({
    roomCode,
    players,
    playerId,
    host,
    difficulty,
    isHost,
    onToggleReady,
    onChangeDifficulty,
    onStartGame,
}: MinesweeperLobbyProps) {
    const currentPlayer = players.find(p => p.id === playerId);
    const allOthersReady = players.filter(p => p.id !== host).every(p => p.ready);
    const canStart = isHost && players.length >= 2 && allOthersReady;

    return (
        <div className="ms-lobby">
            <div className="ms-lobby__header">
                <h2 className="ms-lobby__title">Sala de espera</h2>
                <div className="ms-lobby__code">
                    <span className="ms-lobby__code-label">Código:</span>
                    <span className="ms-lobby__code-value">{roomCode}</span>
                    <button
                        className="ms-lobby__copy-btn"
                        onClick={() => navigator.clipboard?.writeText(roomCode)}
                        title="Copiar código"
                    >
                        📋
                    </button>
                </div>
            </div>

            <div className="ms-lobby__difficulty">
                <span className="ms-lobby__diff-current">{DIFF_LABELS[difficulty]}</span>
                {isHost && (
                    <div className="ms-lobby__diff-controls">
                        {(Object.keys(DIFF_LABELS) as Difficulty[]).map(d => (
                            <button
                                key={d}
                                className={`ms-lobby__diff-pill ${difficulty === d ? 'ms-lobby__diff-pill--active' : ''}`}
                                onClick={() => onChangeDifficulty(d)}
                            >
                                {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Medio' : 'Difícil'}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="ms-lobby__players">
                <div className="ms-lobby__players-header">
                    <span>Jugadores ({players.length}/8)</span>
                </div>
                {players.map(p => (
                    <div
                        key={p.id}
                        className={`ms-lobby__player ${p.id === playerId ? 'ms-lobby__player--you' : ''}`}
                    >
                        <div className="ms-lobby__player-info">
                            <span className="ms-lobby__player-name">
                                {p.name}
                                {p.id === host && <span className="ms-lobby__host-badge">HOST</span>}
                                {p.id === playerId && <span className="ms-lobby__you-badge">TÚ</span>}
                            </span>
                        </div>
                        <span className={`ms-lobby__player-status ${p.id === host ? 'ms-lobby__player-status--host' : p.ready ? 'ms-lobby__player-status--ready' : ''}`}>
                            {p.id === host ? '⭐' : p.ready ? '✅ Listo' : '⏳ Esperando'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="ms-lobby__actions">
                {isHost ? (
                    <Button
                        variant="primary"
                        onClick={onStartGame}
                        disabled={!canStart}
                    >
                        {players.length < 2
                            ? 'Esperando jugadores...'
                            : !allOthersReady
                                ? 'Esperando que estén listos...'
                                : '¡Iniciar partida!'}
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