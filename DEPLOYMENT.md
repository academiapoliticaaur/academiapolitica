# DEPLOYMENT.md — Publicare pe Vercel

## Cerințe preliminare

- Cont Vercel (gratuit la vercel.com)
- Cont GitHub (pentru conectarea repo-ului)
- Proiect Supabase configurat și migrațiile rulate

## Pasul 1: Pregătire repository Git

```bash
git add .
git commit -m "Initial commit - Ami & Moti Platform MVP"
git remote add origin https://github.com/username/ami-moti-edu-platform.git
git push -u origin main
```

## Pasul 2: Import în Vercel

1. Mergi la [vercel.com/new](https://vercel.com/new)
2. Conectează-te cu GitHub
3. Selectează repository-ul `ami-moti-edu-platform`
4. Apasă **Import**

## Pasul 3: Configurează variabilele de mediu

În ecranul de configurare Vercel, adaugă **Environment Variables**:

| Variabilă | Valoare |
|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL-ul proiectului Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cheia anon din Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cheia service role (secretă!) |
| `NEXT_PUBLIC_APP_URL` | URL-ul Vercel (ex: `https://ami-moti.vercel.app`) |
| `ADMIN_EMAILS` | emailul tău de admin (ex: `admin@email.com`) |

## Pasul 4: Deploy

Apasă **Deploy** și așteaptă 1-3 minute.

## Pasul 5: Actualizare Supabase după deploy

1. Supabase Dashboard → **Authentication → Settings**
2. **Site URL**: înlocuiește `http://localhost:3000` cu URL-ul Vercel
3. **Redirect URLs**: adaugă `https://ami-moti.vercel.app/**`

## Actualizări viitoare

Orice `git push` pe branch-ul `main` va declanșa automat un nou deploy pe Vercel.

```bash
git add .
git commit -m "Adăugat curs nou / Fix bug / etc."
git push
```

## Deploy preview

Vercel creează automat preview-uri pentru Pull Requests. Util pentru testare înainte de a publica.

## Domeniu personalizat (opțional)

1. Vercel Dashboard → Settings → Domains
2. Adaugă domeniul tău (ex: `amimoti.ro`)
3. Configurează DNS-ul la registrar-ul tău conform instrucțiunilor Vercel

## Variabile pentru producție vs. development

| Variabilă | Development | Producție |
|-----------|-------------|-----------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://ami-moti.vercel.app` |
| Altele | Identice | Identice (same Supabase project) |

> ⚠️ Poți folosi un proiect Supabase separat pentru producție vs. dev pentru siguranță maximă.
