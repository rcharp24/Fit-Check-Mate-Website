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
  if (req.method !== 'POST') return res.status(405).end("Method Not Allowed");

  const { item_name, extracted_color, match_color } = req.body;
  if (!item_name || !extracted_color || !match_color) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO colors (item_name, extracted_color, match_color) VALUES ($1, $2, $3) RETURNING *",
      [item_name, extracted_color, match_color]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
