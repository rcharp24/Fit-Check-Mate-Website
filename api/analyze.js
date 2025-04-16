import { buffer } from 'micro';
import Cors from 'micro-cors';
import Jimp from 'jimp';

const cors = Cors();

export const config = {
  api: {
    bodyParser: false, // we're manually handling the buffer
  },
};

export default cors(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  try {
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
