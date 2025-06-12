const pool = require("../db");
const { hexToRgb, getDistance } = require("./colorMath"); // put RGB logic in colorMath.js

async function getClosestColorFromDB(extractedHex, threshold = 50) {
  const extractedRgb = hexToRgb(extractedHex);
  const { rows } = await pool.query("SELECT * FROM preset_colors");

  let closest = null;
  let minDistance = Infinity;

  for (const row of rows) {
    const presetRgb = hexToRgb(row.hex);
    const distance = getDistance(extractedRgb, presetRgb);

    if (distance < minDistance) {
      minDistance = distance;
      closest = row;
    }
  }

  return minDistance <= threshold ? closest : null;
}

module.exports = { getClosestColorFromDB };
