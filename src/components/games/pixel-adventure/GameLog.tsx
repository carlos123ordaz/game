import { useRef, useEffect } from 'react';
import type { LogEntry } from '../../../types/games/pixelAdventure';

interface Props {
    logs: LogEntry[];
}

export function GameLog({ logs }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="gamelog">
            <div className="gamelog__header">📜 REGISTRO</div>
            <div className="gamelog__list">
                {logs.length === 0 && (
                    <div className="gamelog__empty">El juego comenzará pronto...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className={`gamelog__entry gamelog__entry--${log.type}`}>
                        <span className="gamelog__text">{log.text}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}