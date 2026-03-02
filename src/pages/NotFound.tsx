import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Button } from '../components/common/Button';

export function NotFound() {
  return (
    <Layout>
      <div className="quiz" style={{ textAlign: 'center' }}>
        <div className="quiz__card">
          <span className="quiz__emoji">🌌</span>
          <h2 className="quiz__title">Perdido en el espacio</h2>
          <p className="quiz__subtitle">
            Esta página no existe. Puede que la URL esté mal o el juego ya no esté disponible.
          </p>
          <Link to="/">
            <Button fullWidth>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
