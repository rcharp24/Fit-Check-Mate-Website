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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
