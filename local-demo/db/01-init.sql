-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create POI table
CREATE TABLE IF NOT EXISTS poi (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rating FLOAT,
    geom GEOMETRY(Point, 4326)
);

-- Insert sample data
INSERT INTO poi (name, rating, geom)
VALUES
('Coffee Shop', 4.5, ST_SetSRID(ST_Point(-0.12, 51.51), 4326)),
('Library', 3.8, ST_SetSRID(ST_Point(-0.10, 51.52), 4326));
