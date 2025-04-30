const express = require("express");
const multer = require("multer");
const path = require("path");
const colorThief = require("colorthief");
const sharp = require("sharp");

const app = express();
const port = 5000;
const cors = require("cors");
app.use(cors());


const { Pool } = require("pg");

const pool = new Pool({
  user: "your_username",
  host: "localhost",
  database: "your_db_name",
  password: "your_password",
  port: 5432, // default PostgreSQL port
});

// Set up file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Define the color database
const colorDatabase = [
  "#FF5733", "#33FF57", "#3357FF", "#F0F0F0", "#000000", "#FFFFFF", "#FFD700",
  "#800080", "#FF6347", "#008080", "#FFFF00", "#C0C0C0", "#A52A2A", "#20B2AA",
  "#D2691E", "#FF1493", "#00CED1", "#7FFF00", "#0000FF", "#8A2BE2", "#E6E6FA",
  "#98FB98", "#FF8C00", "#6A5ACD", "#FF00FF", "#00FF00", "#00FFFF", "#FF4500",
  "#2E8B57", "#B8860B", "#DC143C", "#556B2F"
];

// Function to calculate color distance (Euclidean)
const colorDistance = (rgb1, rgb2) => {
  const rDiff = rgb1[0] - rgb2[0];
  const gDiff = rgb1[1] - rgb2[1];
  const bDiff = rgb1[2] - rgb2[2];
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

// Convert hex to RGB
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

// Compare if two colors are a match based on a threshold (e.g., 100)
const isColorMatch = (color1, color2) => {
  const threshold = 100;
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  return colorDistance(rgb1, rgb2) < threshold;
};

// Function to check if a color matches any from the database
const findMatch = (color) => {
  for (let i = 0; i < colorDatabase.length; i++) {
    if (isColorMatch(color, colorDatabase[i])) {
      return { extracted: color, match: colorDatabase[i] };
    }
  }
  return { extracted: color, match: null };
};

// Convert RGB array to Hex
const rgbToHex = (rgb) => {
  return "#" + rgb.map((x) => x.toString(16).padStart(2, "0")).join("");
};

// Analyze images and extract dominant colors
const analyzeImage = async (imagePath) => {
  try {
    const dominantColor = await colorThief.getColor(imagePath);
    return rgbToHex(dominantColor);
  } catch (error) {
    console.error("Error extracting color:", error);
    throw new Error("Color extraction failed");
  }
};

// Process image with sharp (for future enhancements)
const processImage = async (filePath) => {
  try {
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    console.log("Image width:", info.width, "Image height:", info.height);
    return data;
  } catch (err) {
    console.error("Color extraction error:", err);
    throw new Error("Color extraction failed");
  }
};

// Analyze colors from the uploaded image
app.post("/api/analyze", upload.fields([{ name: "topImage" }, { name: "bottomImage" }, { name: "shoeImage" }]), async (req, res) => {
  try {
    const files = req.files;
    if (!files || !files.topImage || !files.bottomImage || !files.shoeImage) {
      return res.status(400).json({ error: "Missing images for analysis" });
    }

    // Extract colors
    const [topColor, bottomColor, shoeColor] = await Promise.all([
      analyzeImage(files.topImage[0].path),
      analyzeImage(files.bottomImage[0].path),
      analyzeImage(files.shoeImage[0].path),
    ]);

    // Find matches in the database
    const colorsMatch = {
      topImage: findMatch(topColor),
      bottomImage: findMatch(bottomColor),
      shoeImage: findMatch(shoeColor),
    };

    res.json({
      topImage: topColor,
      bottomImage: bottomColor,
      shoeImage: shoeColor,
      colorsMatch: colorsMatch,
    });

  } catch (error) {
    console.error("Error analyzing images:", error);
    res.status(500).send("Error analyzing images");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
