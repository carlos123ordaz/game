/* File: src/components/games/ludo/LudoBoard.tsx */
import { useMemo } from 'react';
import type { LudoPlayer, LudoColor, LudoMove, BoardCell } from '../../../types/games/ludo';
import {
    COLOR_MAP, MAIN_PATH, HOME_COLUMNS, BASE_POSITIONS,
    SAFE_POSITIONS, START_POSITIONS, getTokenCoords,
} from '../../../types/games/ludo';
import { AnimatedToken } from './AnimatedToken';

interface Props {
    players: LudoPlayer[];
    playerId: string;
    selectableTokens: number[];
    onSelectToken: (tokenIndex: number) => void;
    validMoves: LudoMove[];
    myColor: LudoColor | null;
}

const CELL_SIZE = 40;
const BOARD_SIZE = 15;
const SVG_SIZE = BOARD_SIZE * CELL_SIZE;
const TOKEN_RADIUS = 14;

const BASE_AREAS: Record<LudoColor, { x: number; y: number; w: number; h: number }> = {
    red: { x: 0, y: 9, w: 6, h: 6 },
    green: { x: 0, y: 0, w: 6, h: 6 },
    yellow: { x: 9, y: 0, w: 6, h: 6 },
    blue: { x: 9, y: 9, w: 6, h: 6 },
};

function cellToPixel(cell: BoardCell): { x: number; y: number } {
    return { x: cell.c * CELL_SIZE + CELL_SIZE / 2, y: cell.r * CELL_SIZE + CELL_SIZE / 2 };
}

export function LudoBoard({ players, playerId, selectableTokens, onSelectToken, validMoves, myColor }: Props) {


    // Highlight cells for valid moves
    const highlightCells = useMemo(() => {
        if (!myColor) return new Set<string>();
        const set = new Set<string>();
        validMoves.forEach(m => {
            const coords = getTokenCoords(myColor, m.to, m.tokenIndex);
            set.add(`${coords.r}-${coords.c}`);
        });
        return set;
    }, [validMoves, myColor]);

    // Detect safe squares on main path
    const safeCells = useMemo(() => {
        const set = new Set<string>();
        SAFE_POSITIONS.forEach(idx => {
            const c = MAIN_PATH[idx];
            set.add(`${c.r}-${c.c}`);
        });
        return set;
    }, []);

    // Compute stack offsets: group tokens by their target cell
    const stackOffsets = useMemo(() => {
        const cellMap = new Map<string, Array<{ color: LudoColor; tokenIdx: number }>>();
        players.forEach(p => {
            if (!p.tokens) return;
            p.tokens.forEach((pos, tIdx) => {
                const coords = getTokenCoords(p.color, pos, tIdx);
                const key = `${coords.r}-${coords.c}`;
                if (!cellMap.has(key)) cellMap.set(key, []);
                cellMap.get(key)!.push({ color: p.color, tokenIdx: tIdx });
            });
        });

        const offsets = new Map<string, { x: number; y: number }>();
        cellMap.forEach((tokens, _key) => {
            tokens.forEach((token, stackIdx) => {
                const id = `${token.color}-${token.tokenIdx}`;
                if (tokens.length <= 1) {
                    offsets.set(id, { x: 0, y: 0 });
                } else {
                    const ox = stackIdx % 2 === 0 ? -6 : 6;
                    const oy = tokens.length > 2 ? (stackIdx < 2 ? -6 : 6) : 0;
                    offsets.set(id, { x: ox, y: oy });
                }
            });
        });
        return offsets;
    }, [players]);

    // Collect all tokens for rendering
    const allTokens = useMemo(() => {
        const tokens: Array<{
            color: LudoColor;
            tokenIndex: number;
            relativePos: number;
            playerId: string;
            isSelectable: boolean;
        }> = [];
        players.forEach(p => {
            if (!p.tokens) return;
            p.tokens.forEach((pos, tIdx) => {
                tokens.push({
                    color: p.color,
                    tokenIndex: tIdx,
                    relativePos: pos,
                    playerId: p.id,
                    isSelectable: p.id === playerId && selectableTokens.includes(tIdx),
                });
            });
        });
        return tokens;
    }, [players, playerId, selectableTokens]);

    return (
        <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="ludo-board__svg">
            {/* Background */}
            <rect x="0" y="0" width={SVG_SIZE} height={SVG_SIZE} fill="#1a1a2e" rx="8" />

            {/* Base areas */}
            {Object.entries(BASE_AREAS).map(([color, area]) => (
                <rect key={color} x={area.x * CELL_SIZE + 4} y={area.y * CELL_SIZE + 4}
                    width={area.w * CELL_SIZE - 8} height={area.h * CELL_SIZE - 8}
                    fill={COLOR_MAP[color as LudoColor].hex + '20'} stroke={COLOR_MAP[color as LudoColor].hex}
                    strokeWidth="2" rx="12" />
            ))}

            {/* Path squares */}
            {MAIN_PATH.map((cell, idx) => {
                const x = cell.c * CELL_SIZE;
                const y = cell.r * CELL_SIZE;
                const key = `${cell.r}-${cell.c}`;
                const isSafe = safeCells.has(key);
                const isHighlight = highlightCells.has(key);
                const isStart = Object.entries(START_POSITIONS).find(([, v]) => v === idx);
                const startColor = isStart ? isStart[0] as LudoColor : null;

                return (
                    <g key={`path-${idx}`}>
                        <rect x={x + 1} y={y + 1} width={CELL_SIZE - 2} height={CELL_SIZE - 2}
                            fill={startColor ? COLOR_MAP[startColor].hex + '40' : '#2a2a4a'}
                            stroke={isHighlight ? '#fff' : isSafe ? '#fbbf24' : '#3a3a5a'}
                            strokeWidth={isHighlight ? 2 : 1} rx="4" />
                        {isSafe && <circle cx={x + CELL_SIZE / 2} cy={y + CELL_SIZE / 2} r="4" fill="#fbbf24" opacity="0.4" />}
                    </g>
                );
            })}

            {/* Home columns */}
            {Object.entries(HOME_COLUMNS).map(([color, cells]) =>
                cells.map((cell, idx) => {
                    const x = cell.c * CELL_SIZE;
                    const y = cell.r * CELL_SIZE;
                    const key = `${cell.r}-${cell.c}`;
                    const isHighlight = highlightCells.has(key);
                    return (
                        <rect key={`home-${color}-${idx}`} x={x + 1} y={y + 1} width={CELL_SIZE - 2} height={CELL_SIZE - 2}
                            fill={COLOR_MAP[color as LudoColor].hex + '30'}
                            stroke={isHighlight ? '#fff' : COLOR_MAP[color as LudoColor].hex + '60'}
                            strokeWidth={isHighlight ? 2 : 1} rx="4" />
                    );
                })
            )}

            {/* Center home */}
            <rect x={7 * CELL_SIZE + 1} y={7 * CELL_SIZE + 1} width={CELL_SIZE - 2} height={CELL_SIZE - 2}
                fill="#fbbf24" opacity="0.3" stroke="#fbbf24" strokeWidth="2" rx="4" />

            {/* Base token spots (empty circles) */}
            {Object.entries(BASE_POSITIONS).map(([color, cells]) =>
                cells.map((cell, idx) => {
                    const { x, y } = cellToPixel(cell);
                    return (
                        <circle key={`base-${color}-${idx}`} cx={x} cy={y} r={TOKEN_RADIUS - 2}
                            fill="none" stroke={COLOR_MAP[color as LudoColor].hex + '40'} strokeWidth="2" strokeDasharray="4 3" />
                    );
                })
            )}

            {/* Animated Tokens */}
            {allTokens.map(token => {
                const offsetKey = `${token.color}-${token.tokenIndex}`;
                const offset = stackOffsets.get(offsetKey) || { x: 0, y: 0 };

                return (
                    <AnimatedToken
                        key={`token-${token.color}-${token.tokenIndex}`}
                        color={token.color}
                        tokenIndex={token.tokenIndex}
                        relativePos={token.relativePos}
                        isSelectable={token.isSelectable}
                        onClick={() => onSelectToken(token.tokenIndex)}
                        stackOffset={offset}
                        cellSize={CELL_SIZE}
                    />
                );
            })}

            {/* SVG Defs */}
            <defs>
                <filter id="tokenShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
                </filter>
                {/* Token gradients for 3D-ish look */}
                <radialGradient id="token-grad-red" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#dc2626" />
                </radialGradient>
                <radialGradient id="token-grad-green" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                </radialGradient>
                <radialGradient id="token-grad-yellow" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="100%" stopColor="#ca8a04" />
                </radialGradient>
                <radialGradient id="token-grad-blue" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                </radialGradient>
            </defs>
        </svg>
    );
}