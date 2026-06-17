# Schema Arhitecturală — Academia Politica AUR Educational Platform
> MVP v1.0 | Bază pentru proiectul AILiteracy
> Ultima actualizare: 2026-05-22

---

## 1. Vedere de ansamblu

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / BROWSER                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                        VERCEL (Edge)                             │
│  ┌─────────────────┐   ┌──────────────────────────────────────┐ │
│  │   Middleware    │   │         Next.js 16 App Router         │ │
│  │  (auth guard)   │   │                                      │ │
│  │  /dashboard     │   │  Server Components (default)         │ │
│  │  /admin         │   │  Client Components ("use client")    │ │
│  │  /child         │   │  Server Actions ("use server")       │ │
│  └────────┬────────┘   │  API Routes (/api/*)                 │ │
│           │             └──────────────┬───────────────────────┘ │
└───────────┼──────────────────────────┼──────────────────────────┘
            │                          │
            ▼                          ▼
┌───────────────────────┐   ┌─────────────────────────────────────┐
│     SUPABASE          │   │         SERVICII EXTERNE            │
│                       │   │                                     │
│  ┌─────────────────┐  │   │  ┌──────────┐  ┌────────────────┐  │
│  │  PostgreSQL DB  │  │   │  │  Resend  │  │  Groq AI       │  │
│  │  (toate datele) │  │   │  │  (email) │  │  (llama3-70b)  │  │
│  └─────────────────┘  │   │  └──────────┘  └────────────────┘  │
│  ┌─────────────────┐  │   │                                     │
│  │  Auth (PKCE)    │  │   │  ┌──────────────────────────────┐  │
│  │  (utilizatori)  │  │   │  │  Google Drive API (OAuth2)   │  │
│  └─────────────────┘  │   │  │  (conținut lecții + Picker)  │  │
│  ┌─────────────────┐  │   │  └──────────────────────────────┘  │
│  │  RLS Policies   │  │   │                                     │
│  │  (securitate)   │  │   │  ┌──────────────────────────────┐  │
│  └─────────────────┘  │   │  │  Anthropic SDK (opțional)    │  │
└───────────────────────┘   │  │  (fallback import quiz)      │  │
                            │  └──────────────────────────────┘  │
                            └─────────────────────────────────────┘
```

---

## 2. Stack tehnologic

| Strat | Tehnologie | Versiune | Rol |
|---|---|---|---|
| Framework | Next.js | 16.2.4 | App Router, SSR, Server Actions, API Routes |
| UI Language | React | 19.2.4 | Componente, state management |
| Language | TypeScript | 5.x | Type safety strict |
| Styling | Tailwind CSS | v4 | Utility-first CSS |
| UI Components | shadcn/ui + Base UI | latest | Componente accesibile |
| Icons | Lucide React | 1.14.0 | Icon set |
| Database | Supabase PostgreSQL | — | Stocare date, RLS |
| Auth | Supabase Auth | PKCE | Autentificare fără server separat |
| ORM | Supabase JS Client | 2.x | Query builder tip-safe |
| Email | Resend | 6.x | Email tranzacțional + diplome |
| AI (curricula) | Groq (llama-3.3-70b) | — | Import structură curriculum |
| AI (quiz) | Groq + Anthropic SDK | — | Parsare quiz din documente |
| Forms | React Hook Form + Zod | 7.x / 4.x | Validare formulare |
| Deployment | Vercel | — | Hosting, auto-deploy din GitHub |
| CDN/Media | Google Drive | — | Video, prezentări, fișe de lucru |

---

## 3. Structura aplicației (Route Groups)

```
app/
├── (public)/              # Fără auth guard
│   ├── page.tsx           # Home page
│   ├── courses/           # Catalog cursuri + detaliu curs
│   ├── cadre-didactice/   # Resurse pentru profesori/învățători
│   ├── despre/            # Pagina "Despre platformă"
│   ├── help/              # Centru de ajutor + FAQ
│   ├── paths/             # Trasee de instruire
│   ├── webinars/          # Webinarii
│   └── clasa/             # Acces elevi fără cont (cod grup)
│
├── (auth)/                # Pagini autentificare
│   ├── login/
│   ├── register/
│   └── auth/callback/     # PKCE exchange
│
├── (dashboard)/           # Guard: user autentificat
│   ├── dashboard/         # Profiluri cursanți, XP
│   ├── dashboard/grupuri/ # Gestionare clase (profesori)
│   └── dashboard/profile/ # Setări cont
│
├── (child)/               # Guard: parent session SAU child_session cookie
│   └── child/[profileId]/ # Zona cursantului: cursuri, lecții, certificate
│
└── (admin)/               # Guard: ADMIN_EMAILS + MFA TOTP
    └── admin/             # Panel complet admin
        ├── courses/       # CRUD cursuri cu filtre/sortare
        ├── parents/       # Gestionare conturi family
        ├── teachers/      # Gestionare conturi formator/profesor
        ├── classes/       # Vizualizare clase
        ├── approvals/     # Aprobare formatori
        ├── curriculum-import/ # Import AI
        ├── settings/      # Setări platformă (Google Drive)
        └── ...
```

---

## 4. Layere de securitate

```
Request HTTP
     │
     ▼
┌────────────────────────────────────────────┐
│ 1. MIDDLEWARE (middleware.ts)               │
│    Verifică sesiunea Supabase              │
│    Redirect /dashboard, /admin, /child     │
│    dacă nu există sesiune validă           │
└────────────────────────┬───────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────┐
│ 2. LAYOUT GUARD (layout.tsx per grup)      │
│    (admin) → verifică ADMIN_EMAILS + MFA   │
│    (child) → verifică parent SAU cookie    │
│    (dashboard) → verifică sesiune user     │
└────────────────────────┬───────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────┐
│ 3. SERVER ACTION GUARD (requireAdmin)      │
│    lib/admin/guard.ts                      │
│    Fiecare mutație admin verifică explicit │
│    identitatea înainte de execuție         │
└────────────────────────┬───────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────┐
│ 4. SUPABASE RLS (Row Level Security)       │
│    Politici per tabel, per user_id         │
│    createAdminClient() → bypass RLS        │
│    createClient() → cu RLS                 │
└────────────────────────────────────────────┘
```

### Tipuri de clienți Supabase

```typescript
// SERVER-ONLY — bypass RLS (service_role key)
// Folosit EXCLUSIV în Server Actions admin și API routes admin
import { createAdminClient } from "@/lib/supabase/admin";
const supabase = createAdminClient(); // SYNC, nu await

// SERVER — cu RLS (anon/user key)
// Folosit în Server Components și API routes user-facing
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // ASYNC

// CLIENT — cu RLS (anon key)
// Folosit în Client Components pentru auth state
import { createClient } from "@/lib/supabase/client";
```

---

## 5. Schema bazei de date

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   auth.users    │────▶│  parent_profiles │────▶│  child_profiles │
│  (Supabase)     │ 1:1 │  user_id (FK)    │ 1:N │  parent_id (FK) │
│  email, pass    │     │  full_name        │     │  display_name   │
│  app_metadata   │     │  account_type     │     │  age_group      │
│                 │     │  approved         │     │  pin_hash       │
└─────────────────┘     │  approved_at      │     └────────┬────────┘
                        └──────────────────┘              │
                                                          │ 1:N
                        ┌─────────────────────────────────▼────────┐
                        │                  progress                 │
                        │  child_profile_id, course_id, lesson_id  │
                        │  status, completed_at, quiz_score         │
                        └───────────────────────────────────────────┘

┌──────────────┐  1:N  ┌───────────────┐  1:N  ┌──────────────────┐
│   courses    │──────▶│    modules    │──────▶│     lessons      │
│  title, slug │       │  title        │       │  title           │
│  age_group   │       │  description  │       │  lesson_type     │
│  audience    │       │  order_index  │       │  video_url       │
│  status      │       │  badge_name   │       │  presentation_url│
│  order_index │       └───────────────┘       │  worksheet_url   │
│  drive_folder│                               │  content (quiz)  │
└──────┬───────┘                               │  order_index     │
       │                                       │  drive_folder_id │
       │ 1:N                                   └──────────────────┘
┌──────▼───────────────────┐
│      certificates        │
│  child_profile_id (FK)   │
│  course_id (FK) ← no CASCADE!
│  total_points            │
│  issued_at               │
└──────────────────────────┘

┌──────────────┐  1:N  ┌────────────────┐  N:M  ┌──────────────────────┐
│   classes    │──────▶│ class_students │       │    class_courses     │
│  name, grade │       │  display_name  │       │  class_id, course_id │
│  access_code │       │  student_code  │       └──────────────────────┘
│  teacher_id  │       │  age_group     │
│  status      │       └───────┬────────┘
└──────────────┘               │ 1:N
                        ┌──────▼──────────────────────┐
                        │   class_student_progress     │
                        │   class_student_certificates │
                        └─────────────────────────────┘

┌──────────────────────────────────────┐
│           admin_settings             │
│  key (PK)  │  value  │  updated_at  │
│  google_drive_refresh_token          │
│  google_drive_root_folder_id         │
└──────────────────────────────────────┘

┌──────────────────┐   ┌──────────────────────────────┐
│  learning_paths  │   │  webinars                    │
│  title, slug     │   │  title, description          │
│  description     │   │  url, date, status           │
└────────┬─────────┘   └──────────────────────────────┘
         │ N:M
┌────────▼──────────────────┐
│  learning_path_courses    │
│  path_id, course_id       │
│  order_index              │
└───────────────────────────┘
```

### Migrații aplicate (în ordine)
| Fișier | Conținut |
|---|---|
| `001_initial_schema.sql` | Schema completă + RLS policies |
| `002_demo_data.sql` | Date demo (2 cursuri) |
| `003_extend_schema.sql` | Aprobare conturi, audience pe cursuri |
| `004_webinars_paths.sql` | Tabele webinars, learning_paths |
| `005_teacher_audience.sql` | Constraint audience extins |
| `006_classes.sql` | Sistem clase (4 tabele + RLS) |
| `007_class_certificates.sql` | Diplome membri din grupuri |
| `009_google_drive.sql` | drive_folder_id + admin_settings |

---

## 6. Fluxuri de autentificare

### 6.1 Flux Părinte (family)
```
/register → selectează "Parinte/Tutore" → Supabase signup
→ email confirmare → /auth/callback → PKCE exchange
→ ensureParentProfile() → /dashboard
```

### 6.2 Flux Cadru Didactic (formator/profesor)
```
/register → selectează tip → Supabase signup
→ email confirmare → /auth/callback
→ ensureParentProfile(account_type=formator|profesor)
→ /dashboard cu banner "Cont în așteptare"
                         │
Admin → /admin/approvals → aprobă → approved=true
                         │
→ Cadrul didactic se reconectează → acces /formatori
```

### 6.3 Flux Copil (fără cont)
```
Parent → /dashboard → click profil cursant
→ dacă PIN activ → /cursant/[profileId]/pin → validare PIN
→ /cursant/[profileId] (child_session cookie setat)
```

### 6.4 Flux Elev din Clasă (auth-free)
```
/clasa → introduce cod grup → /grup/[code]
→ selectează numele → /grup/[code]/[studentCode]
→ cursurile clasei (createAdminClient, fără Supabase Auth)
→ progres salvat în class_student_progress
```

### 6.5 Flux Admin cu MFA
```
/login → autentificare email + parolă
→ detectare admin → /admin/mfa-verify → cod TOTP (Google Authenticator)
→ /admin (dashboard)
```

---

## 7. Fluxul conținutului lecțiilor

```
AUTHORING (admin)
      │
      ▼
Google Drive (Slides, PDF, Video)
      │
      │  URL sau Google Picker
      ▼
Lesson Editor (/admin/courses/.../lessons/...)
      │
      │  Salvat în DB: video_url, presentation_url, worksheet_url
      ▼
Player lecție (/cursant/[profileId]/course/.../lesson/...)
      │
      ├── video_url → <VideoEmbed> → YouTube iframe SAU Google Drive preview
      ├── presentation_url → <PresentationViewer> → Google Slides embed / Drive PDF
      ├── worksheet_url → <WorksheetViewer> → Drive PDF iframe + download button
      └── content (JSON) → <QuizPlayer> → întrebări interactive → gate 80%
```

---

## 8. Fluxul import curriculum AI

```
Admin → /admin/curriculum-import
      │
      │  Upload DOCX sau PDF
      ▼
/api/admin/parse-curriculum (POST)
      │
      ├── mammoth (DOCX) sau pdf-parse (PDF) → text brut
      │
      ├── Groq llama-3.3-70b-versatile
      │   response_format: json_object → structură JSON
      │   fallback: llama-3.1-8b-instant (rate limit)
      │
      └── JSON → ParsedCurriculum {course, modules[], lessons[]}
                │
                ▼
      /api/admin/import-curriculum (POST)
                │
                ├── Duplicate detection (ilike pe titlu)
                └── INSERT curs + module + lecții (draft, ai_generated=true)
```

---

## 9. Integrare Google Drive

```
SETUP (o singură dată)
Admin → /admin/settings/google-drive → "Conectează"
→ /api/admin/drive/auth → redirect Google OAuth2
→ Google consent screen → /api/admin/drive/callback
→ exchangeCodeForTokens → saveRefreshToken(admin_settings DB)

UTILIZARE (la fiecare sesiune de editare)
Lesson Editor → <GooglePickerButton>
→ GET /api/admin/drive/token (admin check)
→ getAccessToken() → refresh_token din DB → Google OAuth2
→ access_token → Google Picker API (client-side)
→ utilizatorul selectează fișier → URL returnat în câmpul lecției
```

---

## 10. Patterns critice de cod

### Server Action admin (pattern standard)
```typescript
"use server";
import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function myAdminAction(id: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();                    // 1. Verifică admin
    const supabase = createAdminClient();    // 2. Client fără RLS
    const { error } = await supabase        // 3. Mutație
      .from("table").update({...}).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/...");            // 4. Invalidează cache
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}
```

### Audience pe cursuri
```
audience = "children"  → apare DOAR pe /courses (pentru elevi)
audience = "formator" → apare DOAR pe /formatori (formatori aprobati)
audience = "lector"  → apare DOAR pe /formatori (profesori aprobati)
audience = "all"       → apare pe /courses (tratată ca "children")
```

### DeleteButton cu redirect
```tsx
// Când ștergerea face pagina curentă invalidă
<DeleteButton
  action={deleteCourse.bind(null, id)}
  confirmMessage="Ștergi cursul?"
  redirectTo="/admin/courses"   // router.push() după succes
/>
```

---

## 11. Variabile de mediu

| Variabilă | Tip | Utilizare |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | Client Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Client Supabase (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | secret | Admin client (bypass RLS) |
| `NEXT_PUBLIC_APP_URL` | public | URL aplicație |
| `NEXT_PUBLIC_SITE_URL` | public | URL site (auth redirects) |
| `ADMIN_EMAIL` | secret | Email admin (contact form) |
| `ADMIN_EMAILS` | secret | Lista emailuri admin (CSV) |
| `RESEND_API_KEY` | secret | Email tranzacțional |
| `EMAIL_FROM` | secret | Adresă expeditor email |
| `GROQ_API_KEY` | secret | Import curriculum AI |
| `ANTHROPIC_API_KEY` | secret | Fallback quiz parsing |
| `TEST_EMAIL_SECRET` | secret | Testare cron email manual |
| `GOOGLE_DRIVE_CLIENT_ID` | secret | OAuth2 Google Drive |
| `GOOGLE_DRIVE_CLIENT_SECRET` | secret | OAuth2 Google Drive |
| `NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY` | public | Google Picker API |

---

## 12. Deployment și CI/CD

```
Developer → git push main
                │
                ▼
         GitHub (repository)
                │
                │  webhook automat
                ▼
         Vercel Build
         ├── npm install
         ├── next build (TypeScript check + bundle)
         └── deploy pe edge network Vercel
                │
                ▼
    https://academia-aur.ro
    (custom domain, HTTPS automat)
```

**Cron jobs Vercel:**
- `GET /api/cron/weekly-report` — luni 08:00 UTC → email progres copii

**Git hooks locale:**
- `pre-push` → șterge `.next/dev/cache` (Turbopack cache, poate depăși 800MB)
