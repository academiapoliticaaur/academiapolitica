# Project Brief — Ami & Moti Educational Platform

## Product
Platformă educațională web pentru copii (piața română). Cursuri generate cu AI, revizuite de oameni. Două personaje: Ami (fetiță de 11 ani) și Moti (pisică portocalie). Platforma este gratuită integral.

## Users
| Rol | Descriere |
|------|-------------|
| Vizitator | Browsează catalogul public de cursuri, fără cont |
| Părinte/tutore | Creează cont (`family`), gestionează profiluri copii, urmărește progresul |
| Profil copil | Legat de cont părinte, fără email, accesează cursuri |
| Cadru didactic (Învățător) | Cont `invatator`, necesită aprobare admin, accesează resurse cls. 0–4, gestionează clase |
| Cadru didactic (Profesor) | Cont `profesor`, necesită aprobare admin, accesează resurse cls. 5–8, gestionează clase |
| Elev din clasă | Acces fără cont prin cod clasă + cod personal (dat de profesor) |
| Admin | Gestionează tot conținutul și utilizatorii platformei |

## Grupe de vârstă (pentru elevi)
- **0–4**: Ciclul preșcolar și primar inferior
- **5–8**: Ciclul primar superior și gimnaziu

## Feature set complet (post-MVP)

### Public & Navigație
1. Pagina principală cu hero, features, 4 carduri grupe
2. Catalog cursuri cu căutare text și filtru grupă vârstă
3. Pagina detaliu curs (publică)
4. Pagina /cadre-didactice cu resurse didactice (acces per rol)
5. Pagina /despre, /help, /paths, /webinars

### Autentificare
6. Înregistrare cu selectare tip cont (family/invatator/profesor)
7. Login/logout (Supabase Auth PKCE)
8. MFA TOTP pentru admin
9. PIN opțional 4 cifre pe profil copil (expiră 8h)

### Dashboard & Progres
10. Dashboard cu profiluri copii și XP
11. Zona copilului: XP, streak, badges, curs activ
12. Player lecție: YouTube video, Google Drive prezentare/fișă de lucru, quiz interactiv
13. Progres tracking (per copil, per lecție)
14. Gamificare: XP, daily streak, 9 insigne, diplomă printabilă
15. Email diplomă la finalizare curs (Resend)

### Sistem Clase
16. Profesorul creează clase cu cod de acces unic
17. Adaugă elevi (display_name + cod personal)
18. Asignează cursuri clasei
19. Elevi accesează /clasa fără cont (cod clasă + cod personal)
20. Diplomă pentru elevi din clase

### Admin
21. CRUD complet cursuri / module / lecții / quiz-uri
22. Import curriculum AI (DOCX/PDF → Groq → curs draft)
23. Import quiz din DOCX/PDF/TXT
24. Publicare/retragere cursuri și webinarii
25. Gestionare utilizatori (părinți, cadre didactice, copii)
26. Aprobare conturi cadre didactice
27. CRUD trasee de instruire și webinarii
28. Statistici platformă
29. Google Drive integration (OAuth2, Google Picker, organizare foldere)

### Email & Cron
30. Raport săptămânal progres copii (Resend, cron luni 08:00)
31. Formular contact → ADMIN_EMAIL

## Constrângeri de privacy
- Niciun cont email pentru copii
- Niciun profil public al copilului
- Niciun chat sau comentarii publice
- Date minime copil: display_name, grupă vârstă, PIN opțional
- Părintele vede DOAR propriii copii

## Workflow conținut
Google Drive (authoring) → URL direct în lecție → embed în player (Google Drive Preview/Embed API). Toate lecțiile AI-generate necesită revizuire umană înainte de publicare.

## Deployment
Vercel (Next.js), Supabase (DB + Auth), custom domain ami-moti.everydai.ro
