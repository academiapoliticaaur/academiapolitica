-- Migration 009: Google Drive integration
-- Adaugă folder IDs pe courses/modules/lessons + tabel settings pentru token

-- Coloane drive_folder_id
ALTER TABLE courses  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE modules  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
ALTER TABLE lessons  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Tabel settings pentru stocarea refresh token Google Drive
CREATE TABLE IF NOT EXISTS admin_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: doar service role poate citi/scrie (admin client bypass RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Nicio politică publică — accesibil doar prin service role key
