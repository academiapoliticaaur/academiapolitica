-- Migration 006: Clase pentru formatori
-- Tabele: classes, class_students, class_courses, class_student_progress

-- ============================================================
-- 1. CLASSES — clasele create de profesori
-- ============================================================
create table if not exists public.classes (
  id            uuid primary key default gen_random_uuid(),
  teacher_id    uuid not null references auth.users(id) on delete cascade,
  name          text not null,                        -- "Clasa a 3-a B"
  grade         text,                                 -- "3", "4", "5" etc.
  school_year   text not null default '2025-2026',    -- "2025-2026"
  access_code   text not null unique,                 -- ales de profesor, unic global
  status        text not null default 'active'
                  check (status in ('active', 'archived')),
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2. CLASS_STUDENTS — elevii dintr-o clasă (fără cont Supabase)
-- ============================================================
create table if not exists public.class_students (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references public.classes(id) on delete cascade,
  display_name  text not null,                        -- "Andrei M."
  student_code  text not null,                        -- scurt, unic în clasă, ex: "A1"
  pin_hash      text,                                 -- PIN opțional 4 cifre (bcrypt/sha256)
  age_group     text not null default '0-4'
                  check (age_group in ('0-4', '5-8')),
  created_at    timestamptz not null default now(),
  unique (class_id, student_code)
);

-- ============================================================
-- 3. CLASS_COURSES — cursuri asignate la o clasă
-- ============================================================
create table if not exists public.class_courses (
  class_id      uuid not null references public.classes(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  order_index   int not null default 0,
  assigned_at   timestamptz not null default now(),
  primary key (class_id, course_id)
);

-- ============================================================
-- 4. CLASS_STUDENT_PROGRESS — progresul elevilor (separat de family)
-- ============================================================
create table if not exists public.class_student_progress (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references public.class_students(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  status        text not null default 'in_progress'
                  check (status in ('in_progress', 'completed')),
  score         int,                                  -- scor quiz (0-100)
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  unique (student_id, lesson_id)
);

-- ============================================================
-- 5. INDECȘI pentru performanță
-- ============================================================
create index if not exists idx_classes_teacher_id on public.classes(teacher_id);
create index if not exists idx_classes_access_code on public.classes(access_code);
create index if not exists idx_class_students_class_id on public.class_students(class_id);
create index if not exists idx_class_courses_class_id on public.class_courses(class_id);
create index if not exists idx_class_student_progress_student_id on public.class_student_progress(student_id);

-- ============================================================
-- 6. RLS — Row Level Security
-- ============================================================
alter table public.classes enable row level security;
alter table public.class_students enable row level security;
alter table public.class_courses enable row level security;
alter table public.class_student_progress enable row level security;

-- Classes: profesorul vede și modifică doar clasele lui
drop policy if exists "Teacher manages own classes" on public.classes;
create policy "Teacher manages own classes"
  on public.classes for all
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- Class students: profesorul gestionează elevii din clasele lui
drop policy if exists "Teacher manages class students" on public.class_students;
create policy "Teacher manages class students"
  on public.class_students for all
  using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  )
  with check (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Class courses: profesorul gestionează cursurile din clasele lui
drop policy if exists "Teacher manages class courses" on public.class_courses;
create policy "Teacher manages class courses"
  on public.class_courses for all
  using (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  )
  with check (
    class_id in (
      select id from public.classes where teacher_id = auth.uid()
    )
  );

-- Class courses: read public pentru accesul elevilor (fără auth Supabase)
drop policy if exists "Public read class courses" on public.class_courses;
create policy "Public read class courses"
  on public.class_courses for select
  using (true);

-- Class students: read public pentru accesul elevilor (selectare din listă)
drop policy if exists "Public read class students" on public.class_students;
create policy "Public read class students"
  on public.class_students for select
  using (true);

-- Classes: read public pentru validarea codului de acces
drop policy if exists "Public read classes by code" on public.classes;
create policy "Public read classes by code"
  on public.classes for select
  using (true);

-- Progress: service role only (elevii accesează prin API route, nu direct)
drop policy if exists "Service role manages progress" on public.class_student_progress;
create policy "Service role manages progress"
  on public.class_student_progress for all
  using (true)
  with check (true);
