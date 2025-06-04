const { getColorFromURL } = require('colorthief');

async function extractHexColor(buffer) {
  try {
    const [r, g, b] = await getColorFromURL(buffer);
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`;
  } catch (error) {
    console.error("Error extracting color:", error);
    return null;
  }
}

module.exports = { extractHexColor };