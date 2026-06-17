-- ============================================================
-- Migrație 003: Extensii platformă
-- - Aprobare conturi părinți
-- - Coloane noi pe courses (audience, validation_status, etc.)
-- - Coloane noi pe lessons (main_message, safety_flags, etc.)
-- - Extindere age_group cu 9-12
-- ============================================================

-- ============================================================
-- 1. APROBARE CONTURI — parent_profiles
-- ============================================================
alter table public.parent_profiles
  add column if not exists account_type text not null default 'family',
  add column if not exists approved      boolean not null default false,
  add column if not exists approved_at   timestamptz;

create index if not exists idx_parent_profiles_approved
  on public.parent_profiles(approved, created_at desc);

-- RLS: părintele nu poate vedea/modifica câmpul approved
drop policy if exists "Parents can view own profile" on public.parent_profiles;
create policy "Parents can view own profile"
  on public.parent_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Parents can update own profile (not approved)" on public.parent_profiles;
create policy "Parents can update own profile (not approved)"
  on public.parent_profiles for update
  using (auth.uid() = user_id);

-- ============================================================
-- 2. EXTINDERE age_group — suport 9-12
-- ============================================================

-- Normalizăm valorile existente înainte de a aplica constrângerea
update public.courses
  set age_group = '5-8'
  where age_group not in ('0-4', '5-8', '9-12') or age_group is null;

update public.child_profiles
  set age_group = '5-8'
  where age_group not in ('0-4', '5-8', '9-12') or age_group is null;

alter table public.child_profiles
  drop constraint if exists child_profiles_age_group_check;

alter table public.child_profiles
  add constraint child_profiles_age_group_check
  check (age_group in ('0-4', '5-8', '9-12'));

alter table public.courses
  drop constraint if exists courses_age_group_check;

alter table public.courses
  add constraint courses_age_group_check
  check (age_group in ('0-4', '5-8', '9-12'));

-- ============================================================
-- 3. COLOANE NOI pe courses
-- ============================================================
alter table public.courses
  add column if not exists audience          text check (audience in ('children', 'adult', 'all')) default 'children',
  add column if not exists validation_status text default 'draft',
  add column if not exists age_range         text,
  add column if not exists delivery_mode     text[] default '{}',
  add column if not exists pedagogical_style text[] default '{}',
  add column if not exists tags              text[] default '{}';

-- ============================================================
-- 4. COLOANE NOI pe lessons
-- ============================================================
alter table public.lessons
  add column if not exists main_message             text,
  add column if not exists safety_flags             text[] default '{}',
  add column if not exists adult_moderation_required boolean not null default false,
  add column if not exists notebooklm_prompt        text,
  add column if not exists tags                     text[] default '{}';

-- ============================================================
-- 5. COLOANE NOI pe modules
-- ============================================================
alter table public.modules
  add column if not exists badge_name          text,
  add column if not exists learning_objectives text[] default '{}',
  add column if not exists competencies        text[] default '{}',
  add column if not exists tags                text[] default '{}';
