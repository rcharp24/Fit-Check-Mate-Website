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
  if (req.method !== 'POST') {
    return res.status(405).end("Method Not Allowed"); // if not POST, return 405
  }

  try {
    // Your logic for handling POST request
    const rawBody = await buffer(req);
    const image = await Jimp.read(rawBody);
    const color = image.getPixelColor(image.bitmap.width / 2, image.bitmap.height / 2);
    const { r, g, b } = Jimp.intToRGBA(color);
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;

    res.json({ extractedColor: hex });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image analysis failed" });
  }
});

