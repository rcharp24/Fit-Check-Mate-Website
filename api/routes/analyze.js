const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createCanvas, loadImage } = require("canvas");
const ColorThief = require("color-thief-node");
const db = require("../db"); // Uses .env DATABASE_URL

const upload = multer({ storage: multer.memoryStorage() });

function hexToRgb(hex) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: (bigint) & 255,
  };
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function getDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

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

router.post(
  "/analyze",
  upload.fields([
    { name: "topImage", maxCount: 1 },
    { name: "bottomImage", maxCount: 1 },
    { name: "shoeImage", maxCount: 1 },
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

      console.log("Distances:", { distTB, distTS, distBS });

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
        extractedColors: {
          top,
          bottom,
          shoes,
        },
        recommendedColors: recommended,
      });
    } catch (err) {
      console.error("Analyze error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
