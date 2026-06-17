# SETUP.md — Configurare Supabase și mediu local

## Pasul 1: Creează proiect Supabase

1. Mergi la [supabase.com](https://supabase.com) și autentifică-te
2. Apasă **New Project**
3. Completează:
   - **Name**: academia-politica-aur
   - **Database Password**: alege o parolă puternică (o vei folosi mai târziu)
   - **Region**: alege Europe (Frankfurt sau altul apropiat)
4. Apasă **Create new project** și așteaptă 1-2 minute

## Pasul 2: Obține cheile API

1. În Supabase Dashboard, mergi la **Project Settings → API**
2. Copiază:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (SECRETĂ, nu o expune!)

## Pasul 3: Configurează variabilele de mediu

```bash
cp .env.example .env.local
```

Editează `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Pasul 4: Rulează migrațiile SQL

1. În Supabase Dashboard → **SQL Editor**
2. Apasă **New Query**
3. Copiază conținutul din `supabase/migrations/001_initial_schema.sql` și apasă **Run**
4. Copiază conținutul din `supabase/migrations/002_demo_data.sql` și apasă **Run**

> ⚠️ Rulează migrațiile în ordine: 001 mai întâi, apoi 002.

## Pasul 5: Configurează Supabase Storage

1. În Dashboard → **Storage**
2. Creează bucket-ul `presentations`:
   - Apasă **New bucket**
   - Name: `presentations`
   - **Public bucket**: ✅ da (pentru accesul la fișierele PDF)
3. Creează bucket-ul `worksheets`:
   - Name: `worksheets`
   - **Public bucket**: ✅ da
4. Opțional: creează `avatars` pentru avatarele copiilor

## Pasul 6: Configurează autentificarea

1. În Dashboard → **Authentication → Settings**
2. **Email Settings**:
   - Activează **Confirm email**: opțional pentru MVP (dezactivează pentru test mai ușor)
   - **Site URL**: `http://localhost:3000` (pentru dev), înlocuiește cu URL Vercel la producție
3. **Redirect URLs**: adaugă `http://localhost:3000/**`

## Pasul 7: Setează contul admin

1. Creează un cont normal prin `/register`
2. În Supabase → **Authentication → Users**
3. Găsește userul și apasă pe el
4. Editează **User Metadata**:
```json
{
  "role": "admin"
}
```
5. Salvează

> Sau poți adăuga emailul adminului în variabila `ADMIN_EMAILS` din `.env.local`:
> ```
> ADMIN_EMAILS=admin@emailul-tau.com
> ```

## Pasul 8: Verificare

```bash
npm run dev
```

- Mergi la `http://localhost:3000` — trebuie să apară pagina principală
- Mergi la `/courses` — trebuie să apară cursurile demo
- Creează un cont la `/register`
- Mergi la `/admin` — trebuie să ai acces dacă ai setat rolul admin

## Troubleshooting

**Eroare "relation does not exist"**: Migrațiile nu au rulat. Rulează 001_initial_schema.sql în SQL Editor.

**Eroare 401 / Unauthorized**: Verifică variabilele din `.env.local`.

**Cursurile nu apar**: Verifică că migrația 002_demo_data.sql a rulat cu succes.
