import microCors from 'micro-cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
const cors = microCors();
const sql = neon(process.env.DATABASE_URL);

export default cors(async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const results = await sql`SELECT * FROM saved_colors ORDER BY created_at DESC`;

    res.status(200).json({ colors: results });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
