-- Migrație 019: Actualizare age_group pentru cursurile AUR
-- Înlocuiește valorile '9-12' (moștenite din fork) cu valorile corecte pe modul

UPDATE public.courses SET age_group = 'modul-1' WHERE id = 'a1000000-0000-0000-0000-000000000001';
UPDATE public.courses SET age_group = 'modul-2' WHERE id = 'a2000000-0000-0000-0000-000000000002';
UPDATE public.courses SET age_group = 'modul-3' WHERE id = 'a3000000-0000-0000-0000-000000000003';
UPDATE public.courses SET age_group = 'modul-4' WHERE id = 'a4000000-0000-0000-0000-000000000004';
