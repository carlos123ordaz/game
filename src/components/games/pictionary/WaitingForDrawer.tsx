interface Props {
    drawerName: string;
    currentRound: number;
    totalRounds: number;
}

export function WaitingForDrawer({ drawerName, currentRound, totalRounds }: Props) {
    return (
        <div className="pic">
            <div className="pic__card">
                <div className="pic__round-badge">Ronda {currentRound}/{totalRounds}</div>
                <span className="pic__emoji">✏️</span>
                <h2 className="pic__title">{drawerName} está eligiendo una palabra...</h2>
                <p className="pic__subtitle">Prepárate para adivinar</p>
                <div className="pic__dots"><span /><span /><span /></div>
            </div>
        </div>
    );
}