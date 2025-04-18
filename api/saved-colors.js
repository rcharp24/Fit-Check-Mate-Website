import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM saved_colors ORDER BY id DESC');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Database fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch saved colors' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
