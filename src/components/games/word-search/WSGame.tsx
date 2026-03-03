import { useMemo } from 'react';
import { Button } from '../../common/Button';
import type { GridCell, WordSearchCategory, PlayerScore, WordPlacement, FindWordResult, HintData } from '../../../types/games/word-search';
import { WSGrid } from './WSGrid';

interface WSGameProps {
    grid: string[][];
    gridSize: number;
    words: string[];
    foundWords: Map<string, { playerId: string; playerName: string; cells: GridCell[] }>;
    placements: WordPlacement[];
    playerId: string;
    category: WordSearchCategory | null;
    currentRound: number;
    maxRounds: number;
    timeRemaining: number;
    scores: PlayerScore[];
    selecting: boolean;
    selectedCells: GridCell[];
    hint: HintData | null;
    lastFindResult: FindWordResult | null;
    onSelectionStart: (cell: GridCell) => void;
    onSelectionMove: (cell: GridCell) => void;
    onSelectionEnd: () => void;
    onRequestHint: () => void;
}

export function WSGame(props: WSGameProps) {
    const {
        grid, gridSize, words, foundWords, placements, playerId,
        category, currentRound, maxRounds, timeRemaining, scores,
        selecting, selectedCells, hint, lastFindResult,
        onSelectionStart, onSelectionMove, onSelectionEnd, onRequestHint,
    } = props;

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const isLowTime = timeRemaining <= 15;

    const wordStatuses = useMemo(() => {
        return words.map(word => {
            const found = foundWords.get(word);
            return {
                word,
                found: !!found,
                isMine: found?.playerId === playerId,
                playerName: found?.playerName || '',
            };
        });
    }, [words, foundWords, playerId]);

    const foundCount = wordStatuses.filter(w => w.found).length;
    const myCount = wordStatuses.filter(w => w.isMine).length;

    return (
        <div className="ws-game">
            <div className="ws-game__header">
                <div className="ws-game__round-info">
                    {category && <span className="ws-game__category">{category.emoji} {category.name}</span>}
                    <span className="ws-game__round-num">Ronda {currentRound + 1}/{maxRounds}</span>
                </div>
                <div className={`ws-game__timer ${isLowTime ? 'ws-game__timer--low' : ''}`}>
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="ws-game__word-count">
                    {foundCount}/{words.length} encontradas
                </div>
            </div>

            {lastFindResult && (
                <div className={`ws-game__feedback ${lastFindResult.success ? 'ws-game__feedback--success' : 'ws-game__feedback--fail'}`}>
                    {lastFindResult.success
                        ? `+${lastFindResult.points} pts`
                        : lastFindResult.reason === 'already-found' ? 'Ya encontrada' : 'No es una palabra'}
                </div>
            )}

            <div className="ws-game__body">
                <div className="ws-game__grid-wrapper">
                    <WSGrid
                        grid={grid}
                        gridSize={gridSize}
                        foundWords={foundWords}
                        placements={placements}
                        playerId={playerId}
                        selecting={selecting}
                        selectedCells={selectedCells}
                        hint={hint}
                        onSelectionStart={onSelectionStart}
                        onSelectionMove={onSelectionMove}
                        onSelectionEnd={onSelectionEnd}
                    />
                </div>

                <div className="ws-game__sidebar">
                    <div className="ws-game__words">
                        <div className="ws-game__words-header">
                            <span>Palabras</span>
                            <span className="ws-game__words-mine">{myCount} tuyas</span>
                        </div>
                        <ul className="ws-game__word-list">
                            {wordStatuses.map(({ word, found, isMine, playerName }) => (
                                <li key={word}
                                    className={`ws-game__word-item ${found ? (isMine ? 'ws-game__word-item--mine' : 'ws-game__word-item--other') : ''}`}
                                >
                                    <span className="ws-game__word-text">{word}</span>
                                    {found && <span className="ws-game__word-finder">{isMine ? 'Tu' : playerName}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ws-game__scores">
                        <div className="ws-game__scores-header">Puntaje</div>
                        <ul className="ws-game__score-list">
                            {scores.map((s, i) => (
                                <li key={s.playerId}
                                    className={`ws-game__score-item ${s.playerId === playerId ? 'ws-game__score-item--me' : ''}`}
                                >
                                    <span className="ws-game__score-rank">{i + 1}.</span>
                                    <span className="ws-game__score-name">{s.name}</span>
                                    <span className="ws-game__score-pts">{s.score}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button variant="ghost" size="sm" onClick={onRequestHint}>Pista</Button>
                </div>
            </div>
        </div>
    );
}