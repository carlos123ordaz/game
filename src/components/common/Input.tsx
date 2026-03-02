import '../../styles/components/input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
  error?: boolean;
  inputSize?: 'md' | 'lg';
}

export function Input({ label, mono, error, inputSize = 'md', className = '', ...props }: InputProps) {
  const classes = [
    'input',
    mono && 'input--mono',
    inputSize === 'lg' && 'input--lg',
    error && 'input--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (label) {
    return (
      <div className="input-group">
        <label className="input-group__label">{label}</label>
        <input className={classes} {...props} />
      </div>
    );
  }

  return <input className={classes} {...props} />;
}
