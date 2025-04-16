const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const Jimp = require('jimp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://fitcheckmate.vercel.app']
}));
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Extract dominant color from image
const extractColor = async (buffer) => {
  const img = await Jimp.read(buffer);
  const color = img.getPixelColor(img.bitmap.width / 2, img.bitmap.height / 2);
  const { r, g, b } = Jimp.intToRGBA(color);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Upload endpoint (for extracting color)
app.post('/api/upload', upload.fields([
  { name: 'topImage' },
  { name: 'bottomImage' },
  { name: 'shoeImage' }
]), async (req, res) => {
  try {
    const top = await extractColor(req.files['topImage'][0].buffer);
    const bottom = await extractColor(req.files['bottomImage'][0].buffer);
    const shoes = await extractColor(req.files['shoeImage'][0].buffer);
    res.json({ top, bottom, shoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Save color endpoint
app.post('/api/save-color', async (req, res) => {
  const { item_name, extracted_color, match_color } = req.body;

  if (!item_name || !extracted_color || !match_color) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO colors (item_name, extracted_color, match_color) VALUES ($1, $2, $3) RETURNING *',
      [item_name, extracted_color, match_color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save color' });
  }
});

// Get all saved colors
app.get('/api/saved-colors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colors');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve colors' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
