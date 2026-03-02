import { Link } from 'react-router-dom';
import '../../styles/components/layout.css';

interface LayoutProps {
  children: React.ReactNode;
  isConnected?: boolean;
  isConnecting?: boolean;
  showStatus?: boolean;
}

export function Layout({ children, isConnected, isConnecting, showStatus = false }: LayoutProps) {
  const statusClass = isConnected ? 'connected' : isConnecting ? 'connecting' : '';
  const statusText = isConnected ? 'online' : isConnecting ? 'conectando...' : 'offline';

  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__logo">
          <div className="layout__logo-icon">🎮</div>
          <span className="layout__logo-text">GameHub</span>
        </Link>
        {showStatus && (
          <div className="layout__status">
            <div className={`layout__status-dot layout__status-dot--${statusClass}`} />
            <span>{statusText}</span>
          </div>
        )}
      </header>
      <main className="layout__main">{children}</main>
    </div>
  );
}
