import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../../types/games/pictionary';

interface Props {
    messages: ChatMessage[];
    onSendGuess: (text: string) => void;
    isDrawing: boolean;
    hasGuessed: boolean;
    playerId: string;
}

export function GuessingChat({ messages, onSendGuess, isDrawing, hasGuessed, playerId }: Props) {
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isDrawing || hasGuessed) return;
        onSendGuess(input.trim());
        setInput('');
        inputRef.current?.focus();
    };

    const canType = !isDrawing && !hasGuessed;

    return (
        <div className="chat">
            <div className="chat__header">
                <span className="chat__header-title">💬 Chat</span>
                {hasGuessed && <span className="chat__guessed-badge">✓ Adivinaste</span>}
            </div>

            <div className="chat__messages">
                {messages.length === 0 && (
                    <div className="chat__empty">
                        {isDrawing
                            ? 'Los demás intentarán adivinar tu dibujo aquí'
                            : 'Escribe tu intento en el chat'}
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`chat__msg chat__msg--${msg.type}`}>
                        {msg.type === 'system' ? (
                            <span className="chat__msg-system">{msg.text}</span>
                        ) : msg.type === 'correct' ? (
                            <span className="chat__msg-correct">🎉 {msg.text}</span>
                        ) : (
                            <>
                                <span className={`chat__msg-name ${msg.playerId === playerId ? 'chat__msg-name--me' : ''}`}>
                                    {msg.playerName}:
                                </span>
                                <span className="chat__msg-text">
                                    {msg.isClose ? '***' : msg.text}
                                </span>
                                {msg.isClose && (
                                    <span className="chat__msg-close">¡Casi!</span>
                                )}
                            </>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form className="chat__form" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    className="chat__input"
                    type="text"
                    placeholder={
                        isDrawing ? 'Estás dibujando...' :
                            hasGuessed ? '¡Ya adivinaste!' :
                                'Escribe tu intento...'
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!canType}
                    maxLength={100}
                    autoComplete="off"
                />
                <button className="chat__send" type="submit" disabled={!canType || !input.trim()}>
                    ➤
                </button>
            </form>
        </div>
    );
}