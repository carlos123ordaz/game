import { useEffect, useState } from 'react';

interface PuzzleCountdownProps {
    seconds: number;
}

export function PuzzleCountdown({ seconds }: PuzzleCountdownProps) {
    const [count, setCount] = useState(seconds);

    useEffect(() => {
        if (count <= 0) return;
        const timer = setTimeout(() => setCount(count - 1), 1000);
        return () => clearTimeout(timer);
    }, [count]);

    return (
        <div className="puzzle-countdown">
            <div className="puzzle-countdown__backdrop" />
            <div className="puzzle-countdown__content">
                <p className="puzzle-countdown__label">¡Prepárate!</p>
                <div className="puzzle-countdown__number" key={count}>
                    {count > 0 ? count : '🧩'}
                </div>
                <p className="puzzle-countdown__sublabel">
                    {count > 0 ? 'El rompecabezas se arma en...' : '¡A jugar!'}
                </p>
            </div>
        </div>
    );
}