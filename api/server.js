const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const ColorThief = require("colorthief");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Pool } = require("pg");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// PostgreSQL setup
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Cloudinary setup
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
  },
});
const upload = multer({ storage });

// Convert RGB array to hex
function rgbToHex(rgb) {
  return (
    "#" +
    rgb
      .map((val) => {
        const hex = val.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

// Save file temporarily, extract color, delete file
const extractColor = async (imageFile, imageLabel) => {
  const tempPath = path.join(__dirname, `${imageLabel}-${Date.now()}.jpg`);
  await imageFile.mv(tempPath);
  try {
    const rgb = await ColorThief.getColor(tempPath);
    return rgbToHex(rgb);
  } catch (err) {
    console.error(`Error extracting color from ${imageLabel}:`, err);
    throw new Error(`Color extraction failed for ${imageLabel}`);
  } finally {
    fs.unlink(tempPath, () => {});
  }
};

// Analyze image colors
app.post("/api/analyze", async (req, res) => {
  const topFile = req.files?.topImage;
  const bottomFile = req.files?.bottomImage;
  const shoesFile = req.files?.shoesImage;

  if (!topFile || !bottomFile || !shoesFile) {
    return res.status(400).json({ message: "All 3 images must be uploaded." });
  }

  try {
    const [topcolor, bottomcolor, shoescolor] = await Promise.all([
      extractColor(topFile, "top"),
      extractColor(bottomFile, "bottom"),
      extractColor(shoesFile, "shoes"),
    ]);

    return res.json({
      extractedColors: {
        top: topcolor,
        bottom: bottomcolor,
        shoes: shoescolor,
      },
    });
  } catch (error) {
    console.error("Color extraction error:", error.message);
    return res.status(500).json({ message: "Failed to extract colors." });
  }
});

// Upload images to Cloudinary
app.post('/api/upload-images', upload.fields([
  { name: 'top', maxCount: 1 },
  { name: 'bottom', maxCount: 1 },
  { name: 'shoes', maxCount: 1 },
]), async (req, res) => {
  try {
    const topImage = req.files.top?.[0]?.path || null;
    const bottomImage = req.files.bottom?.[0]?.path || null;
    const shoesImage = req.files.shoes?.[0]?.path || null;

    res.json({
      top_image: topImage,
      bottom_image: bottomImage,
      shoes_image: shoesImage,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Save outfit
app.post('/api/save-outfit', async (req, res) => {
  const {
    topcolor,
    bottomcolor,
    shoescolor,
    gender,
    season,
    style,
    topImage,
    bottomImage,
    shoesImage,
  } = req.body;

  if (!topcolor || !bottomcolor || !shoescolor || !gender || !season || !style || !topImage || !bottomImage || !shoesImage) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.query(
  `INSERT INTO saved_outfits (top_color, bottom_color, shoes_color, gender, season, style, top_image, bottom_image, shoes_image)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
  [topcolor, bottomcolor, shoescolor, gender, season, style, topImage, bottomImage, shoesImage]
);
    res.status(200).json({ message: 'Outfit saved successfully' });
  } catch (err) {
    console.error('Error saving outfit:', err);
    res.status(500).json({ message: 'Failed to save outfit' });
  }
});

// Get saved outfits
app.get('/api/saved-outfits', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM saved_outfits ORDER BY created_at DESC');
    console.log("Fetched outfits:", result.rows); // <- ADD THIS
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching outfits:', err);
    res.status(500).json({ message: 'Failed to fetch outfits' });
  }
});

// Delete outfit
app.delete('/api/delete-outfit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM saved_outfits WHERE id = $1', [id]);
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete outfit' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
