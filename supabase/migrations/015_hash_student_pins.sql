-- Migration 015: Nulare PIN-uri elevi plain-text
-- PIN-urile existente nu pot fi recuperate ca hash-uri retroactiv.
-- De la această migrație, student_pin stochează SHA-256('ami-moti-elev:' || pin).
-- Profesorii trebuie să regenereze PIN-urile elevilor (buton RefreshCw din UI).

UPDATE class_students
SET student_pin = NULL
WHERE student_pin IS NOT NULL
  AND length(student_pin) = 4
  AND student_pin ~ '^\d{4}$';

-- Comentariu: PIN-urile hashuite au 64 caractere hex. Dacă există deja
-- hash-uri (de la un deploy anterior), le lăsăm neatinse (length != 4).
