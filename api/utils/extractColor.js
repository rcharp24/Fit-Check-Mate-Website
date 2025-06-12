const ColorThief = require('colorthief');
const { findClosestMatch } = require('./colorUtils'); // import the matching function

async function extractHexColorFromBuffer(buffer, presetColors = []) {
  try {
    const [r, g, b] = await ColorThief.getColor(buffer);
    const hex = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;

    let closestMatch = null;
    if (presetColors.length > 0) {
      closestMatch = findClosestMatch(hex, presetColors);
    }

    return { hex, closestMatch };
  } catch (error) {
    console.error("Error extracting color:", error);
    return { hex: null, closestMatch: null };
  }
}

module.exports = { extractHexColorFromBuffer };