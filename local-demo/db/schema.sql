-- first init PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- create schema
CREATE SCHEMA IF NOT EXISTS cege0043;
CREATE SCHEMA IF NOT EXISTS ucfscde;

-- Users table
CREATE TABLE IF NOT EXISTS ucfscde.users (
    user_id SERIAL PRIMARY KEY,
    user_name TEXT UNIQUE
);

-- Asset information table
CREATE TABLE IF NOT EXISTS cege0043.asset_information (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(255) UNIQUE,
    installation_date DATE,
    user_id INTEGER,
    timestamp TIMESTAMP DEFAULT NOW(),
    location GEOMETRY(Point, 4326)
);

-- Condition options table
CREATE TABLE IF NOT EXISTS cege0043.asset_condition_options (
    id SERIAL PRIMARY KEY,
    condition_description TEXT NOT NULL UNIQUE
);

-- Condition information table
CREATE TABLE IF NOT EXISTS cege0043.asset_condition_information (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES cege0043.asset_information(id) ON DELETE CASCADE,
    condition_id INTEGER REFERENCES cege0043.asset_condition_options(id),
    user_id INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);
