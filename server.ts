import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Allow photo base64 payload up to 20MB
app.use(express.json({ limit: '20mb' }));

// Persistent wishes JSON store
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'wishes.json');
const PHOTO_FILE = path.join(DATA_DIR, 'zaire_photo.txt');

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure wishes data file exists with empty array by default
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
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
    const now = Date.now();
    const isoString = new Date(now).toISOString();

    const newWish = {
      id: now.toString(),
      name: name.trim(),
      attendance: attendance === 'no' ? 'no' : 'yes',
      guests: attendance === 'yes' ? (Number(guests) || 1) : 0,
      message: (message || '').trim(),
      createdAt: now,
      timestamp: isoString,
      time: new Date(now).toLocaleDateString('en-US', {
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

// GET locked photo of baby Zaire
app.get('/api/photo', (_req, res) => {
  try {
    if (fs.existsSync(PHOTO_FILE)) {
      const data = fs.readFileSync(PHOTO_FILE, 'utf-8');
      return res.json({ photo: data });
    }
  } catch (err) {
    console.error('Error reading photo:', err);
  }
  res.json({ photo: null });
});

// POST to permanently store son's photo on the server
app.post('/api/photo', (req, res) => {
  try {
    const { photo } = req.body;
    if (photo && typeof photo === 'string' && photo.startsWith('data:image')) {
      fs.writeFileSync(PHOTO_FILE, photo);

      // Extract binary buffer to save to public files as well
      const matches = photo.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const pubSonPath = path.resolve(__dirname, 'public', 'zaire_son.jpg');
        const pubNobgPath = path.resolve(__dirname, 'public', 'zaire_nobg.jpg');
        fs.writeFileSync(pubSonPath, buffer);
        fs.writeFileSync(pubNobgPath, buffer);
      }
      return res.json({ success: true });
    }
    res.status(400).json({ error: 'Invalid photo data' });
  } catch (err) {
    console.error('Error writing photo:', err);
    res.status(500).json({ error: 'Failed to save photo' });
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
