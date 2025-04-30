// utils/colorUtils.js

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function findClosestMatches(targetHex, palette, threshold = 100) {
  const targetRgb = hexToRgb(targetHex);
  const matches = palette.filter(hex => {
    const rgb = hexToRgb(hex);
    return colorDistance(targetRgb, rgb) <= threshold;
  });

  if (matches.length > 0) return { match: true, suggestions: matches };

  const sorted = [...palette].sort((a, b) => {
    return (
      colorDistance(targetRgb, hexToRgb(a)) -
      colorDistance(targetRgb, hexToRgb(b))
    );
  });

  return { match: false, suggestions: sorted.slice(0, 3) };
}

module.exports = { findClosestMatches };
