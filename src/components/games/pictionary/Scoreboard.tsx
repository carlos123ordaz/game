import type { PictionaryPlayer } from '../../../types/games/pictionary';

interface Props {
    players: PictionaryPlayer[];
    drawerId: string;
    guessedPlayerIds: string[];
    playerId: string;
}

export function Scoreboard({ players, drawerId, guessedPlayerIds, playerId }: Props) {
    const sorted = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="scoreboard">
            <div className="scoreboard__title">🏆 Puntaje</div>
            {sorted.map((player, i) => {
                const isDrawer = player.id === drawerId;
                const hasGuessed = guessedPlayerIds.includes(player.id);
                const isMe = player.id === playerId;

                return (
                    <div
                        key={player.id}
                        className={`scoreboard__player ${isMe ? 'scoreboard__player--me' : ''} ${!player.connected ? 'scoreboard__player--offline' : ''}`}
                    >
                        <span className="scoreboard__rank">#{i + 1}</span>
                        <div className="scoreboard__info">
                            <span className="scoreboard__name">
                                {player.name}
                                {isMe && ' (tú)'}
                            </span>
                            <div className="scoreboard__badges">
                                {isDrawer && <span className="scoreboard__badge scoreboard__badge--drawing">🎨</span>}
                                {hasGuessed && <span className="scoreboard__badge scoreboard__badge--guessed">✓</span>}
                                {!player.connected && <span className="scoreboard__badge scoreboard__badge--offline">⚡</span>}
                            </div>
                        </div>
                        <span className="scoreboard__score">{player.score}</span>
                    </div>
                );
            })}
        </div>
    );
}