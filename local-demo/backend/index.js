const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection pool
// const pool = new Pool({
//   user: "postgres",
//   host: "db",   // docker-compose 里 PostGIS 容器的名字
//   database: "poi_demo",
//   password: "postgres",
//   port: 5432
// });

const pool = new Pool({
	user: process.env.DB_USER || "postgres",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "poi_demo",
	password: process.env.DB_PASS || "postgres",
	port: 5432
  });
  

// Simple test API
app.get("/", (req, res) => {
  res.send("Backend API is running.");
});

// GET /pois - fetch all points
app.get("/pois", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        rating,
        ST_X(geom) AS lon,
        ST_Y(geom) AS lat
      FROM poi;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
