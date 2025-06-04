import microCors from 'micro-cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
const cors = microCors();
const sql = neon(process.env.DATABASE_URL);

export default cors(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { color, label } = req.body;

    if (!color || !label) {
      return res.status(400).json({ error: 'Missing color or label' });
    }

    await sql`
      INSERT INTO saved_colors (label, hex)
      VALUES (${label}, ${color})
    `;

    res.status(200).json({ message: 'Color saved!' });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
