const hexToRgb = (hex) => {
  const c = hex.slice(1);
  const rgb = parseInt(c, 16);
  return { r: (rgb >> 16) & 0xff, g: (rgb >> 8) & 0xff, b: rgb & 0xff };
};

const colorDistance = (rgb1, rgb2) => {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

module.exports = { hexToRgb, colorDistance };