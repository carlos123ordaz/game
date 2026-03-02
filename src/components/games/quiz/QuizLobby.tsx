import { useState } from 'react';
import type { Player } from '../../../types/common';

interface QuizLobbyProps {
  roomCode: string;
  players: Player[];
  playerId: string;
}

export function QuizLobby({ roomCode, players }: QuizLobbyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = roomCode;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="quiz">
      <div className="quiz__card">
        <span className="quiz__emoji">🎮</span>
        <h2 className="quiz__title">Sala creada</h2>
        <p className="quiz__subtitle">
          Comparte el código con tu pareja o amigo
        </p>

        <div className="lobby__code-box">
          <div className="lobby__code-label">Código de sala</div>
          <div className="lobby__code">{roomCode}</div>
          <button className="lobby__copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copiado' : '📋 Copiar código'}
          </button>
        </div>

        <div className="lobby__players">
          {players.map((player, i) => (
            <div className="lobby__player" key={player.id}>
              <div className={`lobby__player-avatar lobby__player-avatar--p${i + 1}`}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="lobby__player-name">{player.name}</span>
              <span className="lobby__player-badge">
                {i === 0 ? 'Host' : 'Invitado'}
              </span>
            </div>
          ))}

          {players.length < 2 && (
            <div className="lobby__waiting">
              <span>Esperando al segundo jugador</span>
              <div className="lobby__waiting-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
