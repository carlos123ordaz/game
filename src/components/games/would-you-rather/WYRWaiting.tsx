interface WYRWaitingProps {
    partnerAnswered: boolean;
}

export function WYRWaiting({ partnerAnswered }: WYRWaitingProps) {
    return (
        <div className="wyr">
            <div className="wyr__card">
                <span className="wyr__emoji">{partnerAnswered ? '🎉' : '⏳'}</span>
                <h2 className="wyr__title">
                    {partnerAnswered ? '¡Ambos terminaron!' : 'Respuestas enviadas'}
                </h2>
                <p className="wyr__subtitle">
                    {partnerAnswered
                        ? 'Calculando resultados...'
                        : 'Esperando a que tu compañero termine sus dilemas...'}
                </p>

                {!partnerAnswered && (
                    <div className="wyr__waiting-animation">
                        <div className="wyr__waiting-dots">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}