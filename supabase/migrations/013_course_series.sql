-- Grupare cursuri multi-parte: o "serie" = mai multe cursuri cu același series_slug
ALTER TABLE courses ADD COLUMN IF NOT EXISTS series_slug  TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS series_order INT NOT NULL DEFAULT 1;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS series_title TEXT;

CREATE INDEX IF NOT EXISTS idx_courses_series ON courses (series_slug) WHERE series_slug IS NOT NULL;
