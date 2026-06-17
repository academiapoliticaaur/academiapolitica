-- ============================================================
-- Migrație 004: Categorii cursuri, Webinarii, Trasee de instruire
-- ============================================================

-- ============================================================
-- 1. COURSE CATEGORIES — grupe dinamice cursanți
-- ============================================================
create table if not exists public.course_categories (
  id          uuid primary key default uuid_generate_v4(),
  key         text not null unique,
  label       text not null,
  emoji       text not null default '📚',
  color       text not null default 'blue',
  audience    text not null check (audience in ('children', 'adult', 'all')) default 'children',
  is_active   boolean not null default true,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.course_categories enable row level security;

create policy "Anyone can view active categories"
  on public.course_categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on public.course_categories for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- Seed categorii implicite
insert into public.course_categories (key, label, emoji, color, audience, order_index) values
  ('0-4',  'Clasele 0–4', '🌈', 'teal',   'children', 1),
  ('5-8',  'Clasele 5–8', '🚀', 'blue',   'children', 2),
  ('9-12', 'Clasele 9–12','⚡', 'orange', 'children', 3)
on conflict (key) do nothing;

-- ============================================================
-- 2. WEBINARII
-- ============================================================
create table if not exists public.webinars (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  youtube_id  text not null,
  presenter   text,
  audience    text not null check (audience in ('children', 'adult', 'all')) default 'all',
  status      text not null default 'draft' check (status in ('draft', 'published')),
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.webinars enable row level security;

create policy "Anyone can view published webinars"
  on public.webinars for select
  using (status = 'published');

create policy "Admins can manage webinars"
  on public.webinars for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

create trigger set_webinars_updated_at
  before update on public.webinars
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 3. TRASEE DE INSTRUIRE — Learning Paths
-- ============================================================
create table if not exists public.learning_paths (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  slug        text not null unique,
  description text,
  audience    text not null check (audience in ('children', 'adult', 'all')) default 'children',
  skill_name  text,
  cover_image text,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  order_index integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.learning_paths enable row level security;

create policy "Anyone can view published paths"
  on public.learning_paths for select
  using (status = 'published');

create policy "Admins can manage paths"
  on public.learning_paths for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

create trigger set_learning_paths_updated_at
  before update on public.learning_paths
  for each row execute function public.handle_updated_at();

-- Cursuri dintr-un traseu
create table if not exists public.learning_path_courses (
  id          uuid primary key default uuid_generate_v4(),
  path_id     uuid not null references public.learning_paths(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  order_index integer not null default 0,
  unique (path_id, course_id)
);

alter table public.learning_path_courses enable row level security;

create policy "Anyone can view path courses"
  on public.learning_path_courses for select
  using (true);

create policy "Admins can manage path courses"
  on public.learning_path_courses for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- Înscrieri copii la trasee
create table if not exists public.path_enrollments (
  id               uuid primary key default uuid_generate_v4(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  path_id          uuid not null references public.learning_paths(id) on delete cascade,
  enrolled_at      timestamptz not null default now(),
  completed_at     timestamptz,
  unique (child_profile_id, path_id)
);

alter table public.path_enrollments enable row level security;

create policy "Parents can view enrollments for own children"
  on public.path_enrollments for select
  using (exists (
    select 1 from public.child_profiles
    where id = path_enrollments.child_profile_id
      and parent_id = auth.uid()
  ));

create policy "Parents can enroll own children"
  on public.path_enrollments for insert
  with check (exists (
    select 1 from public.child_profiles
    where id = child_profile_id
      and parent_id = auth.uid()
  ));

create policy "Parents can update enrollment for own children"
  on public.path_enrollments for update
  using (exists (
    select 1 from public.child_profiles
    where id = path_enrollments.child_profile_id
      and parent_id = auth.uid()
  ));

create policy "Parents can unenroll own children"
  on public.path_enrollments for delete
  using (exists (
    select 1 from public.child_profiles
    where id = path_enrollments.child_profile_id
      and parent_id = auth.uid()
  ));

create policy "Admins can manage all enrollments"
  on public.path_enrollments for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- Diplome trasee finalizate
create table if not exists public.path_certificates (
  id               uuid primary key default uuid_generate_v4(),
  child_profile_id uuid not null references public.child_profiles(id) on delete cascade,
  path_id          uuid not null references public.learning_paths(id) on delete cascade,
  issued_at        timestamptz not null default now(),
  unique (child_profile_id, path_id)
);

alter table public.path_certificates enable row level security;

create policy "Parents can view path certificates for own children"
  on public.path_certificates for select
  using (exists (
    select 1 from public.child_profiles
    where id = path_certificates.child_profile_id
      and parent_id = auth.uid()
  ));

create policy "Admins can manage path certificates"
  on public.path_certificates for all
  using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin'
      or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- Indecși
create index if not exists idx_learning_path_courses_path on public.learning_path_courses(path_id);
create index if not exists idx_path_enrollments_child on public.path_enrollments(child_profile_id);
create index if not exists idx_path_enrollments_path on public.path_enrollments(path_id);
create index if not exists idx_webinars_status on public.webinars(status);
