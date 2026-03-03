/* File: src/components/games/ludo/LudoGame.tsx */
import { useState, useEffect } from 'react';
import type { LudoGameState, LudoColor } from '../../../types/games/ludo';
import { COLOR_MAP } from '../../../types/games/ludo';
import { LudoBoard } from './LudoBoard';
import { Dice3D } from './Dice3D';


interface Props {
    game: LudoGameState;
    playerId: string;
    myColor: LudoColor | null;
    isMyTurn: boolean;
    canRoll: boolean;
    canSelect: boolean;
    selectableTokens: number[];
    onRollDice: () => void;
    onSelectMove: (tokenIndex: number) => void;
}

export function LudoGame({ game, playerId, myColor, isMyTurn, canRoll, canSelect, selectableTokens, onRollDice, onSelectMove }: Props) {
    const [diceRolling, setDiceRolling] = useState(false);
    const [displayDice, setDisplayDice] = useState<number | null>(null);
    const [prevDiceValue, setPrevDiceValue] = useState<number | null>(null);

    useEffect(() => {
        if (game.diceValue !== null && game.diceValue !== prevDiceValue) {
            setDiceRolling(true);
            const t = setTimeout(() => {
                setDiceRolling(false);
                setDisplayDice(game.diceValue);
                setPrevDiceValue(game.diceValue);
            }, 600);
            return () => clearTimeout(t);
        } else if (game.diceValue === null) {
            setDisplayDice(null);
            setPrevDiceValue(null);
            setDiceRolling(false);
        }
    }, [game.diceValue, prevDiceValue]);

    const handleRoll = () => {
        if (!canRoll || diceRolling) return;
        setDiceRolling(true);
        onRollDice();
    };

    const currentPlayer = game.players[game.currentTurn];
    const currentColor = currentPlayer?.color;
    const currentColorData = currentColor ? COLOR_MAP[currentColor] : null;

    const getEventMessage = () => {
        const ev = game.lastEvent;
        if (!ev) return null;
        switch (ev.type) {
            case 'game-start': return 'El juego ha comenzado!';
            case 'capture': return `${ev.player} capturo una ficha de ${ev.capturedPlayer}!`;
            case 'token-exit': return `${ev.player} saco una ficha de la base!`;
            case 'token-home': return `${ev.player} llevo una ficha a casa! (${ev.finished}/4)`;
            case 'player-won': return `${ev.player} termino en posicion ${ev.rank}!`;
            case 'triple-six': return `${ev.player} saco tres 6 seguidos. Pierde turno!`;
            case 'no-moves': return `${ev.player} no tiene movimientos validos.`;
            case 'player-disconnected': return `${ev.player} se desconecto.`;
            default: return null;
        }
    };

    const eventMsg = getEventMessage();

    return (
        <div className="ludo-game">
            {/* Turn indicator */}
            <div className="ludo-game__turn-bar">
                <div className="ludo-game__turn-info">
                    {currentColorData && (
                        <span className="ludo-game__turn-color" style={{ background: currentColorData.hex }}></span>
                    )}
                    <span className="ludo-game__turn-name">
                        {isMyTurn ? 'Tu turno' : `Turno de ${currentPlayer?.name}`}
                    </span>
                </div>

                {/* 3D Dice area */}
                <div className="ludo-game__dice-area">
                    <Dice3D
                        value={displayDice}
                        rolling={diceRolling}
                        canRoll={canRoll && !diceRolling}
                        onRoll={handleRoll}
                    />
                    {canSelect && (
                        <span className="ludo-game__select-hint">Selecciona una ficha</span>
                    )}
                </div>

                {/* Player scores */}
                <div className="ludo-game__scoreboard">
                    {game.players.map(p => {
                        const cd = COLOR_MAP[p.color];
                        const isCurrentTurn = p.color === currentColor;
                        return (
                            <div key={p.id} className={`ludo-game__player-card ${isCurrentTurn ? 'ludo-game__player-card--active' : ''} ${p.id === playerId ? 'ludo-game__player-card--me' : ''}`}>
                                <span className="ludo-game__player-dot" style={{ background: cd.hex }}></span>
                                <span className="ludo-game__player-name">{p.name}</span>
                                <span className="ludo-game__player-progress">{p.finished}/4</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event toast */}
            {eventMsg && (
                <div className="ludo-game__event" key={JSON.stringify(game.lastEvent)}>
                    {eventMsg}
                </div>
            )}

            {/* Board */}
            <div className="ludo-game__board-container">
                <LudoBoard
                    players={game.players}
                    playerId={playerId}
                    selectableTokens={selectableTokens}
                    onSelectToken={onSelectMove}
                    validMoves={game.validMoves || []}
                    myColor={myColor}
                />
            </div>
        </div>
    );
}