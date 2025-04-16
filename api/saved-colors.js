import Cors from 'micro-cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const cors = Cors();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default cors(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end("Method Not Allowed");

  try {
    const result = await pool.query("SELECT * FROM colors");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
