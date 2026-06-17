# Claude Code Instructions — Academia Politica AUR

## Proiect
Platformă de formare politică și educație civică a Alianței pentru Unirea Românilor.
Fork din ami-moti-edu-platform, adaptat pentru utilizatori adulți (membri, simpatizanți, formatori, lectori).

## Stack
- Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui
- Supabase (Auth PKCE + PostgreSQL + RLS)
- Vercel deployment target | Groq AI (curriculum import) | Resend (email)
- Google Drive (conținut lecții + OAuth2 pentru admin)

## Tipuri de conturi (account_type în parent_profiles)
- `member` — Membru AUR / Simpatizant, nu necesită aprobare, auto-redirect la zona de cursuri
- `formator` — Formator (echivalent invatator din original), necesită aprobare admin
- `lector` — Lector / Conferențiar (echivalent profesor din original), necesită aprobare admin
- Admin: verificat prin `ADMIN_EMAILS` env var sau `user.app_metadata?.role === "admin"`

## Flow utilizator (adulți — fără profiluri copii)
- **Member**: login → dashboard → auto-creare child_profile cu datele userului → redirect `/cursant/[profileId]`
- **Formator/Lector**: login → redirect automat la `/dashboard/grupuri`
- **Admin**: login → dashboard cu acces la toate resursele

## Diferențe față de ami-moti (fork source)
| Ami & Moti (original) | Academia Politica AUR (fork) |
|---|---|
| `family` account | `member` account |
| `invatator` account | `formator` account |
| `profesor` account | `lector` account |
| `/child/[profileId]/*` | `/cursant/[profileId]/*` |
| `/clasa/[code]/*` | `/grup/[code]/*` |
| `/cadre-didactice` | `/formatori` |
| `/dashboard/classes/*` | `/dashboard/grupuri/*` |
| AmiMotiGuide (ami/moti variants) | AcademiaGuide (info/tip/mission/discovery) |
| Logo: Ami & Moti | Logo: ACADEMIA POLITICA AUR (galben/negru) |
| Tema: teal (#0d9488) | Tema: gold (#b8860b) |

## Pattern CRITIC — Supabase client în admin
```typescript
// CORECT — admin mutations și queries (bypass RLS)
import { createAdminClient } from "@/lib/supabase/admin";
const supabase = createAdminClient(); // sync, nu await

// CORECT — user-specific queries cu RLS
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient(); // async
```

## Pattern — requireAdmin() guard centralizat (Server Actions)
```typescript
import { requireAdmin } from "@/lib/admin/guard";

export async function myAdminAction(): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}
```

## Componenta AcademiaGuide
```tsx
// Variante disponibile: "info" | "tip" | "mission" | "discovery"
import { AcademiaGuide } from "@/components/common/academia-guide";
<AcademiaGuide variant="info" message="..." />
<AcademiaGuide variant="tip" message="..." />
```

## Rute cheie
- `/cursant/[profileId]/*` — zona de învățare a utilizatorului adult
- `/grup/[code]/*` — acces membri în grupuri de formare (fără auth)
- `/dashboard/grupuri/*` — gestionare grupuri (formatori/lectori)
- `/formatori` — pagina publică resurse formatori
- `/pentru-formatori` — landing page pentru formatori neautentificați

## Fișiere cheie
```
lib/supabase/admin.ts              — createAdminClient()
lib/supabase/server.ts             — createClient()
lib/admin/guard.ts                 — requireAdmin()
lib/admin/actions.ts               — Server Actions admin
lib/auth/actions.ts                — Server Actions auth
lib/db/courses.ts                  — DB queries cursuri
components/common/academia-guide.tsx  — componenta ghid
components/layout/header.tsx          — header cu logo AUR
components/layout/footer.tsx          — footer AUR
app/(child)/cursant/               — zona cursantului adult
app/(public)/grup/                 — zona grupurilor (fără auth)
app/(dashboard)/dashboard/grupuri/ — gestionare grupuri
```

## Setup nou proiect
1. Crează proiect Supabase nou
2. Aplică migrațiile din `supabase/migrations/` (001-016)
3. Completează `.env.local` cu valorile reale (vezi `.env.example`)
4. `npm install && npm run dev`
5. Configurează Google Drive din `/admin/settings/google-drive`

## Variabile de mediu necesare
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_URL=https://academia-aur.ro
RESEND_API_KEY=
EMAIL_FROM=Academia Politica AUR <noreply@academia-aur.ro>
ADMIN_EMAIL=
ADMIN_EMAILS=
GROQ_API_KEY=
CRON_SECRET=
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=
```

## Workflow rules
- **Nu modifica proiectul ami-moti-edu-platform** — acesta e un fork independent
- La orice mutație admin: folosește `createAdminClient()`, nu `createClient()`
- Server Actions admin: apelează `await requireAdmin()` ca primă instrucțiune
- Params Next.js 16: `const { id } = await params;`
- `npm run build` după modificări majore (TypeScript strict)
