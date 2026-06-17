-- ============================================================
-- Migrație 005: Audiențe noi pentru cursuri cadre didactice
-- ============================================================

-- Eliminăm constrangerea veche și adăugăm valori noi
alter table public.courses
  drop constraint if exists courses_audience_check;

alter table public.courses
  add constraint courses_audience_check
  check (audience in ('children', 'adult', 'all', 'invatator', 'profesor'));
