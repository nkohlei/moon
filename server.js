import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Static frontend assets (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// 2. High-Res Tile Library
// Note: These are stored in public/tiles which Vite copies to dist/
app.use('/tiles', express.static(path.join(__dirname, 'dist/tiles')));

// 3. Health Check
app.get('/api/status', (req, res) => {
    res.send({ status: 'online', mode: 'High-Fidelity Tiling' });
});

// 4. SPA Fallback (Safe wildcard)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Lunar Atlas Server Active!`);
    console.log(`👉 View locally at: http://localhost:${PORT}`);
    console.log(`📦 Serving 27K Tiled Data Repository\n`);
});
