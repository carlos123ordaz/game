interface QuizWaitingProps {
  partnerAnswered: boolean;
}

export function QuizWaiting({ partnerAnswered }: QuizWaitingProps) {
  return (
    <div className="waiting">
      <div className="waiting__icon">✨</div>
      <h2 className="waiting__title">¡Respuestas enviadas!</h2>
      <p className="waiting__text">
        Esperando a que tu compañero termine de responder...
      </p>

      <div className="waiting__loader">
        <div className="waiting__loader-dot" />
        <div className="waiting__loader-dot" />
        <div className="waiting__loader-dot" />
      </div>

      {partnerAnswered && (
        <div className="waiting__partner-status">
          ✓ Tu compañero también terminó — calculando resultados...
        </div>
      )}
    </div>
  );
}
