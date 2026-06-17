-- ============================================================
-- Migrație 018: Cursuri inițiale Academia Politica AUR
-- 4 module principale + sub-cursuri (modules în DB)
-- Lecțiile se adaugă ulterior din admin UI / Google Drive
-- ============================================================

-- ============================================================
-- MODULUL I — Formare Politică
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, age_group, audience, status, order_index, tags)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Modulul I — Formare Politică',
  'modulul-i-formare-politica',
  'Fundamentele formării politice: ideologii, doctrine, organizarea statului, comunicare politică și geopolitică. Cursul esențial pentru orice militant și activist AUR.',
  '9-12',
  'adult',
  'published',
  1,
  ARRAY['formare-politica', 'doctrina', 'conservatorism', 'ideologie']
);

INSERT INTO public.modules (course_id, title, description, order_index)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Ideologii și familii doctrinare',            'Panorama ideologiilor politice moderne și a familiilor doctrinare europene.',         1),
  ('a1000000-0000-0000-0000-000000000001', 'Organizarea și funcționarea statului',        'Structura constituțională a statului român. Separarea puterilor. Instituții.',          2),
  ('a1000000-0000-0000-0000-000000000001', 'Conduită și comunicare politică',             'Etica în politică, discurs public, comunicare cu alegătorii și mass-media.',            3),
  ('a1000000-0000-0000-0000-000000000001', 'Istorie și geopolitică',                      'Momente definitorii ale istoriei României și contextul geopolitic actual.',             4),
  ('a1000000-0000-0000-0000-000000000001', 'Doctrină conservatoare',                      'Valorile și principiile conservatorismului românesc. Doctrina AUR.',                   5),
  ('a1000000-0000-0000-0000-000000000001', 'Materiale auxiliare',                         'Documente, lecturi recomandate și resurse suplimentare pentru aprofundare.',            6);

-- ============================================================
-- MODULUL II — Instituții și Administrație Publică
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, age_group, audience, status, order_index, tags)
VALUES (
  'a2000000-0000-0000-0000-000000000002',
  'Modulul II — Instituții și Administrație Publică',
  'modulul-ii-institutii-administratie-publica',
  'Administrație publică, finanțe locale, achiziții publice și etică instituțională. Curs practic pentru viitorii aleși locali și funcționari publici AUR.',
  '9-12',
  'adult',
  'published',
  2,
  ARRAY['administratie-publica', 'institutii', 'finante-locale', 'etica', 'achizitii-publice']
);

INSERT INTO public.modules (course_id, title, description, order_index)
VALUES
  ('a2000000-0000-0000-0000-000000000002', 'Administrația publică din România. Noțiuni de bază',
   'Structura administrației publice centrale și locale. Principii de bună guvernare.',                                                                                             1),
  ('a2000000-0000-0000-0000-000000000002', 'Primarul și aparatul de specialitate. Consiliul local',
   'Rol, atribuții, competențe și responsabilități ale primarului și consiliului local.',                                                                                           2),
  ('a2000000-0000-0000-0000-000000000002', 'Finanțele publice locale. Bugetul de venituri și cheltuieli',
   'Elaborarea și execuția bugetului local. Taxe și impozite locale. Fonduri europene.',                                                                                            3),
  ('a2000000-0000-0000-0000-000000000002', 'Achiziții publice. Noțiuni de bază',
   'Legislația achizițiilor publice. SEAP. Proceduri de atribuire. Evitarea erorilor.',                                                                                            4),
  ('a2000000-0000-0000-0000-000000000002', 'Etică și integritate. Conflicte de interese. Incompatibilități',
   'Legislația anticorupție. Declarații de avere și interese. Politici de integritate.',                                                                                            5);

-- ============================================================
-- MODULUL III — Legislație și Activitate Parlamentară (Coming Soon)
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, age_group, audience, status, order_index, tags)
VALUES (
  'a3000000-0000-0000-0000-000000000003',
  'Modulul III — Legislație și Activitate Parlamentară',
  'modulul-iii-legislatie-activitate-parlamentara',
  'Procesul legislativ, activitatea parlamentară, inițiativa legislativă și controlul parlamentar. Curs în pregătire.',
  '9-12',
  'adult',
  'draft',
  3,
  ARRAY['legislatie', 'parlament', 'proces-legislativ']
);

-- ============================================================
-- MODULUL IV — Politică Externă, Securitate și Relații Internaționale
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, age_group, audience, status, order_index, tags)
VALUES (
  'a4000000-0000-0000-0000-000000000004',
  'Modulul IV — Politică Externă, Securitate și Relații Internaționale',
  'modulul-iv-politica-externa-securitate-relatii-internationale',
  'Geopolitica marilor puteri, securitate națională și euroatlantică, instituții internaționale și politică externă a României.',
  '9-12',
  'adult',
  'published',
  4,
  ARRAY['politica-externa', 'securitate', 'relatii-internationale', 'geopolitica']
);

INSERT INTO public.modules (course_id, title, description, order_index)
VALUES
  ('a4000000-0000-0000-0000-000000000004', 'America și lumea',                                      'Rolul SUA în ordinea globală. Relația transatlantică. Impactul asupra României.',      1),
  ('a4000000-0000-0000-0000-000000000004', 'Instituțiile de securitate în lumea contemporană',       'NATO, ONU, OSCE. Arhitectura de securitate europeană și globală.',                    2),
  ('a4000000-0000-0000-0000-000000000004', 'Europa: securitate și politici',                         'UE ca actor de securitate. PESCO. Politica externă și de apărare comună.',             3),
  ('a4000000-0000-0000-0000-000000000004', 'Instituții și securitate națională',                     'SRI, SIE, MAI, MApN. Cadrul legislativ al securității naționale a României.',          4),
  ('a4000000-0000-0000-0000-000000000004', 'Orientul Mijlociu: securitate și politică externă',      'Conflicte regionale, actori statali și non-statali, impactul asupra Europei.',         5);
