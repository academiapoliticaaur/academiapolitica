# Architecture Decisions

## ADR-001 — Framework: Next.js + TypeScript
App Router, server components by default. Server actions for mutations.

## ADR-002 — Styling: Tailwind CSS v4 + shadcn/ui
shadcn components sunt copiate în `components/ui/`. Nu face upgrade shadcn fără testare.

## ADR-003 — Auth și database: Supabase
- SSR client pattern: separate `client.ts`, `server.ts`, `middleware.ts` în `lib/supabase/`
- Supabase Auth pentru conturi parent (family/formator/profesor)
- PostgreSQL via Supabase pentru toate datele
- `createAdminClient()` (service role) pentru operații admin — bypass RLS
- `createClient()` (anon/user) pentru operații user-facing — cu RLS

## ADR-004 — Child identity model
Copiii nu au conturi email. Un părinte creează profiluri cursanți legate de user_id propriu. Profilurile copii au PIN opțional (4 cifre, sessionStorage, expiră 8h).

## ADR-005 — Video: YouTube unlisted
URL-uri YouTube Unlisted embed via componenta `VideoEmbed`. Risc cunoscut: linkurile pot fi distribuite. Acceptat pentru MVP.

## ADR-006 — Prezentări și fișe: Google Drive
Google Drive este sursa principală pentru prezentări (Slides/PDF) și fișe de lucru (PDF). Embed via `getGoogleDriveEmbedUrl()`. Google Slides → `/embed`, Drive file → `/preview`. Componentele `PresentationViewer` și `WorksheetViewer` gestionează afișarea.

## ADR-007 — AI content policy
Flag-uri `ai_generated` și `human_reviewed` pe Lesson. Doar lecțiile human-reviewed ar trebui publicate. Adminul setează `human_reviewed = true` înainte de publicare.

## ADR-008 — Routing structure
Route groups per rol: `(public)`, `(auth)`, `(dashboard)`, `(child)`, `(admin)`. Fiecare grup are propriul layout cu auth guard.

## ADR-009 — Form validation
react-hook-form + zod. Scheme în `lib/validation/schemas.ts`. Server actions returnează `{ error: string }` la eșec, sau `void` la succes.

## ADR-010 — Data fetching
Queries DB în `lib/db/`. Server components le apelează direct. Nu există API routes pentru date interne (excepție: Supabase Auth callbacks și Google Drive token endpoint).

## ADR-011 — Google Drive OAuth2 cu refresh_token în DB
Refresh token-ul Google Drive este stocat în tabelul `admin_settings` (key = `google_drive_refresh_token`), nu în variabile de mediu. Motivare:
- Admin se autentifică o singură dată din `/admin/settings/google-drive`
- Token-ul nu expiră (refresh_token de lungă durată)
- Reconectarea se poate face din UI fără deploy nou
- `admin_settings` este un key-value store general pentru setări platformă
- Access token-ul (expiră în 1h) este obținut on-demand via `getAccessToken()` din `lib/google-drive.ts`
- Endpoint `/api/admin/drive/token` furnizează access_token clientului pentru Google Picker (protejat cu admin check)

## ADR-012 — Tabel admin_settings pentru configurare platformă
Tabel key-value `admin_settings` (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ) pentru setări care se schimbă din UI fără re-deploy. RLS activat (service role only). Chei folosite:
- `google_drive_refresh_token` — token OAuth2 Google Drive
- `google_drive_root_folder_id` — ID folder rădăcină Drive (creat la prima conectare)

## ADR-013 — Server Action guard centralizat
`lib/admin/guard.ts` exportă `requireAdmin()` — funcție async care verifică sesiunea și ADMIN_EMAILS. Server Actions admin apelează `await requireAdmin()` ca primă instrucțiune, înfășurată în try/catch. Dacă verificarea eșuează, aruncă Error care este prins și returnat ca `{ error: string }` — niciodată expus ca pagina de eroare Next.js. Motivare: consistență, un singur loc de schimbat logica admin check.

## ADR-014 — DeleteButton cu redirectTo
Componenta `DeleteButton` acceptă prop opțional `redirectTo`. Dacă este setat și ștergerea a reușit, face `router.push(redirectTo)`. Motivare: ștergerea unui curs din pagina de detaliu (`/admin/courses/[id]`) ar lăsa pagina să re-randeze pe un curs inexistent → 404. Cu `redirectTo="/admin/courses"` utilizatorul ajunge pe lista de cursuri imediat după ștergere.
