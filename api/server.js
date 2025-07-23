// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const { createCanvas, loadImage } = require('canvas');
const ColorThief = require('colorthief');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

/* ────── middleware ────── */
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileUpload()); // Used for other endpoints
const memoryUpload = multer({ storage: multer.memoryStorage() });

/* ────── PostgreSQL ────── */
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

/* ────── Cloudinary ────── */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fitcheckmate_outfits',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (_, file) => `${Date.now()}-${file.originalname}`
  }
});
const upload = multer({ storage });

/* ────── helpers ────── */
const hexToRgb = hex => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: (bigint) & 255,
  };
};

const rgbToHex = (r, g, b) =>
  "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

const getDistance = (c1, c2) =>
  Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );

async function extractHexColor(buffer) {
  const base64 = buffer.toString("base64");
  const img = await loadImage(`data:image/png;base64,${base64}`);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const rgb = ColorThief.getColor(canvas);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

async function getAllPresetColors() {
  const result = await db.query("SELECT hex FROM preset_colors");
  return result.rows.map(row => row.hex.toUpperCase());
}

function findClosestMatch(hex, others, presets, threshold = 50) {
  const rgb = hexToRgb(hex);
  let bestHex = null;
  let bestScore = Infinity;

  for (const preset of presets) {
    const presetRgb = hexToRgb(preset);
    const distances = others.map(o => getDistance(presetRgb, hexToRgb(o)));
    const worst = Math.max(...distances);

    if (worst < bestScore && worst <= threshold) {
      bestScore = worst;
      bestHex = preset;
    }
  }

  return bestHex;
}

/* ────── Routes ────── */

// POST /api/analyze (advanced color logic)
app.post(
  "/api/analyze",
  memoryUpload.fields([
    { name: "topImage", maxCount: 1 },
    { name: "bottomImage", maxCount: 1 },
    { name: "shoesImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const top = await extractHexColor(req.files.topImage[0].buffer);
      const bottom = await extractHexColor(req.files.bottomImage[0].buffer);
      const shoes = await extractHexColor(req.files.shoesImage[0].buffer);

      const rgbTop = hexToRgb(top);
      const rgbBottom = hexToRgb(bottom);
      const rgbShoes = hexToRgb(shoes);

      const distTB = getDistance(rgbTop, rgbBottom);
      const distTS = getDistance(rgbTop, rgbShoes);
      const distBS = getDistance(rgbBottom, rgbShoes);

      const threshold = 50;
      const match = distTB <= threshold && distTS <= threshold && distBS <= threshold;

      let recommended = { top: null, bottom: null, shoes: null };

      if (!match) {
        const presets = await getAllPresetColors();

        const scores = [
          { part: "top", value: top, others: [bottom, shoes] },
          { part: "bottom", value: bottom, others: [top, shoes] },
          { part: "shoes", value: shoes, others: [top, bottom] },
        ];

        for (const { part, value, others } of scores) {
          const d1 = getDistance(hexToRgb(value), hexToRgb(others[0]));
          const d2 = getDistance(hexToRgb(value), hexToRgb(others[1]));
          if (d1 > threshold || d2 > threshold) {
            recommended[part] = findClosestMatch(value, others, presets, threshold);
          }
        }
      }

      res.json({
        success: true,
        matchStatus: match,
        extractedColors: { top, bottom, shoes },
        recommendedColors: recommended,
      });
    } catch (err) {
      console.error("Analyze error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/upload-images
app.post(
  '/api/upload-images',
  upload.fields([
    { name: 'top', maxCount: 1 },
    { name: 'bottom', maxCount: 1 },
    { name: 'shoes', maxCount: 1 }
  ]),
  (req, res) => {
    res.json({
      top_image: req.files?.top?.[0]?.path || null,
      bottom_image: req.files?.bottom?.[0]?.path || null,
      shoes_image: req.files?.shoes?.[0]?.path || null
    });
  }
);

// POST /api/save-outfit
app.post('/api/save-outfit', async (req, res) => {
  const {
    topcolor, bottomcolor, shoescolor,
    gender, season, style,
    topImage, bottomImage, shoesImage
  } = req.body;

  if (![topcolor, bottomcolor, shoescolor, gender, season, style, topImage, bottomImage, shoesImage].every(Boolean)) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(
      `INSERT INTO saved_outfits
       (top_color, bottom_color, shoes_color, gender, season, style,
        top_image, bottom_image, shoes_image)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [topcolor, bottomcolor, shoescolor, gender, season, style,
        topImage, bottomImage, shoesImage]
    );
    res.json({ message: 'Outfit saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save outfit' });
  }
});

// GET /api/saved-outfits
app.get('/api/saved-outfits', async (_, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM saved_outfits ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch outfits' });
  }
});

// DELETE /api/delete-outfit/:id
app.delete('/api/delete-outfit/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM saved_outfits WHERE id=$1', [req.params.id]);
    res.json({ message: 'Outfit deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete outfit' });
  }
});

// Health check
app.get('/', (_, res) => res.send('API is running ✅'));

/* ────── boot ────── */
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
