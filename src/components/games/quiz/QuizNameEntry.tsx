import { useState } from 'react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

interface QuizNameEntryProps {
  playerName: string;
  onSetName: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  isConnected: boolean;
}

export function QuizNameEntry({
  playerName,
  onSetName,
  onCreateRoom,
  onJoinRoom,
  isConnected,
}: QuizNameEntryProps) {
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  const canProceed = playerName.trim().length >= 2;

  return (
    <div className="quiz">
      <div className="quiz__card">
        <span className="quiz__emoji">💜</span>
        <h2 className="quiz__title">¿Qué tanto se conocen?</h2>
        <p className="quiz__subtitle">
          Respondan las mismas preguntas y descubran su compatibilidad
        </p>

        <div className="quiz__form">
          <Input
            label="Tu nombre"
            placeholder="¿Cómo te llamas?"
            value={playerName}
            onChange={(e) => onSetName(e.target.value)}
            maxLength={20}
            autoFocus
          />

          {mode === 'choose' ? (
            <>
              <Button
                fullWidth
                onClick={onCreateRoom}
                disabled={!canProceed || !isConnected}
              >
                Crear sala nueva
              </Button>

              <div className="quiz__separator">
                <span>o únete a una sala</span>
              </div>

              <Button
                variant="secondary"
                fullWidth
                onClick={() => setMode('join')}
                disabled={!canProceed}
              >
                Tengo un código
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Código de sala"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                mono
              />

              <Button
                fullWidth
                onClick={() => onJoinRoom(roomCode)}
                disabled={!canProceed || roomCode.length < 4 || !isConnected}
              >
                Unirme
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => setMode('choose')}
              >
                ← Volver
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
