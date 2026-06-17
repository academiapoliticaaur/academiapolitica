# Academia Politica AUR

Platformă web educațională pentru copii (clasele 0–8), administrată de părinți. Construită cu Next.js, Supabase și Tailwind CSS. Poate fi folosită ca **template de bază** pentru orice platformă de e-learning.

---

## Tech stack

| Layer | Tehnologie |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Auth + DB | Supabase (PostgreSQL + RLS + Auth) |
| Email | Resend |
| Deployment | Vercel |
| AI (opțional) | Anthropic Claude (import quiz) |

---

## Setup local

### 1. Instalează dependențele

```bash
git clone <repo-url>
cd academia-politica-aur
npm install
```

### 2. Variabile de mediu

Creează `.env.local` la rădăcina proiectului:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

RESEND_API_KEY=re_...
EMAIL_FROM=Platforma Ta <noreply@domeniu-tau.ro>
NEXT_PUBLIC_SITE_URL=https://platforma-ta.vercel.app

ADMIN_EMAIL=admin@domeniu-tau.com
ADMIN_EMAILS=admin@domeniu-tau.com

ANTHROPIC_API_KEY=sk-ant-...    # opțional — import quiz cu AI
TEST_EMAIL_SECRET=secret-ales   # testare manuală email cron
```

### 3. Baza de date Supabase

1. Creează proiect nou pe [supabase.com](https://supabase.com)
2. În **SQL Editor**, rulează în ordine:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_demo_data.sql` (opțional — date demo)
3. În **Authentication → Settings → Email**:
   - Dezactivează "Enable email confirmations" (pentru dev/MVP)

### 4. Creează contul admin

În Supabase Dashboard → **Authentication → Users** → Create user, apoi:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@domeniu-tau.com';
```

### 5. Pornește serverul

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy pe Vercel

1. Push pe GitHub
2. Importă repo în [vercel.com](https://vercel.com)
3. Adaugă toate variabilele din `.env.local` în **Settings → Environment Variables**
4. Deploy automat la fiecare push pe `main`

### Cron job email săptămânal (opțional)

Adaugă în `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }]
}
```

---

## Structura proiectului

```
app/
  (public)/     — pagini publice: home, cursuri, ajutor, contact
  (auth)/       — login, register, logout
  (dashboard)/  — dashboard părinte: copii, progres, preview lecții
  (child)/      — zona cursantului: cursuri, lecții, quiz, diplomă, PIN
  (admin)/      — admin: CRUD cursuri, statistici, MFA, utilizatori
  api/          — parse-quiz, cron email, lesson-asset proxy

components/
  admin/        — PublishButtons, DeleteButton, QuizPdfImport, ReorderButtons
  child/        — ChildProfileCard, PinEntry, DeleteChildButton
  common/       — ChatWidget (FAQ), ContactForm, AcademiaGuide, ProgressBar
  course/       — CourseCard, AgeGroupBadge, CourseSearchInput, ReplayCourseButton
  layout/       — Header, Footer
  lesson/       — QuizPlayer, VideoEmbed, PresentationViewer, LessonCompleteOverlay
  ui/           — shadcn/ui (button, card, input, label, checkbox, textarea...)

lib/
  actions/      — server actions: progres, ștergere cascade, contact
  admin/        — server actions admin (ștergere copil etc.)
  auth/         — server actions: login, register, logout
  db/           — query-uri DB: cursuri, progres
  email/        — trimitere email diplomă (Resend)
  supabase/     — client, server, admin, middleware
  badges.ts     — calcul 9 insigne din statistici
  validation/   — scheme Zod pentru formulare

docs/           — documentație proiect
supabase/
  migrations/   — 001_initial_schema.sql + 002_demo_data.sql
```

---

## Funcționalități

- **Auth** — cont părinte + profil cursant (fără email copil), PIN opțional 8h
- **Cursuri** — video (YouTube), prezentare (iframe), fișă lucru (PDF), quiz
- **Quiz** — import DOCX/PDF/TXT, gate 80%, retry nelimitat, editor în admin
- **Gamificare** — XP permanent, streak zilnic, 9 badges, diplomă printabilă
- **Admin** — CRUD complet, import quiz cu AI (Claude), statistici, MFA TOTP
- **Email** — diplomă la finalizare curs, raport săptămânal (cron)
- **Ajutor** — pagina /help FAQ acordeon + formular contact mascat
- **Chat widget** — FAQ client-side zero API, linkuri la secțiunile /help

---

## Folosire ca template pentru un proiect nou

Acest repo este arhivat ca `v1.0-template`. Pași pentru adaptare:

1. Înlocuiește brandul: nume, culori Tailwind, favicon, imagini personaje
2. Actualizează FAQ-ul din `components/common/chat-widget.tsx`
3. Actualizează conținutul din `app/(public)/help/page.tsx`
4. Modifică template-urile email din `lib/email/index.ts`
5. Aplică migrațiile SQL în proiectul Supabase nou
6. Configurează variabilele de mediu

Tot infrastructura (auth, quiz, admin, email, MFA) rămâne identică.

---

## Documentație

- [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) — descriere produs și MVP scope
- [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) — tot ce este implementat
- [docs/ARCHITECTURE_DECISIONS.md](docs/ARCHITECTURE_DECISIONS.md) — decizii tehnice
- [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md) — limitări cunoscute
- [docs/NEXT_TASKS.md](docs/NEXT_TASKS.md) — ghid adaptare pentru proiecte noi
