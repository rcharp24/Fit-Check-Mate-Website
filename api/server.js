// server.js
require('dotenv').config();
const express                = require('express');
const cors                   = require('cors');
const fileUpload             = require('express-fileupload');
const ColorThief             = require('colorthief');
const path                   = require('path');
const fs                     = require('fs');
const multer                 = require('multer');
const { Pool }               = require('pg');
const { v2: cloudinary }     = require('cloudinary');
const { CloudinaryStorage }  = require('multer-storage-cloudinary');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ────── middleware ────── */
app.use(cors({ origin: "*"}));
app.use(express.json());
app.use(fileUpload());

/* ────── PostgreSQL ────── */
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

/* ────── Cloudinary ────── */
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
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
const rgbToHex = rgb =>
  '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');

async function extractColor(file, label) {
  const tmp = path.join(__dirname, `${label}-${Date.now()}.jpg`);
  await file.mv(tmp);
  try {
    const rgb = await ColorThief.getColor(tmp);
    return rgbToHex(rgb);
  } finally {
    fs.unlink(tmp, () => {});
  }
}

/* ────── routes ────── */

// POST /api/analyze  (fileUpload middleware)
app.post('/api/analyze', async (req, res) => {
  try {
    const { topImage, bottomImage, shoesImage } = req.files || {};
    if (!topImage || !bottomImage || !shoesImage) {
      return res.status(400).json({ message: 'All 3 images must be uploaded.' });
    }

    const [top, bottom, shoes] = await Promise.all([
      extractColor(topImage,   'top'),
      extractColor(bottomImage,'bottom'),
      extractColor(shoesImage, 'shoes')
    ]);

    res.json({ extractedColors: { top, bottom, shoes } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to extract colors.' });
  }
});

// POST /api/upload-images  (multer‑cloudinary middleware)
app.post(
  '/api/upload-images',
  upload.fields([
    { name: 'top',    maxCount: 1 },
    { name: 'bottom', maxCount: 1 },
    { name: 'shoes',  maxCount: 1 }
  ]),
  (req, res) => {
    res.json({
      top_image    : req.files?.top?.[0]?.path   || null,
      bottom_image : req.files?.bottom?.[0]?.path|| null,
      shoes_image  : req.files?.shoes?.[0]?.path || null
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

// health‑check
app.get('/', (_, res) => res.send('API is running ✅'));

/* ────── boot ────── */
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
