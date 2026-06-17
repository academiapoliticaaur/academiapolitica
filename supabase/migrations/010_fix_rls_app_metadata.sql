-- ============================================================
-- MIGRAȚIE 010: Corectare politici RLS — user_metadata → app_metadata
-- ============================================================
-- PROBLEMA: Politicile admin foloseau auth.jwt() -> 'user_metadata' ->> 'role'
-- user_metadata este editabil de utilizatori → oricine putea seta role='admin'
-- SOLUȚIE: Înlocuit cu app_metadata care e server-only (editabil doar via service role)
-- ============================================================

-- ────────────────────────────────────────────────
-- COURSES
-- ────────────────────────────────────────────────
drop policy if exists "Admins can do everything on courses" on public.courses;

create policy "Admins can do everything on courses"
  on public.courses for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- MODULES
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage modules" on public.modules;

create policy "Admins can manage modules"
  on public.modules for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- LESSONS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage lessons" on public.lessons;

create policy "Admins can manage lessons"
  on public.lessons for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- QUIZZES
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage quizzes" on public.quizzes;

create policy "Admins can manage quizzes"
  on public.quizzes for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- QUIZ QUESTIONS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage quiz questions" on public.quiz_questions;

create policy "Admins can manage quiz questions"
  on public.quiz_questions for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- QUIZ ANSWERS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage quiz answers" on public.quiz_answers;

create policy "Admins can manage quiz answers"
  on public.quiz_answers for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- COURSE CATEGORIES (din migration 004)
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage categories" on public.course_categories;
drop policy if exists "Admins gestioneaza categoriile" on public.course_categories;

create policy "Admins gestioneaza categoriile"
  on public.course_categories for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- WEBINARS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage webinars" on public.webinars;

create policy "Admins can manage webinars"
  on public.webinars for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- LEARNING PATHS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage paths" on public.learning_paths;

create policy "Admins can manage paths"
  on public.learning_paths for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- LEARNING PATH COURSES
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage path courses" on public.learning_path_courses;

create policy "Admins can manage path courses"
  on public.learning_path_courses for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- PATH ENROLLMENTS
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage all enrollments" on public.path_enrollments;

create policy "Admins can manage all enrollments"
  on public.path_enrollments for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');

-- ────────────────────────────────────────────────
-- PATH CERTIFICATES
-- ────────────────────────────────────────────────
drop policy if exists "Admins can manage path certificates" on public.path_certificates;

create policy "Admins can manage path certificates"
  on public.path_certificates for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');
