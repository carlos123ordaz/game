import type { Player } from '../../../types/common';
import type { PuzzleDifficulty } from '../../../types/games/puzzle';
import { PUZZLE_IMAGES, DIFFICULTY_CONFIG } from '../../../config/puzzleConfig';

interface PuzzleLobbyProps {
    roomCode: string;
    players: Player[];
    playerId: string;
    difficulty: PuzzleDifficulty;
    imageIndex: number;
    isHost: boolean;
    onChangeSettings?: (difficulty?: PuzzleDifficulty, imageIndex?: number) => void;
}

export function PuzzleLobby({
    roomCode,
    players,
    playerId,
    difficulty,
    imageIndex,
    isHost,
    onChangeSettings,
}: PuzzleLobbyProps) {
    const selectedImage = PUZZLE_IMAGES[imageIndex] || PUZZLE_IMAGES[0];

    return (
        <div className="puzzle-lobby">
            <div className="puzzle-lobby__header">
                <h2 className="puzzle-lobby__title">Sala de espera</h2>
                <div className="puzzle-lobby__code">
                    <span className="puzzle-lobby__code-label">Código:</span>
                    <span className="puzzle-lobby__code-value">{roomCode}</span>
                    <button
                        className="puzzle-lobby__copy"
                        onClick={() => navigator.clipboard?.writeText(roomCode)}
                        title="Copiar código"
                    >
                        📋
                    </button>
                </div>
            </div>

            {/* Players */}
            <div className="puzzle-lobby__players">
                <h3 className="puzzle-lobby__section-title">Jugadores ({players.length}/2)</h3>
                <div className="puzzle-lobby__player-list">
                    {players.map((p) => (
                        <div
                            key={p.id}
                            className={`puzzle-lobby__player ${p.id === playerId ? 'puzzle-lobby__player--me' : ''}`}
                        >
                            <span className="puzzle-lobby__player-avatar">
                                {p.id === playerId ? '👤' : '🎮'}
                            </span>
                            <span className="puzzle-lobby__player-name">
                                {p.name} {p.id === playerId && '(tú)'}
                            </span>
                        </div>
                    ))}
                    {players.length < 2 && (
                        <div className="puzzle-lobby__player puzzle-lobby__player--empty">
                            <span className="puzzle-lobby__player-avatar">⏳</span>
                            <span className="puzzle-lobby__player-name">Esperando jugador...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Settings */}
            <div className="puzzle-lobby__settings">
                <h3 className="puzzle-lobby__section-title">Configuración</h3>

                {/* Difficulty */}
                <div className="puzzle-lobby__setting">
                    <label className="puzzle-lobby__setting-label">Dificultad</label>
                    <div className="puzzle-lobby__difficulty-options">
                        {(Object.entries(DIFFICULTY_CONFIG) as [PuzzleDifficulty, typeof DIFFICULTY_CONFIG.easy][]).map(
                            ([key, val]) => (
                                <button
                                    key={key}
                                    className={`puzzle-lobby__diff-btn ${difficulty === key ? 'puzzle-lobby__diff-btn--active' : ''
                                        }`}
                                    onClick={() => isHost && onChangeSettings?.(key)}
                                    disabled={!isHost}
                                    title={!isHost ? 'Solo el anfitrión puede cambiar' : undefined}
                                >
                                    <span className="puzzle-lobby__diff-emoji">{val.emoji}</span>
                                    <span className="puzzle-lobby__diff-label">{val.label}</span>
                                    <span className="puzzle-lobby__diff-desc">{val.desc}</span>
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Image selection */}
                <div className="puzzle-lobby__setting">
                    <label className="puzzle-lobby__setting-label">Imagen</label>
                    <div className="puzzle-lobby__image-grid">
                        {PUZZLE_IMAGES.map((img, idx) => (
                            <button
                                key={idx}
                                className={`puzzle-lobby__img-card ${imageIndex === idx ? 'puzzle-lobby__img-card--active' : ''
                                    }`}
                                onClick={() => isHost && onChangeSettings?.(undefined, idx)}
                                disabled={!isHost}
                            >
                                <div className="puzzle-lobby__img-thumb-wrapper">
                                    <img
                                        src={img.url.replace('w=800&h=800', 'w=200&h=200')}
                                        alt={img.name}
                                        className="puzzle-lobby__img-thumb"
                                        loading="lazy"
                                    />
                                </div>
                                <span className="puzzle-lobby__img-name">{img.emoji} {img.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected image preview */}
                <div className="puzzle-lobby__preview">
                    <label className="puzzle-lobby__setting-label">Vista previa</label>
                    <div className="puzzle-lobby__preview-container">
                        <img
                            src={selectedImage.url.replace('w=800&h=800', 'w=400&h=400')}
                            alt={selectedImage.name}
                            className="puzzle-lobby__preview-img"
                            loading="lazy"
                        />
                        <div className="puzzle-lobby__preview-label">
                            {selectedImage.emoji} {selectedImage.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            {players.length < 2 && (
                <p className="puzzle-lobby__hint">
                    Comparte el código <strong>{roomCode}</strong> con tu oponente para empezar
                </p>
            )}
            {players.length === 2 && (
                <div className="puzzle-lobby__starting">
                    <div className="puzzle-lobby__starting-spinner" />
                    <span>¡Preparando rompecabezas!</span>
                </div>
            )}
        </div>
    );
}