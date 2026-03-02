import { useEffect } from 'react';
import '../../styles/components/toast.css';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

const icons: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast--${type}`}>
      <span>{icons[type]}</span>
      <span>{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Cerrar">
        ✕
      </button>
    </div>
  );
}
