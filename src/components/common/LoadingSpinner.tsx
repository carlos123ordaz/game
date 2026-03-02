import '../../styles/components/spinner.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: SpinnerProps) {
  return (
    <div className="spinner-container">
      <div className={`spinner ${size !== 'md' ? `spinner--${size}` : ''}`} />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}
