import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Persistent wishes JSON store
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wishes.json');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// GET all wishes
app.get('/api/wishes', (_req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const wishes = JSON.parse(raw || '[]');
    res.json(wishes);
  } catch (err) {
    console.error('Error reading wishes:', err);
    res.json([]);
  }
});

// POST a new wish
app.post('/api/wishes', (req, res) => {
  try {
    const { name, attendance, guests, message } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const wishes = JSON.parse(raw || '[]');

    const newWish = {
      id: Date.now().toString(),
      name: name.trim(),
      attendance: attendance === 'no' ? 'no' : 'yes',
      guests: attendance === 'yes' ? (Number(guests) || 1) : 0,
      message: (message || '').trim(),
      time: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    };

    wishes.unshift(newWish);
    fs.writeFileSync(DATA_FILE, JSON.stringify(wishes, null, 2));

    res.status(201).json(newWish);
  } catch (err) {
    console.error('Error saving wish:', err);
    res.status(500).json({ error: 'Failed to save wish' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
