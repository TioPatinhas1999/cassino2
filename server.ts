import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import leaderboardHandler from './api/leaderboard.ts';
import crashHandler from './api/game/crash.ts';
import rouletteHandler from './api/game/roulette.ts';
import slotsHandler from './api/game/slots.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/leaderboard', (req, res) => leaderboardHandler(req as any, res as any));
  app.post('/api/game/crash', (req, res) => crashHandler(req as any, res as any));
  app.post('/api/game/roulette', (req, res) => rouletteHandler(req as any, res as any));
  app.post('/api/game/slots', (req, res) => slotsHandler(req as any, res as any));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
