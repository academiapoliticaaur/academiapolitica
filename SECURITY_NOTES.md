# SECURITY_NOTES.md — Securitate, GDPR și protecția copiilor

## 1. Date colectate

### De la părinți:
- Adresă de email
- Parolă (hashed de Supabase Auth)
- Nume complet
- Consimțământ pentru termeni și GDPR

### De la copii (profiluri):
- Prenume sau pseudonim (alegerea părintelui)
- Grupa de vârstă (0-4 sau 5-8)
- Clasa (opțional)
- Progres lecții (ID lecție + status)

### Ce NU colectăm de la copii:
- Adresă de email
- Parolă proprie
- Date de identificare reale (opțional pseudonim)
- Date de localizare
- Informații medicale sau psihologice

## 2. Protecția copiilor — principii implementate

1. **Copilul nu poate crea singur un cont** — contul este creat de părinte
2. **Fără email pentru copii** — profilul copilului nu are adresă de email
3. **Profiluri private** — profilul copilului nu este vizibil altor utilizatori
4. **Fără chat public** — nu există comunicare între copii
5. **Fără comentarii publice** — nu există secțiuni de comentarii
6. **Progres privat** — progresul unui copil este vizibil doar părintelui
7. **Date minime** — colectăm strictul necesar

## 3. Roluri și permisiuni

| Rol | Poate face |
|-----|-----------|
| Visitor | Vede paginile publice și listele de cursuri |
| Parent | Gestionează contul, creează profiluri copil, vede progresul |
| Child (profil) | Accesează lecțiile, salvează progresul, face quiz-uri |
| Admin | Crează/editează/publică cursuri, module, lecții |

## 4. Row Level Security (RLS) — Supabase

Toate tabelele au RLS activat:
- Părintele vede DOAR profilurile și progresul copiilor săi
- Lecțiile sunt vizibile DOAR dacă sunt `published` și utilizatorul e autentificat
- Cursurile publicate sunt vizibile pentru toți vizitatorii
- Draft-urile sunt vizibile DOAR adminului

## 5. Recomandări GDPR

### Implementate în MVP:
- Consimțământ explicit la înregistrare (bifă obligatorie)
- Consimțământ parental (bifă obligatorie)
- Date minime pentru copii

### De implementat înainte de lansare:
1. **Politică de confidențialitate** — pagina `/confidentialitate` (conținut legal)
2. **Termeni și condiții** — pagina `/termeni`
3. **Dreptul la ștergere** — buton "Șterge contul" în setările părintelui
4. **Export date** — funcționalitate de export date GDPR
5. **Cookie consent** — banner cookies pentru analitice (dacă folosești)

## 6. Limitările YouTube Unlisted

**Ce oferă YouTube Unlisted:**
- Videoclipul NU apare în căutări YouTube
- NU poate fi accesat fără link
- Poate fi embed în orice site

**Riscuri:**
- Dacă utilizatorul copiază linkul YouTube, îl poate distribui oricui
- YouTube poate schimba politicile
- Nu oferă DRM sau criptare

**Recomandat pentru MVP**: YouTube Unlisted este suficient pentru conținut educațional non-sensibil.

**Alternative pentru viitor (conținut protejat)**:
- **Cloudflare Stream** — video streaming cu protecție, limitat la domenii
- **Vimeo Pro/Business** — privacy controls avansate, domain restriction
- **Supabase Storage** — pentru videoclipuri scurte, dar fără optimizare streaming
- **Mux.com** — platformă video profesională, API-first

## 7. Securitate tehnic

### Implementate:
- Toate cheile API sunt în variabile de mediu (`.env.local`)
- `.env.local` este în `.gitignore` (nu se commitează)
- Middleware verifică autentificarea pe toate rutele protejate
- RLS pe toate tabelele Supabase
- Validare Zod pe toate formularele

### De verificat înainte de producție:
1. `SUPABASE_SERVICE_ROLE_KEY` nu trebuie să apară niciodată în cod client
2. Toate API Routes care fac operații privilegiate folosesc clientul server
3. Verifică că CORS este configurat corect în Supabase
4. Activează 2FA pe contul Supabase și Vercel
5. Revizuiește politicile RLS periodic

## 8. Conținut AI — avertismente

- Toată lecțiile generate AI trebuie verificate uman înainte de publicare
- AI nu trebuie să genereze conținut medical, psihologic sau juridic fără validare specialist
- Câmpul `human_reviewed` trebuie să fie `true` înainte de `status = published`
- Notifică utilizatorii că platforma folosește conținut AI (mesaj în footer și la lecții)

## 9. Checklist securitate înainte de lansare

- [ ] Politică de confidențialitate creată și publicată
- [ ] Termeni și condiții creați și publicați
- [ ] RLS testat pentru fiecare tabel
- [ ] Variabile de mediu verificate (nu există secrete în cod)
- [ ] Autentificare 2FA activată pe Supabase
- [ ] Backup-uri automate activate în Supabase
- [ ] HTTPS activ (Vercel asigură asta automat)
- [ ] Revizuire conținut AI completă
- [ ] Testare cu cont de copil (să nu vadă conținut inadecvat)
