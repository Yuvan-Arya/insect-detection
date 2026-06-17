-- ============================================================
-- Supabase Schema Setup for Forest Wildlife Camera Trap
-- ============================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- BEFORE deploying the Pi for the first time.
-- ============================================================

-- 1. Create the metadata table
CREATE TABLE IF NOT EXISTS captures (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    captured_at TIMESTAMPTZ NOT NULL, --6:00
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    image_path  TEXT NOT NULL,          -- path inside the storage bucket
    ir1         SMALLINT NOT NULL DEFAULT 0,
    ir2         SMALLINT NOT NULL DEFAULT 0,
    rcwl1       SMALLINT NOT NULL DEFAULT 0,
    rcwl2       SMALLINT NOT NULL DEFAULT 0,
    box_id      TEXT NOT NULL,
    status      BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW() --9:00
);

-- Index for quick time-range queries
CREATE INDEX IF NOT EXISTS idx_captures_captured_at ON captures (captured_at DESC);

-- Index for geographic queries
CREATE INDEX IF NOT EXISTS idx_captures_location ON captures (latitude, longitude);

-- 2. Create the storage bucket (run this via Supabase Dashboard if SQL fails)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('wildlife-captures', 'wildlife-captures', false)
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- MANUAL STEP: Create the storage bucket
-- ============================================================
-- Go to Supabase Dashboard > Storage > New Bucket
--   Name: wildlife-captures
--   Public: OFF (private)
-- ============================================================
