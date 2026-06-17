# Current State — 2026-06-15 (update 11)

## Stack
- Next.js 16, React 19, TypeScript 5
- Tailwind CSS v4, shadcn/ui components
- Supabase SSR (Auth PKCE + PostgreSQL + RLS)
- Groq (import curriculum AI — llama3-70b)
- Resend (email tranzacțional)
- Vercel (deployment, auto-deploy din GitHub main)

## Deployment
- **URL producție:** https://academia-aur.ro (custom domain)
- **Platform:** Vercel, conectat la GitHub (branch main)
- **Auto-deploy:** orice push pe main declanșează deploy nou

## Tipuri de cont (account_type în parent_profiles)
| Valoare | Descriere | Aprobare necesară |
|---|---|---|
| `family` | Părinte/tutore cu copii | Nu |
| `formator` | Formator cls. 0–4 | Da (admin) |
| `profesor` | Profesor gimnaziu cls. 5–8 | Da (admin) |

## Rute implementate (app router)

### (public)
- `/` — pagina principală: hero, features (cu linkuri ?type=video/presentation/worksheet/quiz), secțiune Cursuri demonstrative (vizibilă tuturor), 4 carduri grupe
- `/courses` — listing cursuri + secțiune Cursuri demonstrative la top; ?type=video/presentation/worksheet/quiz → pagini descriptive dedicate (fără grilă)
- `/courses/[slug]` — detaliu curs; lecții demo au link "Demo gratuit →" în loc de lacăt pentru utilizatori neautentificați
- `/courses?type=video|presentation|worksheet|quiz` — pagini descriptive pentru fiecare tip de conținut (fără filtre sau grilă de cursuri)
- `/formatori` — pagina publică cu cursuri pentru Formatori și Profesori de gimnaziu; acces filtrat per rol și aprobat
- `/despre` — pagina "Despre platformă"
- `/paths` — trasee de instruire publice
- `/paths/[slug]` — detaliu traseu cu cursuri incluse
- `/webinars` — lista webinarii publice
- `/help` — centru de ajutor cu 7 secțiuni acordeon (Părinți, Formatori, Copii, Cursuri, **Abonamente**, Tehnic, Membri din grupuri) + formular contact + CTA "Prețuri & Abonamente" → /preturi
- `/preturi` — pagina prețuri: 3 planuri (Lunar 29 lei, Trimestrial 72 lei, Anual 228 lei), secțiune trial, FAQ 4 întrebări, AcademiaGuide ami

### (auth)
- `/login` — autentificare email + parolă
- `/register` — înregistrare cont cu selectare tip (family / formator / profesor)
- `/auth/callback` — PKCE flow: exchangeCodeForSession + ensureParentProfile
- `/logout` — POST route handler

### (dashboard)
- `/dashboard` — lista profiluri cursanți, XP total, banner aprobare pentru formatori neaprobate
- `/dashboard/profil` — adaugă profil cursant
- `/dashboard/edit-cursant/[profileId]` — editare profil + PIN management
- `/dashboard/progress/[childId]` — progres detaliat per copil
- `/dashboard/profile` — editare cont părinte (nume, parolă)
- `/dashboard/preview/[courseId]/lesson/[lessonId]` — previzualizare lecție fără XP/progres
- `/dashboard/grupuri` — lista claselor active/arhivate (profesor)
- `/dashboard/grupuri/new` — creare clasă nouă (cod acces unic 4-12 car.)
- `/dashboard/grupuri/[id]` — detaliu clasă: tab Membri (adaugă/editează/șterge, PIN per elev, regenerare PIN) + tab Cursuri (asignează/elimină/reordonează Sus↑↓Jos) + tab Progres (tabel per elev × curs, sumar clasă, export CSV)

### (child)
- `/cursant/[profileId]` — zona cursantului: XP, streak, curs activ, badges
- `/cursant/[profileId]/course/[courseId]` — curs cu module/lecții; lecții blocate pentru cadre neaprobate
- `/cursant/[profileId]/course/[courseId]/lesson/[lessonId]` — player lecție (layout.tsx blochează dacă cont neaprobat)
- `/cursant/[profileId]/pin` — ecran PIN cu validare + expirare 8h
- `/cursant/[profileId]/transcript` — transcript cursuri și progres
- `/cursant/[profileId]/certificate/[certificateId]` — diplomă printabilă

### (admin)
- `/admin` — dashboard statistici + linkuri rapide
- `/admin/stats` — statistici detaliate
- `/admin/courses` — lista cursuri (createAdminClient — vede și draft)
- `/admin/courses/new` — creare curs nou (include câmp audience)
- `/admin/courses/[id]` — detalii curs + module/lecții CRUD + buton Șterge curs (cu redirect)
- `/admin/courses/[id]/edit` — editare metadate curs + toggle is_demo (Demo public / Necesită cont) + buton Șterge
- `/admin/courses/[id]/modules/[moduleId]` — editare modul
- `/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]` — editare lecție (Google Drive fields)
- `/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]/quiz` — editor quiz cu import AI
- `/admin/parents` — lista părinți + aprobare inline (buton Aprobă direct în tabel)
- `/admin/parents/add` — adaugă utilizator manual
- `/admin/parents/[userId]/edit` — editare cont + schimbare tip cont (family/formator/profesor)
- `/admin/teachers` — lista conturi formator/profesor (redesigned ca pagina Parents)
- `/admin/teachers/[userId]/edit` — editare cont profesor (full_name, email, account_type)
- `/admin/approvals` — conturi formatori în așteptare
- `/admin/children` — lista profiluri cursanți
- `/admin/administrators` — lista admini
- `/admin/paths` — CRUD trasee de instruire
- `/admin/paths/[id]` — detalii traseu + gestionare cursuri incluse
- `/admin/webinars` — CRUD webinarii
- `/admin/webinars/[id]/edit` — editare webinar
- `/admin/curriculum-import` — import curriculum AI din DOCX/PDF cu Groq
- `/admin/mfa-setup` — activare TOTP 2FA
- `/admin/mfa-verify` — verificare cod TOTP la login
- `/admin/settings/google-drive` — configurare integrare Google Drive (conectare OAuth2)

### (public) — cursuri demonstrative
- `/demo/[courseSlug]/lesson/[lessonId]` — viewer lecție public, fără autentificare; accesibil pentru cursuri cu `is_demo=true`; include VideoEmbed/PresentationViewer, nav prev/next, cuprins, CTA register

### (public) — acces membri din grupuri
- `/grup` — landing page: elev introduce codul clasei
- `/grup/[code]` — lista elevilor din clasă (selectare)
- `/grup/[code]/[studentCode]` — zona elevului: cursuri asignate clasei
- `/instaleaza` — ghid instalare PWA: Android (Chrome), iOS (Safari), desktop; beneficii, pași numerotați

### API routes
- `GET /api/grup/verify?code=X` — validează dacă codul de clasă există și e activ
- `POST /api/admin/parse-quiz` — parsare quiz din DOCX/PDF/TXT (regex + fallback Groq)
- `POST /api/admin/parse-curriculum` — extragere structură curriculum din PDF cu Groq (DOMMatrix polyfill)
- `POST /api/admin/import-curriculum` — inserare curs generat AI în DB (duplicate detection)
- `GET /api/admin/drive/auth` — inițiază Google OAuth2 flow (redirect la Google)
- `GET /api/admin/drive/callback` — finalizează OAuth2, salvează refresh_token în admin_settings
- `GET /api/admin/drive/token` — returnează access_token proaspăt pentru Google Picker (client-side)
- `POST /api/grup/progress` — înregistrează completare lecție elev în class_student_progress; upsert + creare certificat la final curs
- `POST /api/grup/verify-pin` — verifică PIN-ul unui elev din clasă (rate-limitat implicit prin Supabase)
- `GET /api/dashboard/grupuri/[id]/progress-csv` — export CSV progres clasă (verificare ownership teacher_id, format wide cu BOM UTF-8)
- `GET /api/cron/weekly-report` — raport săptămânal email (Resend, cron Vercel luni 08:00)
- `GET /api/lesson-asset` — proxy fișiere storage Supabase

## Features implementate

### Autentificare și conturi
- Login/register cu Supabase Auth PKCE (email + parolă)
- Selectare tip cont la înregistrare: family / formator / profesor
- Auth callback PKCE: detectează `?code=` param, apelează `exchangeCodeForSession()`
- Middleware protejează /dashboard, /admin, /child
- MFA TOTP obligatoriu pentru admin (Google Authenticator / Authy)
- PIN 4 cifre opțional pe profil cursant, expiră 8h (sessionStorage)
- RLS policies pe toate tabelele
- Guard `requireAdmin()` în `lib/admin/guard.ts` — verificare centralizată în Server Actions
- **Reset parolă** — /auth/forgot-password + /auth/reset-password (PKCE flow: resetPasswordForEmail → exchangeCodeForSession → updateUser)
- **Cookie consent banner** GDPR — localStorage, dismiss persistent, în root layout

### Formatori
- Conturi `formator` și `profesor` înregistrate cu self-service la /register
- Aprobare manuală de admin (`parent_profiles.approved`)
- Bannere: "Cont în așteptare" pe dashboard și pe pagina cursului
- Lecții blocate (layout.tsx server-side) până la aprobare
- Browsing liber: titluri cursuri vizibile, conținut lecție blocat
- Pagina publică /formatori: formator vede DOAR cursuri formator, profesor vede DOAR cursuri profesor (+ isApproved verificat)
- Pagina /courses: profesorii văd doar cursuri pentru copii, filtrate automat pe grupa de vârstă; butoanele de filtru ascunse
- Admin: /admin/approvals + aprobare inline din /admin/parents + /admin/teachers
- Admin: editare cont profesor (full_name, email, account_type formator↔profesor)
- Admin: editare cont parinte include schimbare tip cont (family→formator/profesor și înapoi)

### Sistem clase (complet)
- Profesorul creează clase cu cod de acces ales (unic global, 4-12 car. alfanumerice)
- Adaugă elevi în clasă (display_name + cod unic în clasă + grupă vârstă)
- Asignează cursuri publice la clasă (selectare din lista întreagă de cursuri publicate)
- Reordonare cursuri asignate cu butoane Sus/Jos (swap order_index în class_courses)
- Arhivare clasă (status → archived)
- **PIN per elev:** generat automat la creare, vizibil în dashboard profesor, regenerare oricând; elevi cu PIN văd modal 4 cifre la selectare (sessionStorage pentru UX fluid)
- **Progres înregistrat:** la completarea lecției în zona elevului → POST /api/grup/progress → upsert class_student_progress; la finalizare curs → creare class_student_certificates
- **Tab Progres:** tabel per elev × curs (lecții completate, bară progres, ✓ Complet), sumar clasă (%, elevi activi, inactivi), ultima activitate relativă
- **Export CSV progres:** buton în tab Progres → GET /api/dashboard/grupuri/[id]/progress-csv; format wide, BOM UTF-8 (compatibil Excel românesc)
- Elevi accesează /clasa → cod grup → selectează numele (+ PIN dacă setat) → zona personală cu cursuri
- Sidebar dashboard profesor: "Grupurile mele" + "Cursurile mele" în loc de "Cursuri disponibile"
- Navigație header: buton "Intră în grup" verde vizibil pentru toți (desktop + mobil)
- Tabele: classes, class_students, class_courses, class_student_progress (migration 006)
- `account_type` fallback: dacă null în DB → citit din user.user_metadata (fix fără re-login)
- Diplome membri din grupuri (class_student_certificates — migration 007)

### Cursuri și lecții
- `audience` pe cursuri: `children | formator | profesor | all`
- `age_group` pe cursuri: `0-4 | 5-8`
- 5 tipuri lecție: video, presentation, worksheet, quiz, mixed
- Quiz gate 80% pentru finalizare lecție
- Import quiz din DOCX/PDF/TXT (regex + fallback Groq/Claude)
- Previzualizare lecții pentru părinți (fără XP/progres)
- Reia cursul: reset progres, XP din certificate rămâne permanent
- Conținut lecții: video (YouTube sau Google Drive), prezentare (Google Drive), fișă de lucru (Google Drive)

### Soft delete + Coș de gunoi (WP18 — COMPLET 2026-06-07)
- Migration 011: `deleted_at TIMESTAMPTZ` pe `courses`, `modules`, `lessons` + indexuri parțiale
- Ștergere → soft delete (setare `deleted_at = now()`) — elementul dispare din interfață dar rămâne în DB
- La ștergerea unui modul: toate lecțiile sale primesc și ele `deleted_at`
- `DeleteButton`: dialog AlertDialog shadcn/ui în loc de `window.confirm()` — modal propriu cu buton roșu
- Restore: `restoreLesson/Module/Course` — anulează `deleted_at`; la restaurarea unui modul, lecțiile sunt restaurate automat
- Permanent delete: `permanentDeleteLesson/Module/Course` — DELETE real, cu dialog secundar de confirmare
- `/admin/trash` — pagina Coș de gunoi: cursuri / module / lecții șterse, afișate cu timpul scurs + butoane Restaurare / Permanent
- Link "Coș de gunoi" în sidebar admin și nav mobile
- `types/index.ts`: `deleted_at?: string | null` adăugat pe `Course`, `Module`, `Lesson`
- Migration 011 aplicată în Supabase Dashboard ✓

### Abonamente (WP17 — COMPLET 2026-06-07, update 2026-06-15)
- Câmpuri `subscription_plan`, `subscription_expires_at`, `subscription_activated_by` pe `parent_profiles` (migration 010)
- Planuri: `monthly` (30 zile), `quarterly` (90 zile), `annual` (365 zile)
- Admin activează/dezactivează subscripția din `/admin/parents/[userId]/edit` și `/admin/teachers/[userId]/edit`
- `lib/subscription.ts`: `isSubscriptionActive`, `subscriptionExpiresIn`, `formatSubscriptionExpiry`, `PLAN_LABELS` (include prețuri)
- **Gate lecții copii:** `layout.tsx` blochează accesul dacă contul parent nu are subscripție activă (după verificarea de aprobare)
- **Gate lecții membri din grupuri:** pagina lecției verifică subscripția profesorului — elevi moștenesc accesul cadrului didactic
- **Pagina de curs copil:** banner indigo "Abonament necesar" + pictograme lacăt indigo pe lecții (vs amber pentru cont neaprobat)
- **Oprire self-service:** buton "Oprește abonamentul" în bannerul "Abonament activ" din dashboard; confirmare inline, dezactivare imediată, email notificare admin (`lib/actions/subscription.ts` + `components/dashboard/cancel-subscription-button.tsx`)
- Acces admin: bypass complet (ADMIN_EMAILS)
- `SubscriptionPanel` — componentă admin reutilizabilă: status badge (activ/expirat/inactiv), formular activare cu dropdown plan, buton dezactivare

### Google Drive Integration (COMPLET — 2026-06-07)
- OAuth2 flow: admin se autentifică o singură dată → refresh_token salvat în `admin_settings` DB
- `lib/google-drive.ts`: getAuthUrl, exchangeCodeForTokens, getAccessToken, saveRefreshToken, isDriveConnected
- Google Picker: component client-side `GooglePickerButton` deschide Google Picker în browser
- `GoogleDriveLinkField`: câmp hibrid URL manual + buton Picker
- Câmpuri `drive_folder_id` pe courses/modules/lessons (organizare automată activă)
- Tabel `admin_settings` (key-value) pentru setări platformă (Google refresh_token, root folder ID)
- Migration 009 aplicată în Supabase Dashboard ✓
- `NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY` adăugat în Vercel ✓
- Google Drive conectat din /admin/settings/google-drive ✓

### Gamificare
- XP: 10/lecție, 50/modul, 100/curs
- XP permanent (din certificates.total_points)
- Daily streak + badges (9 insigne)
- Diplomă printabilă + email la părinte

### Trasee de instruire (Learning Paths)
- Admin CRUD trasee cu cursuri ordonate
- Pagină publică /paths cu listare și detalii
- Enrollment la traseu

### Webinarii + Calendar (WP23 — COMPLET 2026-06-15)
- Admin CRUD webinarii (titlu, descriere, YouTube ID, prezentator, audiență, status)
- **Câmpuri noi (migration 016):** `scheduled_at TIMESTAMPTZ` + `registration_url TEXT`
- Admin forms (new + edit): câmpuri dată/oră (`datetime-local`) + link înregistrare extern; `youtube_id` acum opțional
- **Pagina publică /webinars** — două secțiuni:
  - "Webinarii viitoare": card cu badge dată (zi/lună/an, ora), badge AZI/MÂINE, buton "Înregistrează-te gratuit" → link extern
  - "Înregistrări anterioare": grid video YouTube (neschimbat)
- Migration 016 ✓ APLICAT

### Import curriculum AI
- Upload DOCX/PDF în admin
- Extragere structură cu Groq (llama3-70b)
- Duplicate detection (ilike pe titlu)
- Creare curs draft automat
- DOMMatrix polyfill pentru pdf-parse în Node.js

### Admin general
- Toate operațiile DB admin folosesc `createAdminClient()` (bypass RLS)
- CRUD complet cursuri / module / lecții
- Publicare/retragere cursuri și webinarii
- Statistici platformă
- DeleteButton cu confirmare + alert eroare + redirect opțional (redirectTo prop)

### Email (Resend)
- Email diplomă la finalizare curs
- Raport săptămânal progres copii (cron luni 08:00 UTC)
- Formular contact → livrat la ADMIN_EMAIL
- Notificare admin la înregistrare cont nou formator (`notifyAdminNewTeacher`)
- Email aprobare cont formator (trimis din `approveUser()` Server Action)
- **Email bun venit la confirmare email** (`sendWelcomeEmail`) — trimis din auth/callback doar la primul cont (isNew flag); include notă specială pentru formatori care așteaptă aprobare
- **Email notificare anulare abonament** — trimis adminului când utilizatorul folosește butonul "Oprește abonamentul"

### SEO
- `app/robots.ts` — disallow /admin, /dashboard, /child, /clasa, /api; allow tot restul; sitemap.xml inclus
- `app/sitemap.ts` — rute statice + cursuri publicate din DB; fix `changeFrequency as const` pentru tipuri stricte
- OpenGraph metadata în `app/layout.tsx` — url, og:image (/og-image.png, 1200×630)

### Import CSV elevi (WP20 — COMPLET 2026-06-15)
- `POST /api/dashboard/grupuri/[id]/import-students` — parser CSV propriu, detecție automată header, max 100 elevi/import
- Generare cod elev unic + PIN hashed identic cu adăugarea individuală
- `ImportStudentsButton` — client component: upload CSV/TXT, link "Descarcă template", rezultate cu PINuri în clar (o singură dată), `router.refresh()` la închidere
- Integrat în tab Membri din `/dashboard/grupuri/[id]` ca secțiune "Import în masă din CSV"

### Căutare globală conținut cursuri (WP21 — COMPLET 2026-06-15)
- `getPublishedCourseLessonTitles()` în `lib/db/courses.ts` — index `courseId → [titluri module + lecții]`, cached cu tag `courses`
- `filterCourses` extins: caută și în titluri module/lecții (nu doar curs+descriere); returnează `contentMatchIds`
- `CourseGridClient`: placeholder actualizat "Caută cursuri, module sau lecții..."; badge "Potrivire în lecții" sub cardurile găsite indirect
- Fetch parallel `courses + titleIndex` în `CourseList` din `/courses`

### Distribuire certificat social media (WP22 — COMPLET 2026-06-15)
- `ShareButtons` — client component: WhatsApp, Facebook, Copiază link (clipboard API cu fallback `execCommand`, feedback "Copiat!" 2s)
- Mesaj pre-completat: `"{Nume} a absolvit cursul "{Titlu}" pe Academia Politica AUR! 🎓🌟"`
- Integrat în bara de navigare (`.no-print`) pe ambele pagini de diplomă: `/cursant/[id]/certificate/[certId]` și `/grup/.../certificate/[certId]`
- Pe mobil: doar iconițe; pe desktop: iconițe + text

### UI/UX
- Header sticky cu nav: Despre platformă, Cursuri, Formatori, Intră în grup, Copii, Admin, Ajutor
- "Copii" ascuns pentru formatori (isTeacher din accountType)
- accountType cu fallback user_metadata (funcționează fără re-login)
- Chat widget FAQ client-side (zero API) cu linkuri la /help
- Pagina /help cu 6 secțiuni acordeon + contact
- Home page: 4 carduri grupate ELEVI (0-4, 5-8) + PROFESORI (Formator, Profesor Gimnaziu)
- **Cookie consent banner** GDPR — `components/common/cookie-consent.tsx`, localStorage, persistent dismiss
- **AcademiaGuide cu Moti** pe 11 pagini cheie: home, /preturi, /help, /formatori, /cursant/[id], /dashboard/progress/[id], /register, /login, /despre, /webinars, /instaleaza — toate cu `variant="moti"`
- **PWA (Progressive Web App)** — manifest.json (standalone, teal theme), sw.js (cache-first assets, network-first pagini, fallback `/offline.html`), pwa-register.tsx (banner install + beforeinstallprompt), offline.html (cu Moti); link "Instalează app" în footer + meniu mobil; pagina /instaleaza cu instrucțiuni Android/iOS/desktop
- **Loading skeletons** — /admin/parents/loading.tsx, /admin/courses/loading.tsx
- **Paginare admin** — /admin/parents, /admin/children, /admin/teachers: 25/pagină, range Supabase + count exact
- **Pagina progres copil** — quiz analytics agregat: scor mediu per modul (badge color-coded ≥80% teal, ≥50% yellow, <50% red); fix N+1 query (batch fetch quiz→lesson mappings)

## Variabile de mediu necesare
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
RESEND_API_KEY=
EMAIL_FROM=Academia Politica AUR <noreply@domeniu-verificat.ro>
NEXT_PUBLIC_SITE_URL=https://academia-aur.ro
ADMIN_EMAIL=email-admin@domeniu.com
ADMIN_EMAILS=email-admin@domeniu.com
GROQ_API_KEY=                        # import curriculum AI
ANTHROPIC_API_KEY=                   # opțional — fallback import quiz
CRON_SECRET=                         # ⚠️ OBLIGATORIU — protejează /api/cron/weekly-report
TEST_EMAIL_SECRET=                   # testare manuală email cron
GOOGLE_DRIVE_CLIENT_ID=              # Google Drive OAuth2
GOOGLE_DRIVE_CLIENT_SECRET=          # Google Drive OAuth2
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=    # Google Picker (client-safe)
```

## Migrații SQL (supabase/migrations/)
- `001_initial_schema.sql` — schema completă + RLS
- `002_demo_data.sql` — date demo cursuri
- `003_extend_schema.sql` — aprobare conturi, câmpuri noi courses/lessons, audience
- `004_webinars_paths.sql` — webinars, learning_paths, learning_path_courses, webinar_registrations
- `005_teacher_audience.sql` — constraint audience extins cu formator/profesor
- `006_classes.sql` — tabele clase: classes, class_students, class_courses, class_student_progress + RLS
- `007_class_certificates.sql` — class_student_certificates (diplome pentru membri din grupuri)
- `009_google_drive.sql` — drive_folder_id pe courses/modules/lessons; tabel admin_settings ✓ APLICAT
- `010_subscriptions.sql` — subscription_plan, subscription_expires_at, subscription_activated_by pe parent_profiles ✓ APLICAT
- `011_soft_delete.sql` — deleted_at pe courses/modules/lessons + indexuri parțiale ✓ APLICAT
- `012_subscription_requests.sql` — tabel subscription_requests (cereri utilizator, aprobare admin) + RLS ✓ APLICAT
- `015_hash_student_pins.sql` — nulare PIN-uri elevi plain-text (4 cifre) → regenerare necesară de profesor ✓ APLICAT
- `016_webinar_schedule.sql` — `scheduled_at TIMESTAMPTZ` + `registration_url TEXT` pe webinars ✓ APLICAT

## Pattern-uri critice de cod

### Admin check (standard în tot proiectul)
```typescript
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";
```

### requireAdmin() — guard centralizat pentru Server Actions
```typescript
// lib/admin/guard.ts
import { requireAdmin } from "@/lib/admin/guard";
await requireAdmin(); // aruncă Error dacă nu admin → prins de try/catch
```

### Client Supabase în admin
```typescript
// CORECT — bypass RLS pentru operații admin
const db = createAdminClient(); // lib/supabase/admin.ts — SYNC, nu await!

// CORECT — user-specific cu RLS
const supabase = await createClient(); // lib/supabase/server.ts — ASYNC

// GREȘIT pentru admin — blocat de RLS
const supabase = createClient(); // lib/supabase/client.ts (browser client)
```

### Self-profile query
```typescript
// .maybeSingle() nu .single() — nu aruncă eroare dacă nu există
const { data } = await supabase.from("parent_profiles")
  .select("...").eq("user_id", user.id).maybeSingle();
```

### Server Actions cu guard admin
```typescript
"use server";
export async function deleteLesson(lessonId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return { error: error.message };
    revalidatePath("/admin/courses");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}
```

### DeleteButton cu redirect
```tsx
// Când ștergerea necesită navigare (ex: stergere curs din detaliu)
<DeleteButton
  action={deleteCourse.bind(null, id)}
  confirmMessage="Ștergi cursul?"
  redirectTo="/admin/courses"
/>
```

## .claude/ — agenți și skilluri
- **Agenți:** supabase-backend, admin-panel, content-courses, ui-components, researcher, code-reviewer, feature-tester, security-auditor
- **Skilluri:** /commit-push, /review, /review-diff, /debug, /security-audit, /db-migration, /add-feature, /test-feature

## Teste automatizate (Vitest)
- `vitest.config.ts` — environment: node, alias `@/` pentru imports
- `__tests__/google-drive-utils.test.ts` — 20+ teste utils Google Drive
- `__tests__/badges.test.ts` — 10 teste computeBadges (9 insigne)
- `__tests__/schemas.test.ts` — 17 teste Zod schemas
- `__tests__/admin-delete.test.ts` — 8 teste Server Actions cu mock Supabase (vi.hoisted pattern)
- `__tests__/clasa-verify-pin.test.ts` — 8 teste POST /api/grup/verify-pin
- `__tests__/clasa-progress.test.ts` — 6 teste POST /api/grup/progress
- **Total: 69 teste, 6 fișiere, ~350ms**
- CI: `.github/workflows/test.yml` — rulare automată la push/PR pe `main`
- Rulare: `npm run test` (one-shot) sau `npm run test:watch` (watch mode)

## Last build
- 2026-06-15 (update 12): WP20–WP23 complete — Import CSV elevi, Căutare globală cursuri, Distribuire certificat, Calendar webinarii
