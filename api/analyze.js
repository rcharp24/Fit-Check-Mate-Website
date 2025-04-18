// File: /api/analyze.js

import Cors from 'micro-cors';
import Jimp from 'jimp';

const cors = Cors();

export const config = {
  api: {
    bodyParser: true, // Accept JSON body from frontend
  },
};

export default cors(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  try {
    const { topImage, bottomImage, shoeImage } = req.body;

    const extractHexFromBase64 = async (base64Image) => {
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const image = await Jimp.read(buffer);
      const color = image.getPixelColor(image.bitmap.width / 2, image.bitmap.height / 2);
      const { r, g, b } = Jimp.intToRGBA(color);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const topHex = await extractHexFromBase64(topImage);
    const bottomHex = await extractHexFromBase64(bottomImage);
    const shoeHex = await extractHexFromBase64(shoeImage);

    res.status(200).json({
      topColor: topHex,
      bottomColor: bottomHex,
      shoeColor: shoeHex,
    });
  } catch (err) {
    console.error("Image analysis error:", err);
    res.status(500).json({ error: "Image analysis failed" });
  }
});
