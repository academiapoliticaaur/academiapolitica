-- ============================================================
-- DATE DEMO — Platforma Academia Politica AUR
-- ATENȚIE: Rulează DUPĂ 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- CURS 1: "Atelierul de zâmbete" (Clasele 0–4)
-- ============================================================
insert into public.courses (id, title, slug, description, age_group, status, estimated_duration, order_index)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Atelierul de zâmbete',
  'atelierul-de-zambete',
  'Un curs prietenos despre emoții, comunicare și încredere în sine. Alături de Academia Politica AUR, copiii vor învăța să recunoască emoțiile, să le exprime și să se simtă bine în propria piele.',
  '0-4',
  'published',
  120,
  1
);

-- Module curs 1
insert into public.modules (id, course_id, title, description, order_index)
values
  ('b1000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Modulul 1 — Lumea emoțiilor', 'Descoperim împreună ce sunt emoțiile și de ce sunt importante.', 1),
  ('b2000000-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Modulul 2 — Prietenia', 'Cum facem prieteni și cum avem grijă de ei.', 2);

-- Lecții Modulul 1 — Curs 1
insert into public.lessons (id, module_id, title, description, lesson_type, video_url, presentation_url, duration_minutes, order_index, status, ai_generated, human_reviewed)
values
  (
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Ce sunt emoțiile?',
    'Ami ne prezintă emoțiile de bază: bucurie, tristețe, frică și furie.',
    'video',
    'https://www.youtube.com/watch?v=r9LelXa3U_I',
    null,
    10,
    1,
    'published',
    true,
    true
  ),
  (
    'c2000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Harta emoțiilor mele',
    'O activitate interactivă în care copilul identifică emoțiile din imagini.',
    'presentation',
    null,
    'https://docs.google.com/presentation/d/demo-placeholder/pub?output=pdf',
    15,
    2,
    'published',
    true,
    false
  );

-- Lecții Modulul 2 — Curs 1
insert into public.lessons (id, module_id, title, description, lesson_type, video_url, worksheet_url, duration_minutes, order_index, status, ai_generated, human_reviewed)
values
  (
    'c3000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'Cum recunoști un prieten adevărat?',
    'Moti ne povestește despre prietenia lui cu Ami.',
    'video',
    'https://www.youtube.com/watch?v=r9LelXa3U_I',
    null,
    10,
    1,
    'published',
    true,
    true
  ),
  (
    'c4000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'Desenează-ți prietenul!',
    'Fișă de lucru creativă: desenează și descrie cel mai bun prieten.',
    'worksheet',
    null,
    'https://example.com/fisiere/prietenul-meu-demo.pdf',
    20,
    2,
    'published',
    false,
    false
  );

-- Quiz pentru lecția 1
insert into public.quizzes (id, lesson_id, title)
values ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Ce știi despre emoții?');

insert into public.quiz_questions (id, quiz_id, question_text, order_index)
values
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Care dintre acestea este o emoție pozitivă?', 1),
  ('e2000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Ce facem când suntem triști?', 2);

insert into public.quiz_answers (question_id, answer_text, is_correct, feedback)
values
  ('e1000000-0000-0000-0000-000000000001', 'Bucuria 😊', true, 'Bravo! Bucuria este o emoție pozitivă!'),
  ('e1000000-0000-0000-0000-000000000001', 'Furia 😠', false, 'Furia este o emoție puternică, dar nu pozitivă. Încearcă din nou!'),
  ('e1000000-0000-0000-0000-000000000001', 'Frica 😨', false, 'Frica ne protejează, dar nu este pozitivă. Încearcă din nou!'),
  ('e2000000-0000-0000-0000-000000000001', 'Vorbim cu un prieten sau un adult de încredere', true, 'Perfect! Este bine să cerem ajutor când suntem triști.'),
  ('e2000000-0000-0000-0000-000000000001', 'Ne ascundem și nu spunem nimănui', false, 'Nu este cea mai bună idee. E bine să vorbim cu cineva drag!'),
  ('e2000000-0000-0000-0000-000000000001', 'Strigăm la toată lumea', false, 'Asta nu ne ajută. Încearcă să vorbești calm cu cineva.');

-- ============================================================
-- CURS 2: "Detectivii digitali" (Clasele 5–8)
-- ============================================================
insert into public.courses (id, title, slug, description, age_group, status, estimated_duration, order_index)
values (
  'a2b3c4d5-0000-0000-0000-000000000002',
  'Detectivii digitali',
  'detectivii-digitali',
  'O introducere prietenoasă în siguranța online, gândirea critică și utilizarea responsabilă a inteligenței artificiale. Alături de Moti Detectivul, vei descoperi cum să navighezi inteligent în lumea digitală.',
  '5-8',
  'published',
  150,
  2
);

-- Module curs 2
insert into public.modules (id, course_id, title, description, order_index)
values
  ('b3000000-0000-0000-0000-000000000002', 'a2b3c4d5-0000-0000-0000-000000000002', 'Modulul 1 — Sigur online', 'Cum ne protejăm datele și cum recunoaștem pericolele digitale.', 1),
  ('b4000000-0000-0000-0000-000000000002', 'a2b3c4d5-0000-0000-0000-000000000002', 'Modulul 2 — Gândire critică și AI', 'Ce este AI, cum funcționează și cum îl folosim responsabil.', 2);

-- Lecții Modulul 1 — Curs 2
insert into public.lessons (id, module_id, title, description, lesson_type, video_url, duration_minutes, order_index, status, ai_generated, human_reviewed)
values
  (
    'c5000000-0000-0000-0000-000000000002',
    'b3000000-0000-0000-0000-000000000002',
    'Datele tale, secretele tale',
    'Ce informații putem și NU putem împărtăși online.',
    'video',
    'https://www.youtube.com/watch?v=r9LelXa3U_I',
    12,
    1,
    'published',
    true,
    true
  ),
  (
    'c6000000-0000-0000-0000-000000000002',
    'b3000000-0000-0000-0000-000000000002',
    'Recunoaște fake news-ul!',
    'Exerciții de gândire critică: real sau fals?',
    'presentation',
    null,
    15,
    2,
    'published',
    true,
    false
  );

-- Lecții Modulul 2 — Curs 2
insert into public.lessons (id, module_id, title, description, lesson_type, video_url, worksheet_url, duration_minutes, order_index, status, ai_generated, human_reviewed)
values
  (
    'c7000000-0000-0000-0000-000000000002',
    'b4000000-0000-0000-0000-000000000002',
    'Ce este inteligența artificială?',
    'Moti explică AI pe înțelesul tuturor.',
    'video',
    'https://www.youtube.com/watch?v=r9LelXa3U_I',
    null,
    15,
    1,
    'published',
    true,
    true
  ),
  (
    'c8000000-0000-0000-0000-000000000002',
    'b4000000-0000-0000-0000-000000000002',
    'Folosim AI responsabil — fișă de lucru',
    'Activitate practică: Ce pot face cu AI? Ce NU ar trebui să fac?',
    'worksheet',
    null,
    'https://example.com/fisiere/ai-responsabil-demo.pdf',
    20,
    2,
    'published',
    false,
    false
  );
