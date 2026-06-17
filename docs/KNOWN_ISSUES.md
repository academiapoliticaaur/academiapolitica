# Known Issues and Risks

## Blockers rezolvate

### ~~ENV-001~~ — RESOLVED (2026-05-04)
- `.env.local` confirmat prezent cu toate variabilele necesare

### ~~DB-001~~ — RESOLVED (2026-05-04)
- Migrații aplicate în Supabase Dashboard

### ~~AUTH-002~~ — RESOLVED (2026-05-07)
- PIN 4 cifre implementat pe profil cursant, expiră 8h (sessionStorage), poate fi eliminat din Dashboard

### ~~ADMIN-001~~ — RESOLVED (2026-05-07)
- Admin routes protejate de middleware + MFA TOTP obligatoriu

### ~~DELETE-001~~ — RESOLVED (2026-05-22)
- Ștergere curs afișa pagina de eroare Next.js; FK `certificates_course_id_fkey` fără CASCADE
- Fix: deleteLesson/Module/Course în Server Action cu try/catch + alert eroare + ștergere manuală certificates înainte de curs

### ~~DELETE-002~~ — RESOLVED (2026-05-22)
- După ștergere curs din pagina de detaliu apărea 404 (pagina încerca să re-randeze cursul șters)
- Fix: `redirectTo="/admin/courses"` pe DeleteButton → router.push după ștergere reușită

### ~~DRIVE-001~~ — RESOLVED (2026-06-07)
- Migration 009 aplicată în Supabase Dashboard (`drive_folder_id` + `admin_settings`)

### ~~DRIVE-002~~ — RESOLVED (2026-06-07)
- `NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY` + `GOOGLE_DRIVE_CLIENT_ID/SECRET/REDIRECT_URI` setate în Vercel

### ~~DRIVE-003~~ — RESOLVED (2026-06-07)
- Google Drive conectat din `/admin/settings/google-drive` cu contul mpandilica@gmail.com
- Folderul rădăcină "Academia Politica AUR — Conținut Cursuri" creat automat în Drive

## Limitări cunoscute (by design pentru MVP)

### VID-001 — YouTube unlisted links pot fi distribuite
- Documentat în ADR-005
- Acceptabil pentru MVP, revizuire post-lansare
- **Alternativă mai sigură**: Google Drive video (acces restricționat la domeniu)

### AUTH-001 — Email confirmation limitează înregistrarea pe Free Tier
- Supabase Free Tier: max 4 emailuri/oră
- **Fix:** Authentication → Settings → Email → dezactivează "Enable email confirmations"
- **Producție:** configurează SMTP custom (Resend) în Supabase

### ~~MIGR-011~~ — RESOLVED (2026-06-07)
- `email_reports boolean NOT NULL DEFAULT true` adăugat pe `parent_profiles` în Supabase Dashboard

### EMAIL-001 — Domeniu expeditor
- `EMAIL_FROM` în Vercel = `noreply@academia-aur.ro` (domeniu verificat în Resend)
- Fallback-uri hardcodate standardizate la `noreply@academia-aur.ro` (2026-06-07)
- Când `academia-aur.ro` e verificat în Resend: actualizează doar env var `EMAIL_FROM` în Vercel, zero cod

### MW-001 — Middleware convention (non-blocker)
- `middleware.ts` la rădăcină — funcționează corect în Next.js 16
- Warning de deprecare în unele versiuni — ignorabil

### ~~AI-001~~ — RESOLVED (2026-06-07)
- Retry automat server-side în `POST /api/admin/parse-curriculum`
- Dacă `JSON.parse` eșuează la primul apel, reîncearcă automat o dată cu prompt simplificat

## Securitate — fix-uri aplicate (2026-06-15)

| ID | Severitate | Fix aplicat |
|----|-----------|-------------|
| C-1 | CRITICAL | `flowType: "pkce"` în loc de "implicit" (lib/supabase/client.ts) |
| H-2 | HIGH | Eliminat `access_code` din GET /api/grup/list |
| H-3 | HIGH | HMAC-SHA256 pentru token unsubscribe (weekly-report + /api/unsubscribe) |
| H-4 | HIGH | Ownership check `parent_id` în `verifyChildPin` + cookie `secure` flag |
| H-5 | HIGH | QR code MFA: `<img src="data:image/svg+xml;base64,...">` în loc de `dangerouslySetInnerHTML` |
| M-5 | MEDIUM | Middleware verifică `ADMIN_EMAILS` + `app_metadata.role` înainte de MFA check pentru /admin |
| M-4 | MEDIUM | Rate limiting in-memory (10 req/5min per IP+studentCode) pe POST /api/grup/verify-pin |
| M-1 | MEDIUM | `logAdminAction` non-exportat (internal use only în lib/admin/actions.ts) |
| C-2 | MEDIUM | PIN elevi hash SHA-256 (`academia-aur-elev:{pin}`) stocat, nu plain-text |
| C-3 | MEDIUM | Migrație 015: nulare PIN-uri plain-text existente ✓ APLICAT 2026-06-15 |
| L-3 | LOW | Parolă minimă 8 caractere (login, register, reset-password, updateParentPassword) |
| L-4 | LOW | Cookie `secure: true` în producție pentru child_session |

**Neimplementat (prioritate mică):**
- Google API Key restriction în Google Console (configurare manuală, fără cod)

## Technical debt (post-MVP)

- Quiz import regex nu prinde toate formatele posibile (fallback Claude AI disponibil)
- `PresentationViewer` folosește iframe simplu — nu optimizat pentru mobile
- Rate limiting verify-pin: in-memory (nu persistă cross-instance) — upgrade la Upstash Redis pentru producție la scară
- Rate limiting verify-pin: in-memory (nu persistă cross-instance) — upgrade la Upstash Redis pentru producție la scară
