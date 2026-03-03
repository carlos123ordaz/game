/* File: src/components/games/ludo/Dice3D.tsx */

interface Props {
    value: number | null;
    rolling: boolean;
    canRoll: boolean;
    onRoll: () => void;
}

const FACE_DOTS: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[28, 28], [72, 72]],
    3: [[28, 28], [50, 50], [72, 72]],
    4: [[28, 28], [72, 28], [28, 72], [72, 72]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
    6: [[28, 25], [72, 25], [28, 50], [72, 50], [28, 75], [72, 75]],
};

const FACE_ROTATION: Record<number, string> = {
    1: 'rotateX(0deg) rotateY(0deg)',
    2: 'rotateX(-90deg) rotateY(0deg)',
    3: 'rotateY(90deg)',
    4: 'rotateY(-90deg)',
    5: 'rotateX(90deg)',
    6: 'rotateX(180deg)',
};

function DiceFace({ num, transform }: { num: number; transform: string }) {
    return (
        <div className="dice3d__face" style={{ transform }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
                {FACE_DOTS[num].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r={9}
                        fill={num === 1 || num === 4 ? '#EF4444' : '#1a1a2e'}
                    />
                ))}
            </svg>
        </div>
    );
}

export function Dice3D({ value, rolling, canRoll, onRoll }: Props) {
    const displayValue = value || 1;

    return (
        <div className="dice3d-wrapper">
            <div
                className={`dice3d ${canRoll ? 'dice3d--clickable' : ''} ${!canRoll && !rolling ? 'dice3d--disabled' : ''}`}
                onClick={canRoll ? onRoll : undefined}
            >
                <div
                    className={`dice3d__cube ${rolling ? 'dice3d__cube--rolling' : ''}`}
                    style={!rolling ? { transform: FACE_ROTATION[displayValue] } : undefined}
                >
                    <DiceFace num={1} transform="translateZ(40px)" />
                    <DiceFace num={6} transform="translateZ(-40px) rotateX(180deg)" />
                    <DiceFace num={2} transform="rotateX(90deg) translateZ(40px)" />
                    <DiceFace num={5} transform="rotateX(-90deg) translateZ(40px)" />
                    <DiceFace num={3} transform="rotateY(-90deg) translateZ(40px)" />
                    <DiceFace num={4} transform="rotateY(90deg) translateZ(40px)" />
                </div>
            </div>
            {canRoll && (
                <span className="dice3d__hint">Toca para lanzar</span>
            )}
        </div>
    );
}