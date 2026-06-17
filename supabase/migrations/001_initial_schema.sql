-- ============================================================
-- Schema inițială: Platforma Ami & Moti
-- ============================================================

-- Extensii necesare
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABEL: parent_profiles
-- ============================================================
create table if not exists public.parent_profiles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  full_name    text not null,
  accepted_terms    boolean not null default false,
  parental_consent  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================
-- TABEL: child_profiles
-- ============================================================
create table if not exists public.child_profiles (
  id           uuid primary key default uuid_generate_v4(),
  parent_id    uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  age_group    text not null check (age_group in ('0-4', '5-8')),
  grade        text,
  avatar_url   text,
  pin_hash     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- TABEL: courses
-- ============================================================
create table if not exists public.courses (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  description         text not null,
  age_group           text not null check (age_group in ('0-4', '5-8')),
  cover_image         text,
  status              text not null default 'draft' check (status in ('draft', 'published')),
  estimated_duration  integer,
  order_index         integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- TABEL: modules
-- ============================================================
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  description text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TABEL: lessons
-- ============================================================
create table if not exists public.lessons (
  id                  uuid primary key default uuid_generate_v4(),
  module_id           uuid not null references public.modules(id) on delete cascade,
  title               text not null,
  description         text,
  lesson_type         text not null check (lesson_type in ('video', 'presentation', 'worksheet', 'quiz', 'mixed')),
  video_url           text,
  presentation_url    text,
  worksheet_url       text,
  duration_minutes    integer,
  order_index         integer not null default 0,
  status              text not null default 'draft' check (status in ('draft', 'reviewed', 'published')),
  ai_generated        boolean not null default false,
  human_reviewed      boolean not null default false,
  reviewer_notes      text,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- TABEL: progress
-- ============================================================
create table if not exists public.progress (
  id                uuid primary key default uuid_generate_v4(),
  child_profile_id  uuid not null references public.child_profiles(id) on delete cascade,
  course_id         uuid not null references public.courses(id) on delete cascade,
  lesson_id         uuid not null references public.lessons(id) on delete cascade,
  status            text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (child_profile_id, lesson_id)
);

-- ============================================================
-- TABEL: quizzes
-- ============================================================
create table if not exists public.quizzes (
  id          uuid primary key default uuid_generate_v4(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  title       text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id            uuid primary key default uuid_generate_v4(),
  quiz_id       uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  order_index   integer not null default 0
);

create table if not exists public.quiz_answers (
  id            uuid primary key default uuid_generate_v4(),
  question_id   uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text   text not null,
  is_correct    boolean not null default false,
  feedback      text
);

create table if not exists public.quiz_attempts (
  id                uuid primary key default uuid_generate_v4(),
  child_profile_id  uuid not null references public.child_profiles(id) on delete cascade,
  quiz_id           uuid not null references public.quizzes(id) on delete cascade,
  score             integer not null default 0,
  total_questions   integer not null default 0,
  completed_at      timestamptz not null default now()
);

-- ============================================================
-- INDECȘI pentru performanță
-- ============================================================
create index if not exists idx_child_profiles_parent on public.child_profiles(parent_id);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_age_group on public.courses(age_group);
create index if not exists idx_modules_course on public.modules(course_id);
create index if not exists idx_lessons_module on public.lessons(module_id);
create index if not exists idx_progress_child on public.progress(child_profile_id);
create index if not exists idx_progress_course on public.progress(course_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.parent_profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_attempts enable row level security;

-- ============================================================
-- POLITICI: parent_profiles
-- ============================================================
create policy "Parents can view own profile"
  on public.parent_profiles for select
  using (auth.uid() = user_id);

create policy "Parents can insert own profile"
  on public.parent_profiles for insert
  with check (auth.uid() = user_id);

create policy "Parents can update own profile"
  on public.parent_profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- POLITICI: child_profiles
-- ============================================================
create policy "Parents can view own children"
  on public.child_profiles for select
  using (auth.uid() = parent_id);

create policy "Parents can create children"
  on public.child_profiles for insert
  with check (auth.uid() = parent_id);

create policy "Parents can update own children"
  on public.child_profiles for update
  using (auth.uid() = parent_id);

create policy "Parents can delete own children"
  on public.child_profiles for delete
  using (auth.uid() = parent_id);

-- ============================================================
-- POLITICI: courses (publice dacă published, draft doar admin)
-- ============================================================
create policy "Anyone can view published courses"
  on public.courses for select
  using (status = 'published');

create policy "Admins can do everything on courses"
  on public.courses for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

-- ============================================================
-- POLITICI: modules
-- ============================================================
create policy "Anyone can view modules of published courses"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses
      where id = modules.course_id
      and status = 'published'
    )
  );

create policy "Admins can manage modules"
  on public.modules for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

-- ============================================================
-- POLITICI: lessons
-- ============================================================
create policy "Authenticated users can view published lessons"
  on public.lessons for select
  using (
    status = 'published'
    and auth.uid() is not null
  );

create policy "Admins can manage lessons"
  on public.lessons for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin');

-- ============================================================
-- POLITICI: progress
-- ============================================================
create policy "Parents can view child progress"
  on public.progress for select
  using (
    exists (
      select 1 from public.child_profiles
      where id = progress.child_profile_id
      and parent_id = auth.uid()
    )
  );

create policy "Parents can insert progress for own children"
  on public.progress for insert
  with check (
    exists (
      select 1 from public.child_profiles
      where id = child_profile_id
      and parent_id = auth.uid()
    )
  );

create policy "Parents can update progress for own children"
  on public.progress for update
  using (
    exists (
      select 1 from public.child_profiles
      where id = progress.child_profile_id
      and parent_id = auth.uid()
    )
  );

-- ============================================================
-- POLITICI: quizzes, quiz_questions, quiz_answers
-- ============================================================
create policy "Authenticated can view quizzes of published lessons"
  on public.quizzes for select
  using (auth.uid() is not null);

create policy "Authenticated can view quiz questions"
  on public.quiz_questions for select
  using (auth.uid() is not null);

create policy "Authenticated can view quiz answers"
  on public.quiz_answers for select
  using (auth.uid() is not null);

create policy "Admins can manage quizzes"
  on public.quizzes for all
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

create policy "Admins can manage quiz questions"
  on public.quiz_questions for all
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

create policy "Admins can manage quiz answers"
  on public.quiz_answers for all
  using (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
  );

-- ============================================================
-- POLITICI: quiz_attempts
-- ============================================================
create policy "Parents can view child quiz attempts"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.child_profiles
      where id = quiz_attempts.child_profile_id
      and parent_id = auth.uid()
    )
  );

create policy "Parents can insert quiz attempts for own children"
  on public.quiz_attempts for insert
  with check (
    exists (
      select 1 from public.child_profiles
      where id = child_profile_id
      and parent_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCȚIE: trigger updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_parent_profiles_updated_at
  before update on public.parent_profiles
  for each row execute function public.handle_updated_at();

create trigger set_child_profiles_updated_at
  before update on public.child_profiles
  for each row execute function public.handle_updated_at();

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();
