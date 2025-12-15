const { Pool } = require("pg");
const dotenv = require('dotenv');
dotenv.config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // ssl: {
  //   rejectUnauthorized: false
  // }
});
async function connectDB() {
  try {
    const client = await pool.connect();
    console.log("connected");
    client.release();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

module.exports = { pool, connectDB };