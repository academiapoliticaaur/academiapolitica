-- Migration 016: Câmpuri dată și link înregistrare pentru webinarii
-- Aplică în Supabase Dashboard → SQL Editor

ALTER TABLE webinars
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registration_url TEXT;

-- Index pentru sortare după dată
CREATE INDEX IF NOT EXISTS idx_webinars_scheduled_at ON webinars (scheduled_at) WHERE scheduled_at IS NOT NULL;
