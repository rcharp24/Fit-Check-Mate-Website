// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const getColors = require('get-image-colors');
const tinycolor = require('tinycolor2');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// DB setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Multer for file buffers
const upload = multer({ storage: multer.memoryStorage() });

// Extract top 3 colors
async function extractColors(file) {
  try {
    const colors = await getColors(file.buffer, file.mimetype);
    return colors.slice(0, 3).map(c => c.hex());
  } catch (e) {
    console.error('Color extraction failed:', e);
    return [];
  }
}

// Matching logic
function isNeutral(c) { return tinycolor(c).isNeutral(); }
function hueDiff(c1, c2) {
  const h1 = tinycolor(c1).toHsl().h, h2 = tinycolor(c2).toHsl().h;
  const d = Math.abs(h1 - h2); return d > 180 ? 360 - d : d;
}
function colorsMatch(c1, c2) {
  if (isNeutral(c1) || isNeutral(c2)) return true;
  return hueDiff(c1, c2) <= 60;
}
function generateRecommendedColors(base) {
  const hsl = tinycolor(base).toHsl();
  return [
    tinycolor({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }).toHexString(),
    tinycolor({ h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l }).toHexString(),
    tinycolor({ h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l }).toHexString(),
  ];
}
function analyzeMatch({ top, bottom, shoes }) {
  const base = { top: top[0], bottom: bottom[0], shoes: shoes[0] };
  const status = {
    top: colorsMatch(base.top, base.bottom) && colorsMatch(base.top, base.shoes),
    bottom: colorsMatch(base.bottom, base.top) && colorsMatch(base.bottom, base.shoes),
    shoes: colorsMatch(base.shoes, base.top) && colorsMatch(base.shoes, base.bottom),
  };
  const all = status.top && status.bottom && status.shoes;
  const rec = {};
  if (!status.top) rec.top = generateRecommendedColors(base.top);
  if (!status.bottom) rec.bottom = generateRecommendedColors(base.bottom);
  if (!status.shoes) rec.shoes = generateRecommendedColors(base.shoes);
  return { matchStatus: all ? true : status, recommendedColors: all ? null : rec };
}

// POST /api/analyze
app.post('/api/analyze', upload.fields([{name:'topImage'}, {name:'bottomImage'},{name:'shoesImage'}]), async (req, res) => {
  console.log('Received /api/analyze');
  const { topImage, bottomImage, shoesImage } = req.files;
  if (!topImage || !bottomImage || !shoesImage) return res.status(400).json({ error: 'Upload all three images.' });
  try {
    const top = await extractColors(topImage[0]);
    const bottom = await extractColors(bottomImage[0]);
    const shoes = await extractColors(shoesImage[0]);
    console.log('Extracted:', { top, bottom, shoes });
    const extracted = { top, bottom, shoes };
    const analysis = analyzeMatch(extracted);
    res.json({ result: extracted, matchStatus: analysis.matchStatus, recommendedColors: analysis.recommendedColors });
  } catch (e) {
    console.error('Analysis error:', e);
    res.status(500).json({ error: 'Color analysis failed.' });
  }
});

// Optional: save presets, outfits, etc.
app.post('/api/preset-color', async (req, res) => {
  const { hex, name } = req.body;
  await pool.query('INSERT INTO preset_colors(hex,name) VALUES($1,$2)', [hex, name]);
  res.json({ success: true });
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
