import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { GAMES } from '../config/games';
import '../styles/components/home.css';

export function Home() {
  return (
    <Layout>
      <div className="home">
        <div className="home__hero">
          <h1 className="home__title">
            <span className="text-gradient">GameHub</span>
          </h1>
          <p className="home__tagline">
            Juegos multijugador para disfrutar con amigos y pareja. Elige un juego y comparte el código.
          </p>
        </div>

        <div className="home__games">
          <div className="home__games-header">
            <span className="home__games-title">Juegos disponibles</span>
            <span className="home__games-count">{GAMES.length}</span>
          </div>

          {GAMES.length > 0 ? (
            <div className="home__grid">
              {GAMES.map((game, i) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className="game-card"
                  style={{
                    '--card-accent': game.color,
                    animationDelay: `${i * 0.08}s`,
                  } as React.CSSProperties}
                >
                  <div className="game-card__top">
                    <div className="game-card__icon">{game.emoji}</div>
                    <div className="game-card__info">
                      <div className="game-card__name">{game.name}</div>
                      <div className="game-card__meta">
                        <span>{game.minPlayers}–{game.maxPlayers} jugadores</span>
                      </div>
                    </div>
                  </div>
                  <p className="game-card__description">{game.description}</p>
                  <div className="game-card__tags">
                    {game.tags.map((tag) => (
                      <span key={tag} className="game-card__tag">{tag}</span>
                    ))}
                  </div>
                  <span className="game-card__arrow">→</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home__empty">
              <div className="home__empty-icon">🎮</div>
              <p>Próximamente habrá juegos disponibles</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
