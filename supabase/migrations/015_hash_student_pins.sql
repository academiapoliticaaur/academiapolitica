-- Migration 015: Nulare PIN-uri elevi plain-text
-- PIN-urile existente nu pot fi recuperate ca hash-uri retroactiv.
-- De la această migrație, pin_hash stochează SHA-256('academia-aur-elev:' || pin).
-- Profesorii trebuie să regenereze PIN-urile elevilor (buton RefreshCw din UI).

UPDATE class_students
SET pin_hash = NULL
WHERE pin_hash IS NOT NULL
  AND length(pin_hash) = 4
  AND pin_hash ~ '^\d{4}$';

-- Comentariu: PIN-urile hashuite au 64 caractere hex. Dacă există deja
-- hash-uri (de la un deploy anterior), le lăsăm neatinse (length != 4).
