-- Migration 007: Diplome pentru elevii din clase

create table if not exists public.class_student_certificates (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.class_students(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  course_title    text not null,
  student_name    text not null,
  lessons_completed text[] not null default '{}',
  total_points    int not null default 0,
  issued_at       timestamptz not null default now(),
  unique (student_id, course_id)
);

create index if not exists idx_class_certs_student_id
  on public.class_student_certificates(student_id);

alter table public.class_student_certificates enable row level security;

-- Service role only (accesat exclusiv prin createAdminClient în server routes)
create policy "Service role manages class certificates"
  on public.class_student_certificates for all
  using (true)
  with check (true);
