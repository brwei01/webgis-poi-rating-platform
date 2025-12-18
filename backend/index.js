// ===========================
// Unified Backend Server
// ===========================

const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db_pool"); // PostgreSQL 连接池

const app = express();

// ===== Global Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (optional but useful)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check API
app.get("/", (req, res) => {
  res.send("Backend API is running.");
});

// ===== /pois API (PostGIS Example) =====
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
    console.error("Database query error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ===== API Routes from Old Frontend/app.js =====
const geoJSON = require("./routes/geoJSON");
const crud = require("./routes/crud");

app.use("/api/geojson", geoJSON);
app.use("/api", crud);

// for local: localhost:3000/api/geojson
// app.use("/api/geojson", geoJSON);
// app.use("/api", crud);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

