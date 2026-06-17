-- Migration 011: Preferință email raport săptămânal
-- Permite părinților să se dezaboneze de la raportul automat (GDPR Art. 21)

ALTER TABLE public.parent_profiles
  ADD COLUMN IF NOT EXISTS email_reports boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.parent_profiles.email_reports IS
  'Consimțământ email raport săptămânal — GDPR Art. 21 drept la obiecție';
