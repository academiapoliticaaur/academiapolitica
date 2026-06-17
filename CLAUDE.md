# Claude Code Instructions

## Project
Platformă educațională pentru copii (Ami & Moti), conturi gestionate de părinți și cadre didactice.
Detalii complete: docs/PROJECT_BRIEF.md | Stare curentă: docs/CURRENT_STATE.md

## Stack
- Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- Supabase (Auth PKCE + PostgreSQL + RLS)
- Vercel deployment target | Groq AI (curriculum import) | Resend (email)
- Google Drive (conținut lecții + OAuth2 pentru admin)

## Tipuri de conturi (account_type în parent_profiles)
- `family` — Părinte/tutore, nu necesită aprobare
- `invatator` — Învățător cls. 0–4, necesită aprobare admin
- `profesor` — Profesor gimnaziu cls. 5–8, necesită aprobare admin
- Admin: verificat prin `ADMIN_EMAILS` env var sau `user.app_metadata?.role === "admin"`

## Pattern CRITIC — Supabase client în admin
```typescript
// CORECT — admin mutations și queries (bypass RLS)
import { createAdminClient } from "@/lib/supabase/admin";
const supabase = createAdminClient(); // sync, nu await

// CORECT — user-specific queries cu RLS
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // async

// GREȘIT pentru admin — blocat de RLS
import { createClient } from "@/lib/supabase/client"; // browser client
```

## Pattern — requireAdmin() guard centralizat (Server Actions)
```typescript
import { requireAdmin } from "@/lib/admin/guard";

export async function myAdminAction(): Promise<{ error?: string } | void> {
  try {
    await requireAdmin(); // aruncă Error dacă nu admin
    const supabase = createAdminClient();
    // ... mutație
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}
```

## Pattern admin check (pentru API routes — NextResponse)
```typescript
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";
if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });
```

## Pattern — DeleteButton cu redirect
```tsx
// Când ștergerea necesită navigare (ex: stergere curs din pagina de detaliu)
<DeleteButton
  action={deleteCourse.bind(null, id)}
  confirmMessage="Ștergi cursul?"
  redirectTo="/admin/courses"   // opțional — face router.push după ștergere reușită
/>
```

## Pattern class student (auth-free zone — /clasa/*)
```typescript
// Validare fără Supabase Auth session:
const supabase = createAdminClient(); // direct, nu await
const { data: cls } = await supabase.from("classes").select("...").eq("access_code", code).single();
const { data: student } = await supabase.from("class_students").select("...").eq("student_code", studentCode).single();
// Progres salvat via POST /api/clasa/progress (nu quiz_attempts)
```

## Conținut lecții — Google Drive
```typescript
// video_url: YouTube sau Google Drive
// presentation_url: Google Drive PDF/Slides (docs.google.com/presentation sau drive.google.com/file)
// worksheet_url: Google Drive PDF
// Embed: getGoogleDriveEmbedUrl(fileId, originalUrl) din lib/utils/google-drive.ts
// Google Slides → docs.google.com/presentation/d/ID/embed
// Drive file → drive.google.com/file/d/ID/preview
```

## Routing (app router, route groups)
- `(public)` — home, courses, course detail, despre, help, cadre-didactice, clasa/*
- `(auth)` — login, register, logout
- `(dashboard)` — dashboard părinte/profesor, clase, profil
- `(child)` — zona copilului: cursuri, lecții, certificate
- `(admin)` — admin panel: cursuri/module/lecții/utilizatori/clase/settings CRUD

## Fișiere cheie — nu scana altceva dacă nu e necesar
```
lib/supabase/admin.ts          — createAdminClient() (service role)
lib/supabase/server.ts         — createClient() (SSR, cu RLS)
lib/admin/guard.ts             — requireAdmin() (guard centralizat Server Actions)
lib/admin/actions.ts           — Server Actions admin (courses, modules, lessons, users)
lib/admin/quiz-actions.ts      — Server Actions quiz (createAdminClient în interior)
lib/actions/admin-delete.ts    — deleteLesson, deleteModule, deleteCourse
lib/auth/actions.ts            — Server Actions auth (login, register, logout)
lib/db/courses.ts              — DB queries cursuri (user-facing, cu filtru audience)
lib/google-drive.ts            — OAuth2 Google Drive (getAuthUrl, getAccessToken, saveRefreshToken)
lib/utils/google-drive.ts      — isGoogleDriveUrl, getGoogleDriveEmbedUrl, getLinkLabel
lib/storage/resolve-url.ts     — isStoragePath, resolveStorageUrl (backward compat)
lib/validation/schemas.ts      — Zod schemas: loginSchema, lessonSchema, courseSchema etc.
types/index.ts                 — Domain types
types/database.ts              — Supabase generated table types
components/lesson/             — VideoEmbed, PresentationViewer, QuizPlayer, LessonCompleteOverlay
components/admin/              — DeleteButton, PublishButtons, GoogleDriveLinkField, GooglePickerButton
components/layout/             — Header, Footer
components/child/              — ChildProfileCard
app/(admin)/admin/layout.tsx   — Admin auth guard (redirect dacă nu admin)
app/(child)/child/[profileId]/layout.tsx — Child auth guard (parent session sau child_session cookie)
middleware.ts                  — Protecție rute /dashboard, /admin, /child
```

## Migrații SQL (trebuie aplicate manual în Supabase Dashboard)
- `001_initial_schema.sql` — schema + RLS
- `002_demo_data.sql` — date demo
- `003_extend_schema.sql` — aprobare conturi, audience pe cursuri
- `004_categories_webinars_paths.sql` — webinars, learning_paths
- `005_teacher_audience.sql` — constraint audience extins
- `006_classes.sql` — classes, class_students, class_courses, class_student_progress
- `007_class_certificates.sql` — class_student_certificates (diplome pentru elevi)
- `009_google_drive.sql` — drive_folder_id pe courses/modules/lessons + tabel admin_settings ⚠️ PENDING

## Variabile de mediu necesare
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SITE_URL
RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL, ADMIN_EMAILS
GROQ_API_KEY
CRON_SECRET                                           # ⚠️ OBLIGATORIU — protejează /api/cron/weekly-report
GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET   # server-only
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY                      # client-safe, pentru Google Picker
```

## Workflow rules
- Nu scana întreg repository-ul fără motiv — folosește fișierele cheie de mai sus.
- Nu refactoriza fișiere fără legătură cu task-ul curent.
- Explică planul înainte de modificări majore.
- **La orice mutație admin**: verifică că folosești `createAdminClient()`, nu `createClient()`.
- **Server Actions admin**: apelează `await requireAdmin()` ca primă instrucțiune, în try/catch.
- **Server Actions**: `"use server"` la topul fișierului, validare user înainte de orice mutație.
- **Params Next.js 16**: `const { id } = await params;` — mereu await params.
- **Ștergere cu navigare**: pasează `redirectTo` la DeleteButton când pagina curentă devine invalidă după ștergere.
- **audience pe cursuri**: children | invatator | profesor | all — filtrează corect în lib/db/courses.ts
- După task: actualizează docs/CURRENT_STATE.md și docs/NEXT_TASKS.md.
- **Sesiuni Claude Code**: pornește o conversație nouă pentru fiecare sarcină majoră/nouă, în loc să continui una foarte lungă — sesiunile lungi ating limita de context (1M tokens la Sonnet 4.6) și declanșează rezumare automată ("compactare"), care poate părea un blocaj. Comenzi utile: `/context` (cât din memoria sesiunii e ocupată), `/clear` (golește conversația la schimbarea sarcinii).

## Validare
- `npm run build` — mandatory după modificări majore (TypeScript strict)
- `npm run lint` — fix blockers only
- No test suite yet

## Docs de referință
- docs/PROJECT_BRIEF.md — product summary
- docs/CURRENT_STATE.md — ce e implementat + rute + features
- docs/ARCHITECTURE_DECISIONS.md — decizii tehnice (ADR-001 → ADR-014)
- docs/NEXT_TASKS.md — backlog
- docs/KNOWN_ISSUES.md — probleme cunoscute + technical debt
