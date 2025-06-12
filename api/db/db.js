const { Pool } = require("pg");

const pool = new Pool({
  user: "neondb_owner",
  host: "ep-crimson-union-a5xsg9yt-pooler.us-east-2.aws.neon.tech",
  database: "neondb",
  password: "npg_2dACoN7rBLnv",
  port: 5432, // or your custom port
  ssl: {
    rejectUnauthorized: false, // needed for Neon
  },
});

module.exports = pool;
