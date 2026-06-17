-- Migration 012: Cursuri demonstrative
-- Cursurile cu is_demo=true sunt accesibile public fără autentificare

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.courses.is_demo IS
  'Dacă true, lecțiile sunt accesibile public fără autentificare (curs demonstrativ)';
