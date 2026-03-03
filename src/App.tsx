import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuizPage } from './pages/games/QuizPage';
import { NotFound } from './pages/NotFound';
import { WouldYouRatherPage } from './pages/games/WouldYouRatherPage';
import { PictionaryPage } from './pages/games/PictionaryPage';

/**
 * GameHub — Multi-game platform
 *
 * To add a new game:
 * 1. Add game config to src/config/games.ts
 * 2. Create game types in src/types/games/
 * 3. Create game hook in src/hooks/games/
 * 4. Create game components in src/components/games/
 * 5. Create game page in src/pages/games/
 * 6. Add route below
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* ── Games ── */}
        <Route path="/games/quiz" element={<QuizPage />} />
        <Route path="/games/would-you-rather" element={<WouldYouRatherPage />} />
        <Route path="/games/pictionary" element={<PictionaryPage />} />
        {/* Add new game routes here */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
