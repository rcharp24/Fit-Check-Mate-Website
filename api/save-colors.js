import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { color, hex } = req.body;

    if (!color || !hex) {
      return res.status(400).json({ error: 'Missing color or hex' });
    }

    try {
      await pool.query(
        'INSERT INTO saved_colors (color, hex) VALUES ($1, $2)',
        [color, hex]
      );
      res.status(200).json({ message: 'Color saved successfully!' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
