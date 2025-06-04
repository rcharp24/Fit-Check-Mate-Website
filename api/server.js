const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Pool } = require('pg');
const sharp = require('sharp');
const ColorThief = require('colorthief');
const fs = require('fs').promises;
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json()); // This parses incoming JSON payloads

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

require("dotenv").config(); // Add this at the top if not there already

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});



// Convert RGB to HEX
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

// Extract dominant hex color using ColorThief
const extractHexColor = async (buffer) => {
  try {
    // Use sharp to process the image buffer and convert it to a temporary file
    const tempPath = `temp-${Date.now()}.jpg`;
    await sharp(buffer).toFile(tempPath);

    // Extract color using ColorThief
    const color = await ColorThief.getColor(tempPath);
    const [r, g, b] = color;

    // Clean up the temporary file
    setTimeout(async () => {
      try {
        await fs.unlink(tempPath);
        console.log(`Temporary file ${tempPath} deleted.`);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }, 100); // Wait 100ms before attempting to delete the file

    return rgbToHex(r, g, b);
  } catch (error) {
    console.error("Error extracting color:", error);
    return null;
  }
};

app.post('/api/analyze', upload.fields([
  { name: 'topImage' },
  { name: 'bottomImage' },
  { name: 'shoeImage' }
]), async (req, res) => {
  try {
    const files = req.files;

    if (!files || !files.topImage || !files.bottomImage || !files.shoeImage) {
      return res.status(400).json({ error: 'Missing images for analysis' });
    }

    const [topColor, bottomColor, shoeColor] = await Promise.all([
      extractHexColor(files.topImage[0].buffer),
      extractHexColor(files.bottomImage[0].buffer),
      extractHexColor(files.shoeImage[0].buffer),
    ]);

    res.json({
      extractedColors: {
        top: topColor || "N/A",
        bottom: bottomColor || "N/A",
        shoes: shoeColor || "N/A",
      },
    });
  } catch (error) {
    console.error("Error analyzing images:", error);
    res.status(500).json({ error: 'Error analyzing images' });
  }
});

app.post("/api/save-outfit", async (req, res) => {
  const { top, bottom, shoes, gender, season, style } = req.body;

  if (!top || !bottom || !shoes || !gender || !season || !style) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.query(
      "INSERT INTO saved_outfits (top_color, bottom_color, shoes_color, gender, season, style) VALUES ($1, $2, $3, $4, $5, $6)",
      [top, bottom, shoes, gender, season, style]
    );
    res.status(200).json({ message: "Outfit saved successfully" });
  } catch (err) {
    console.error("Error saving outfit:", err);
    res.status(500).json({ message: "Failed to save outfit" });
  }
});

app.get("/api/saved-outfits", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM saved_outfits ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching outfits:", err);
    res.status(500).json({ message: "Failed to fetch outfits" });
  }
});

// Example Node/Express DELETE handler
app.delete('/api/delete-outfit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    // delete logic here
    await db.query('DELETE FROM saved_outfits WHERE id = $1', [id]);
    res.json({ message: 'Outfit deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete outfit' });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
