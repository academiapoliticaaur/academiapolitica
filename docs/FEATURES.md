# Descriere funcțională completă — Academia Politica AUR MVP
**Versiune:** 1.0 MVP  
**Data:** 2026-05-22  
**Platforma:** https://academia-aur.ro  
**Repository:** bazat pe template v1.0 (tag `v1.0-template`)

> Acest document descrie **toate funcționalitățile implementate** în MVP-ul platformei Academia Politica AUR.  
> Se actualizează la fiecare extindere majoră a proiectului.  
> Serve drept referință pentru proiectul derivat **AILiteracy**.

---

## Cuprins

1. [Tipuri de utilizatori](#1-tipuri-de-utilizatori)
2. [Zona publică (fără cont)](#2-zona-publică-fără-cont)
3. [Autentificare și conturi](#3-autentificare-și-conturi)
4. [Dashboard Părinte](#4-dashboard-părinte)
5. [Zona Copilului](#5-zona-copilului)
6. [Cadre Didactice](#6-cadre-didactice)
7. [Sistemul de Clase](#7-sistemul-de-clase)
8. [Gamificare și Recompense](#8-gamificare-și-recompense)
9. [Panoul de Administrare](#9-panoul-de-administrare)
10. [Gestionarea Conținutului](#10-gestionarea-conținutului)
11. [Instrumente AI](#11-instrumente-ai)
12. [Integrare Google Drive](#12-integrare-google-drive)
13. [Email și Notificări](#13-email-și-notificări)
14. [UI/UX și Accesibilitate](#14-uiux-și-accesibilitate)

---

## 1. Tipuri de utilizatori

Platforma suportă 6 tipuri de utilizatori cu drepturi distincte:

| Tip | Câmp DB | Aprobare | Descriere |
|-----|---------|----------|-----------|
| **Vizitator** | — | Nu | Browsează catalog public, fără cont |
| **Părinte/Tutore** | `family` | Nu | Gestionează profiluri cursanți, urmărește progres |
| **Profil cursant** | — | Nu | Legat de cont părinte, accesează cursuri |
| **Formator** | `formator` | **Da** (admin) | Resurse cls. 0–4, gestionează clase |
| **Profesor gimnaziu** | `profesor` | **Da** (admin) | Resurse cls. 5–8, gestionează clase |
| **Elev din clasă** | — | Nu | Acces fără cont prin cod grup + cod personal |
| **Admin** | ADMIN_EMAILS | — | Control total platformă |

### Model de acces per tip de cont
- **Vizitator**: vede titlurile și descrierile cursurilor; nu poate accesa conținut lecții
- **Părinte `family`**: acces imediat după înregistrare; gestionează copii, vizualizează lecții în modul preview (fără progres)
- **Formator neaprobat**: se poate înregistra și loga; vede titlurile cursurilor și o pagina goală; un banner îl informează că urmează aprobare
- **Formator aprobat**: acces complet la cursurile corespunzătoare rolului său; poate crea și gestiona clase
- **Admin**: acces complet la toate funcțiile platformei, inclusiv panou de administrare

---

## 2. Zona publică (fără cont)

### 2.1 Pagina principală (`/`)
- Hero section cu titlu, descriere și CTA (Înregistrare / Explorare cursuri)
- 4 carduri de acces rapid: **Elevi 0–4**, **Elevi 5–8**, **Formator** (cls. 0–4), **Profesor Gimnaziu** (cls. 5–8)
- Fiecare card duce la ruta relevantă (cursuri filtrate sau pagina formatori)
- Design adaptat pentru părinți și formatori ca audiență primară

### 2.2 Catalog cursuri (`/courses`)
- Listare cursuri publicate (status `published`, audience `children` sau `all`)
- **Căutare text instant** în timp real (client-side, fără reload): filtrare după titlu și descriere
- **Filtre grupă de vârstă**: Toate grupele / Clasele 0–4 / Clasele 5–8
- **Filtre tip lecție**: Video 🎬 / Prezentări 📋 / Activități 📝 / Quiz-uri 🎯
- La filtrare pe tip: se afișează pagina descriptivă a acelui tip (titlu, 2 paragrafe descriere, 5 itemi "Ce găsești aici")
- Sortare alfabetică implicită (A→Z)
- Formatori autentificate: filtrele de grupă sunt ascunse, grupa este forțată automat pe baza rolului (`formator`→0-4, `profesor`→5-8)
- Badge colorat informează cadrul didactic de filtrarea automată

### 2.3 Detaliu curs (`/courses/[slug]`)
- Titlu, descriere, grupă vârstă, durată estimată
- Lista modulelor și lecțiilor (titluri vizibile, conținut blocat pentru vizitatori)
- Buton "Încearcă" → redirect la login

### 2.4 Pagina Cadre Didactice (`/formatori`)
- Resurse separate per rol:
  - **Formator**: vede DOAR cursuri cu `audience = formator` (cu check `isApproved`)
  - **Profesor**: vede DOAR cursuri cu `audience = profesor` (cu check `isApproved`)
  - **Neautentificat/family**: vede toate resursele disponibile ca preview
- Conținut lecții blocat pentru formatori neaprobate

### 2.5 Pagini statice informaționale
- **`/despre`** — Prezentarea platformei, personajele Academia Politica AUR
- **`/help`** — Centru de ajutor complet cu 6 secțiuni acordeon:
  - Contul meu (Părinți)
  - Formatori
  - Copiii mei
  - Cursuri și lecții
  - Tehnic
  - Membri din grupuri
- Formular de contact în pagina /help → email livrat la ADMIN_EMAIL via Resend
- **`/paths`** — Trasee de instruire publice (lista)
- **`/paths/[slug]`** — Detaliu traseu: descriere, cursuri incluse în ordine
- **`/webinars`** — Lista webinariilor publice (titlu, dată, URL înregistrare)

### 2.6 Zona membri din grupuri (`/grup/*`)
- **`/grup`** — Landing page: elev introduce codul clasei (4-12 caractere alfanumerice)
- Validare cod în timp real via `GET /api/grup/verify?code=X`
- **`/grup/[code]`** — Lista elevilor din acea clasă (selectare după display_name)
- **`/grup/[code]/[studentCode]`** — Zona personală a elevului: lista cursurilor asignate clasei, acces la lecții

---

## 3. Autentificare și conturi

### 3.1 Înregistrare (`/register`)
- Formularul colectează: **Nume complet**, **Email**, **Parolă**, **Tip cont** (radio)
- Tipuri de cont selectabile: Părinte/Tutore / Formator cls. 0–4 / Profesor cls. 5–8
- La submit: `supabase.auth.signUp()` + creare `parent_profiles` (via callback)
- Email de confirmare trimis automat de Supabase Auth
- Conturi `family`: activ imediat după confirmare email
- Conturi `formator`/`profesor`: active dar cu acces restricționat până la aprobare admin

### 3.2 Login (`/login`)
- Email + parolă
- Redirect post-login: `/dashboard`
- Dacă user este admin și MFA activ: redirect la `/admin/mfa-verify`
- Error handling: mesaje clare pentru credențiale greșite, email neconfirmat

### 3.3 PKCE Auth flow (`/auth/callback`)
- Detectează parametrul `?code=` din URL
- Apelează `exchangeCodeForSession()` (Supabase SSR PKCE)
- Creează sau actualizează `parent_profiles` dacă nu există (funcție `ensureParentProfile`)
- Redirect la `/dashboard` după confirmare

### 3.4 Logout (`/logout`)
- Route handler POST
- `supabase.auth.signOut()` + ștergere cookie sesiune
- Redirect la `/`

### 3.5 MFA TOTP pentru admin
- **`/admin/mfa-setup`** — Pagina activare 2FA:
  - Generează secret TOTP
  - Afișează QR code pentru Google Authenticator / Authy
  - Verifică primul cod pentru confirmare
- **`/admin/mfa-verify`** — Verificare cod TOTP la fiecare login admin
- MFA obligatoriu pentru accesul la panoul de administrare

### 3.6 PIN profil cursant
- PIN opțional de 4 cifre per profil cursant
- Stocat ca hash în `child_profiles.pin_hash`
- **`/cursant/[profileId]/pin`** — Ecran de introducere PIN
- Sesiunea PIN salvată în `sessionStorage` cu expirare 8 ore
- Fără PIN: acces direct
- Cu PIN activat: la fiecare nouă sesiune sau după expirare se solicită re-introducerea

### 3.7 Middleware de protecție rute
- `middleware.ts` protejează: `/dashboard/*`, `/admin/*`, `/cursant/*`
- Utilizatorii neautentificați sunt redirectați la `/login`
- Admini fără MFA completat sunt redirectați la `/admin/mfa-verify`

---

## 4. Dashboard Părinte

### 4.1 Overview dashboard (`/dashboard`)
- Lista profilurilor de copii adăugate (CardCopil cu XP total și progres)
- XP total al fiecărui copil (din `certificates.total_points` — permanent)
- Buton "Adaugă profil cursant"
- **Banner informativ** pentru formatori neaprobate: "Contul tău este în așteptare de aprobare"
- Sidebar cu navigație adaptată per tip cont:
  - `family`: Dashboard, Cursuri disponibile, Ajutor
  - `formator`/`profesor`: Grupurile mele, Cursurile mele, Ajutor

### 4.2 Gestionare profiluri cursanți
- **Adăugare** (`/dashboard/profil`): display_name, grupă vârstă (0-4 sau 5-8), PIN opțional
- **Editare** (`/dashboard/edit-cursant/[profileId]`): actualizare display_name, grupă, PIN (schimbare/ștergere)
- **Ștergere** profil cu confirmare (cascade: progres, certificate, quiz attempts)

### 4.3 Progres detaliat (`/dashboard/progress/[childId]`)
- Lista tuturor cursurilor în care copilul are progres
- Per curs: număr lecții completate din total, procentaj, data ultimei activități
- Badges câștigate afișate cu iconuri

### 4.4 Editare cont (`/dashboard/profile`)
- Actualizare nume complet
- Schimbare parolă
- Afișare tip cont și stare aprobare (pentru formatori)

### 4.5 Preview lecții pentru părinți (`/dashboard/preview/[courseId]/lesson/[lessonId]`)
- Părintele poate vizualiza orice lecție din cursurile copilului
- Toate tipurile de conținut disponibile (video, prezentare, fișă, quiz)
- **Fără înregistrare progres sau XP** — exclusiv pentru verificare parentală
- Acces din pagina cursului cu buton "Previzualizează lecția"

### 4.6 Gestionare clase (pentru formatori)
- **`/dashboard/grupuri`** — Lista claselor active și arhivate
- **`/dashboard/grupuri/new`** — Creare clasă nouă (detalii în secțiunea 7)
- **`/dashboard/grupuri/[id]`** — Detaliu clasă (detalii în secțiunea 7)

---

## 5. Zona Copilului

### 5.1 Pagina principală copil (`/cursant/[profileId]`)
- Salut personalizat cu display_name
- **XP total** acumulat (din `certificates` — permanent, nu scade la replay)
- **Daily streak**: numărul zilelor consecutive de activitate (afișat cu flacără 🔥)
- **Curs activ**: cursul la care copilul lucrează în prezent (progres parțial)
- **Badges câștigate**: grid cu 9 insigne posibile (afișate colorat dacă câștigate, gri dacă nu)
- Link la transcript și certificate

### 5.2 Curs cu module și lecții (`/cursant/[profileId]/course/[courseId]`)
- Titlu și descriere curs
- Lista modulelor în ordine cu lecțiile lor
- Per lecție: iconă tip, titlu, status (Completată ✓ / În progress / Blocată 🔒)
- Lecțiile blocate: vizibile dar nu accesibile până la completarea celor precedente (acces secvențial)
- **Banner** pentru formatori neaprobate: "Contul tău nu a fost aprobat"
- Progress bar per modul (lecții completate / total)

### 5.3 Player lecție (`/cursant/[profileId]/course/[courseId]/lesson/[lessonId]`)
- **Layout server-side**: verifică aprobare cont înainte de randare (formatori neaprobate → redirect)
- Conținut adaptat per tip de lecție:

#### Video
- YouTube: embed standard `<iframe>` cu YouTube URL
- Google Drive: embed via `drive.google.com/file/d/ID/preview`
- Player responsive (aspect ratio 16:9)

#### Prezentare
- Google Drive Slides: embed via `docs.google.com/presentation/d/ID/embed`
- Google Drive PDF/file: embed via `drive.google.com/file/d/ID/preview`
- Viewer cu scroll, fullscreen disponibil

#### Fișă de lucru (Worksheet)
- Google Drive PDF: embed preview
- Buton "Deschide în Google Drive" pentru descărcare/imprimare

#### Quiz
- Randare întrebări cu variante de răspuns (radio buttons)
- Fiecare întrebare are 2-5 variante de răspuns
- Feedback per răspuns (corect/incorect + textul feedback-ului)
- Scor final calculat ca procent
- **Quiz gate 80%**: dacă scorul < 80%, lecția nu se marchează ca finalizată
- La nereușită: buton "Încearcă din nou"
- La reușită: overlay de felicitare + acordare XP

#### Mixed
- Conținut multiplu în aceeași lecție (ex: video + quiz)
- Randare în ordine configurată

### 5.4 Finalizare lecție și XP
- La completare (sau trecere quiz): `markLessonComplete()` în DB
- XP acordat: **10 puncte per lecție**
- La completare modul: **50 puncte bonus**
- La completare curs: **100 puncte bonus** + generare diplomă
- Overlay "Lecție finalizată!" cu animație și suma XP câștigat
- Progres sincronizat cu Dashboard-ul părintelui

### 5.5 Replay curs (`Reia cursul`)
- Buton disponibil pe paginile de curs și din transcript
- Resetează progresul lecțiilor (marchează ca `not_started`)
- **XP din diplome rămâne permanent** — nu se pierde la replay (stocat în `certificates.total_points`)
- Util pentru recapitulare sau re-parcurgere cu un copil diferit

### 5.6 Transcript (`/cursant/[profileId]/transcript`)
- Lista completă a cursurilor parcurse cu progres
- Per curs: procent de completare, data completării, XP câștigat
- Link la diploma de absolvire (dacă cursul e finalizat)

### 5.7 Diplomă printabilă (`/cursant/[profileId]/certificate/[certificateId]`)
- Diplomă individualizată cu: display_name, titlul cursului, data finalizării
- Design pregătit pentru imprimare (CSS print)
- Buton "Tipărește diploma"
- **Email automat**: la generarea diplomei, se trimite email la adresa părintelui cu linkul

---

## 6. Cadre Didactice

### 6.1 Flux de înregistrare și aprobare
1. Cadrul didactic se înregistrează la `/register` (selectează tip: Formator sau Profesor)
2. Primește email de confirmare Supabase
3. Se autentifică: vede dashboard-ul cu banner "Cont în așteptare"
4. Lecțiile sunt blocate (vizibile, dar fără acces la conținut)
5. Adminul aprobă contul din `/admin/approvals` sau `/admin/parents`
6. Din momentul aprobării: acces complet la cursuri + sistem de clase

### 6.2 Accesul la resurse didactice
- **`/formatori`** — Pagina publică cu cursuri specifice:
  - Formator (aprobat): vede DOAR cursuri cu `audience = formator`
  - Profesor (aprobat): vede DOAR cursuri cu `audience = profesor`
  - Neaprobat: vede titlurile, conținut blocat cu mesaj informativ
- **`/courses`** — Catalogul de cursuri pentru copii:
  - Formator: vede cursuri `children` + `all` din grupa `0-4`, filtrare automată
  - Profesor: vede cursuri `children` + `all` din grupa `5-8`, filtrare automată
  - Filtrul de grupă e ascuns (forțat automat)

### 6.3 Dashboard adaptat pentru formatori
- Sidebar special: **Grupurile mele** + **Cursurile mele** (în loc de "Cursuri disponibile")
- Header: link-ul "Copii" este ascuns (formator nu gestionează profiluri de copii)
- Banner aprobare vizibil pe tot dashboard-ul până la aprobare

### 6.4 Vizualizare cursuri și lecții
- Cadrul didactic aprobat accesează lecțiile exact ca un copil (player identic)
- Progresul cadrului didactic **nu** se înregistrează în baza de date (viewer mode)
- XP și gamificarea nu se aplică cadrelor didactice

---

## 7. Sistemul de Clase

### 7.1 Creare clasă (`/dashboard/grupuri/new`)
- Formularul: Denumire clasă, Cod de acces (4-12 caractere alfanumerice)
- Codul de acces este **unic global** — validat împotriva bazei de date la creare
- Codul e ales de profesor (nu generat automat) — recomandare: denumire scurtă + an (ex: `4A2026`)
- Clasa se creează cu status `active`, legată de user-id-ul profesorului

### 7.2 Gestionare clasă (`/dashboard/grupuri/[id]`)
**Tab Membri:**
- Lista elevilor din clasă (display_name, cod personal, grupă vârstă)
- Formular adăugare elev: display_name, cod elev (unic în clasă), grupă vârstă
- Ștergere elev cu confirmare
- Elev șters: progresul din `class_student_progress` se șterge în cascade

**Tab Cursuri:**
- Lista cursurilor asignate clasei
- Formular asignare curs: selectare din dropdown cu toate cursurile publicate
- Eliminare curs din clasă cu confirmare
- Ordinea cursurilor determinată de `order_index` din DB

**Arhivare clasă:**
- Buton "Arhivează clasa" (schimbă status → `archived`)
- Clasa arhivată dispare din lista activă dar datele rămân
- Elevii nu mai pot accesa /grup/[code] (codul devine invalid după arhivare)

### 7.3 Accesul elevilor (`/grup/*`)

**Flow complet:**
1. Elevul accesează `/grup` → introduce codul clasei (ex: `4A2026`)
2. Cod validat client-side via `GET /api/grup/verify?code=X`
3. Redirect la `/grup/4A2026` — lista elevilor din acea clasă
4. Elevul selectează propriul nume din lista afișată
5. Redirect la `/grup/4A2026/CODPERSONAL` — zona personală

**Zona personală a elevului:**
- Salut cu display_name
- Lista cursurilor asignate clasei (din `class_courses` + `class_student_progress`)
- Per curs: titlu, descriere, progres (lecții completate / total)
- Acces la lecțiile cursului
- Progresul se salvează în `class_student_progress` (separat de `progress`)

**Caracteristici cheie:**
- **Zero cont necesar** — elev accesează prin coduri, fără email sau parolă
- **Fără gamificare** — elevii din clase nu acumulează XP sau badges
- **Progres izolat** — în `class_student_progress`, nu afectează `progress` al profilurilor de copii

### 7.4 Diplome pentru membri din grupuri
- Tabel `class_student_certificates` (migration 007)
- Generare diplomă la finalizare curs din clasă
- Diplomă printabilă accesibilă din zona elevului

---

## 8. Gamificare și Recompense

### 8.1 Sistemul XP
| Acțiune | XP câștigat |
|---------|------------|
| Completare lecție | +10 XP |
| Completare modul | +50 XP bonus |
| Completare curs | +100 XP bonus |

- XP stocat în tabelul `certificates` (câmpul `total_points`)
- **XP permanent**: nu se pierde dacă copilul reia cursul (replay)
- La replay: progresul lecțiilor se resetează, XP acumulat rămâne

### 8.2 Daily Streak
- Zilele consecutive în care copilul a completat cel puțin o lecție
- Calculat din `progress.completed_at` (data cea mai recentă)
- Afișat pe pagina principală a copilului cu număr și flacără 🔥
- Se resetează la 0 dacă trece o zi fără activitate

### 8.3 Sistemul de Badge-uri (9 insigne)
| Badge | Condiție |
|-------|---------|
| 🌟 Prima lecție | Prima lecție completată |
| 📚 Cititor | 5 lecții completate |
| 🏆 Campion | 10 lecții completate |
| 🎯 Focus | 3 lecții consecutive în aceeași zi |
| 🌈 Explorer | Lecții din 3 cursuri diferite |
| ⚡ Rapid | 5 lecții în 24h |
| 🔥 Streak 7 | 7 zile consecutive |
| 💎 Streak 30 | 30 zile consecutive |
| 🎓 Absolvent | Primul curs finalizat complet |

- Badge-urile sunt afișate pe pagina copilului (colorate dacă câștigate, gri dacă nu)
- Câștigarea unui badge este permanentă

### 8.4 Diplomă de absolvire
- **Generare automată** la completarea tuturor lecțiilor dintr-un curs
- Stocată în tabelul `certificates`
- Accesibilă la `/cursant/[profileId]/certificate/[certificateId]`
- **Design printabil** cu CSS @media print dedicat
- Conține: display_name copil, titlul cursului, data finalizării, logo platformă
- **Email automat** trimis la adresa de email a părintelui cu link la diplomă

---

## 9. Panoul de Administrare

> Accesul la `/admin/*` necesită: autentificare + email în `ADMIN_EMAILS` (sau `app_metadata.role = admin`) + MFA TOTP completat.

### 9.1 Dashboard Admin (`/admin`)
- Statistici sumare: utilizatori totali, cursuri publicate, lecții, diplome emise
- Linkuri rapide la secțiunile principale
- Grafice simple (conturi noi, activitate recentă)

### 9.2 Statistici detaliate (`/admin/stats`)
- Utilizatori per tip cont (family, formator, profesor)
- Cursuri per status (draft, published) și audiență
- Progres: lecții completate în ultimele 7/30 zile
- Diplome emise total și recent

### 9.3 Gestionare utilizatori (`/admin/parents`)
- Tabel cu toți utilizatorii (family, formator, profesor)
- Coloane: Nume, Email, Tip cont, Aprobat, Data înregistrării
- **Aprobare inline**: buton "Aprobă" direct în tabel (fără pagină separată)
- **Editare cont** → `/admin/parents/[userId]/edit`
- **Adăugare cont** manual → `/admin/parents/add`
- Ștergere cont cu confirmare (cascade: copii, progres, certificate)

### 9.4 Editare cont utilizator (`/admin/parents/[userId]/edit`)
- Modificare Nume complet și Email
- **Schimbare tip cont**: family ↔ formator ↔ profesor
- Setare status aprobare (bifă Aprobat)
- Salvare cu validare Zod

### 9.5 Gestionare formatori (`/admin/teachers`)
- Lista distinctă pentru conturi `formator` și `profesor`
- Aceleași funcții ca `/admin/parents`
- **Editare cont profesor** → `/admin/teachers/[userId]/edit`: full_name, email, account_type (formator↔profesor)
- Ștergere cont formator cu confirmare

### 9.6 Aprobare conturi (`/admin/approvals`)
- Lista conturilor de formatori cu `approved = false`
- Aprobare rapidă cu un singur buton
- Email de notificare planificat (WP15, în backlog)

### 9.7 Gestionare profiluri cursanți (`/admin/children`)
- Lista tuturor profilurilor de copii
- Informații: display_name, grupă vârstă, cont părinte
- Ștergere profil (cascade: progres, certificate)

### 9.8 Gestionare administratori (`/admin/administrators`)
- Lista conturilor cu rol admin
- Vizibilitate: cine are acces la panou

### 9.9 MFA Setup Admin (`/admin/mfa-setup`)
- Generare secret TOTP
- QR code pentru authenticator
- Verificare cod de confirmare
- Salvare factor în Supabase Auth

---

## 10. Gestionarea Conținutului

### 10.1 CRUD Cursuri

**Listing** (`/admin/courses`):
- Tabel cu toate cursurile (draft + publicate), organizat pe categorii:
  - Copii Clasele 0–4
  - Copii Clasele 5–8
  - Resurse Formatori
  - Resurse Profesori Gimnaziu
- **Filtre per coloană**: căutare text în titlu (instant), select status (Draft/Publicat/Toate), select grupă vârstă
- **Toggle status inline** (StatusToggleBadge): click pe badge "Publicat"/"Draft" schimbă statusul fără reload
- Sortare alfabetică
- Buton creare curs nou

**Creare** (`/admin/courses/new`):
- Câmpuri: Titlu, Slug (auto-generat din titlu), Descriere, Grupă vârstă (0-4/5-8), **Audiență** (children/formator/profesor/all), Durată estimată, Status (draft/published)
- Validare Zod: titlu minim 3 caractere, slug format URL valid

**Editare** (`/admin/courses/[id]/edit`):
- Toate câmpurile de la creare
- Modificare audiență (ex: din `children` în `formator`)
- Buton **Șterge curs** cu confirmare → redirect la `/admin/courses` (nu 404)

**Detaliu curs** (`/admin/courses/[id]`):
- Lista modulelor cu lecțiile lor
- Buton adăugare modul
- Navigare la editare modul/lecție
- Buton **Șterge curs** (duplicat pentru acces rapid)
- **Publicare/Retragere** curs cu un click

### 10.2 CRUD Module (`/admin/courses/[id]/modules/[moduleId]`)
- Câmpuri: Titlu, Descriere, Ordine (order_index)
- Lista lecțiilor din modul
- Buton adăugare lecție
- Ștergere modul cu confirmare (cascade: lecții, quiz-uri, progres)

### 10.3 CRUD Lecții (`/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]`)
- **Câmpuri generale**: Titlu, Descriere, Tip lecție (video/presentation/worksheet/quiz/mixed), Durată (minute), Ordine
- **Câmpuri conținut** (afișate indiferent de tip, pentru flexibilitate):
  - **Video URL**: YouTube sau Google Drive — câmp hibrid URL manual + buton Google Picker
  - **Prezentare URL**: Google Drive Slides/PDF — câmp hibrid URL manual + buton Google Picker
  - **Fișă de lucru URL**: Google Drive PDF — câmp hibrid URL manual + buton Google Picker
- **Câmpuri editorial**: AI Generated (bifă), Human Reviewed (bifă), Notițe reviewer
- **Status lecție**: draft / reviewed / published
- Salvare cu Server Action + `revalidatePath`

### 10.4 Editor Quiz (`/admin/courses/.../quiz`)
- **Import automat** din DOCX/PDF/TXT:
  - Parsing regex pentru formate standard (Q:/A:/Corect:)
  - Fallback Groq AI (llama3-70b) dacă regex nu extrage nimic
  - Preview înainte de salvare
- **Editare manuală**:
  - Adăugare/editare/ștergere întrebări
  - Per întrebare: text + 2-5 variante de răspuns + marcarea variantei corecte + feedback text
  - Reordonare întrebări (order_index)
- Salvare quiz complet (upsert întrebări + răspunsuri)
- Quiz legat de lecție prin `lesson_id`

### 10.5 Publicare și control status
- **Cursuri**: status `draft` → `published` (și invers) cu un click
- **Webinarii**: același mecanism
- **Toggle inline** pe lista de cursuri (StatusToggleBadge): UX instant fără navigare
- **Butoane PublishButtons** pe paginile de detaliu
- Efectele publicării:
  - Curs draft: vizibil DOAR în admin
  - Curs published: apare în catalog public (respectând filtrul de audiență)

### 10.6 CRUD Trasee de instruire (`/admin/paths`)
- Creare traseu: titlu, descriere, slug
- Adăugare cursuri la traseu (cu ordine)
- Publicare/retragere traseu
- Pagina publică `/paths` afișează toate traseele publicate

### 10.7 CRUD Webinarii (`/admin/webinars`)
- Creare webinar: titlu, descriere, URL înregistrare/streaming, dată, status
- Editare webinar (`/admin/webinars/[id]/edit`)
- Publicare/retragere
- Pagina publică `/webinars` afișează webinariile publicate

### 10.8 Ștergere cu siguranță (DeleteButton)
- Component `DeleteButton` cu:
  - `window.confirm()` pentru confirmare utilizator
  - Alertă cu mesaj specific de eroare (dacă ștergerea eșuează)
  - Prop opțional `redirectTo`: după ștergere reușită, `router.push(redirectTo)` — evită 404
- Cascade delete configurat în schema DB (foreign keys)

---

## 11. Instrumente AI

### 11.1 Import Curriculum AI (`/admin/curriculum-import`)
**Funcționare:**
1. Admin uploadează fișier DOCX sau PDF
2. Textul este extras (mammoth pentru DOCX, pdf-parse pentru PDF cu DOMMatrix polyfill)
3. Textul trimis la Groq API (model `llama3-70b-8192`) cu prompt structurat
4. Groq returnează JSON în `response_format: { type: "json_object" }` (JSON mode forțat)
5. JSON parsat și validat:
   - Funcție `extractJson()` cu 3 strategii (JSON direct, cod fenced, substring)
   - Structura validată: `{ title, description, age_group, modules: [{title, lessons:[...]}] }`
6. **Duplicate detection**: verificare dacă există curs cu titlu similar (ilike query)
7. La confirmare: creare curs draft + module + lecții goale în DB
8. Admin editează manual lecțiile adăugate (adaugă URL-uri conținut)

**Parametri Groq:**
- Temperature: 0.1 (deterministică)
- Max tokens: 4000
- Response format: JSON object (evită text înainte/după JSON)

### 11.2 Import Quiz AI (`POST /api/admin/parse-quiz`)
**Funcționare:**
1. Admin uploadează fișier DOCX/PDF/TXT în editorul quiz
2. Text extras din fișier
3. **Strategie 1 — Regex**: caută pattern-uri standard `Q:`, `A:`, `Corect:`, `Feedback:`
4. **Strategie 2 — Groq AI** (fallback dacă regex extrage < 1 întrebare):
   - Prompt structurat pentru extragere quiz
   - Returnează array de întrebări cu variante și răspuns corect
5. Preview afișat în editor pentru verificare
6. La confirmare: salvare în tabelul `quiz_questions` + `quiz_answers`

---

## 12. Integrare Google Drive

> **Status:** Codul este complet implementat. Necesită configurare manuală (WP11 pending).

### 12.1 Autentificare OAuth2
- **`GET /api/admin/drive/auth`** — generează URL de autorizare Google
- Redirect la Google OAuth2 consent screen
- **`GET /api/admin/drive/callback`** — primește code, schimbă pe tokens
- `refresh_token` salvat în tabelul `admin_settings` (cheie `google_drive_refresh_token`)
- Token valabil permanent (refresh automat)

### 12.2 Pagina setări Google Drive (`/admin/settings/google-drive`)
- Status conexiune: Conectat / Neconectat
- Buton "Conectează Google Drive" → inițiază OAuth2 flow
- Buton "Deconectează" → șterge refresh_token din DB

### 12.3 Google Picker (selecție fișiere)
- **`GET /api/admin/drive/token`** — returnează access_token proaspăt (client-safe, expiră în 1h)
- Component client-side `GooglePickerButton` deschide Google Picker nativ
- Admin selectează fișier vizual din interfața Google Drive
- URL-ul fișierului selectat e inserat automat în câmpul corespunzător
- Funcționează pentru: video Drive, prezentări, fișe de lucru

### 12.4 Câmpuri hibrid URL + Picker (`GoogleDriveLinkField`)
- Per câmp de conținut (video_url, presentation_url, worksheet_url):
  - Input text pentru URL manual (YouTube, Drive link copiat)
  - Buton Google Picker (dacă Drive conectat)
  - Label dinamic: detectează tipul URL și afișează "YouTube", "Google Drive", "Link extern"
- Funcție `getGoogleDriveEmbedUrl()`: convertește URL-uri Drive în URL-uri embed corecte
  - Slides: `docs.google.com/presentation/d/ID/embed`
  - File/Video: `drive.google.com/file/d/ID/preview`

### 12.5 Organizare automată foldere (în backlog — WP13)
- Câmpuri `drive_folder_id` pregătite pe courses, modules, lessons (migration 009)
- Logica de creare automată folder la creare curs/modul (nu implementat în MVP)

---

## 13. Email și Notificări

### 13.1 Email diplomă (`Resend`)
- Trimis **automat** la finalizarea unui curs de copil
- Destinatar: adresa de email a contului de părinte
- Conține: felicitare, display_name copil, titlul cursului, link la diplomă printabilă
- Template HTML de bază (personalizabil)

### 13.2 Raport săptămânal progres (`/api/cron/weekly-report`)
- **Cron Vercel**: rulează în fiecare **luni la 08:00 UTC**
- Pentru fiecare cont de familie:
  - Colectează progresul copiilor din ultima săptămână
  - Număr lecții completate, cursuri finalizate, XP câștigat
  - Email trimis via Resend dacă există activitate
- Protejat cu `TEST_EMAIL_SECRET` pentru testare manuală

### 13.3 Formular contact (`/help`)
- Câmpuri: Nume, Email, Mesaj
- Submit → `POST /api/contact` (Server Action)
- Email livrat la `ADMIN_EMAIL` via Resend
- Confirmare vizuală la trimitere reușită

### 13.4 Emailuri planificate (backlog — WP15)
- Email de aprobare cont formator (la momentul aprobării de admin)
- Email de bun venit la înregistrare
- Notificare admin la înregistrare cont nou de formator

---

## 14. UI/UX și Accesibilitate

### 14.1 Header și navigație
- **Header sticky** cu logo, navigație principală și butoane de acțiune
- Navigație adaptată per stare autentificare și tip cont:

| Link | Vizibil pentru |
|------|----------------|
| Despre platformă | Toți |
| Cursuri | Toți |
| Formatori | Toți |
| Ajutor | Toți |
| **Intră în grup** (verde) | Toți (desktop + mobil) |
| Copii | Doar `family` (ascuns pentru `formator`/`profesor`) |
| Admin | Doar admini |
| Dashboard | Utilizatori autentificați |
| Login / Înregistrare | Vizitatori |

- Fallback `account_type`: citit din `user.user_metadata` dacă `parent_profiles.account_type` e null (funcționează fără re-login)

### 14.2 Chat widget FAQ (`/components/common/chat-widget.tsx`)
- Widget flotant în colțul dreapta-jos, pe toate paginile publice
- **Zero API**: răspunsuri statice, nu apelează niciun LLM
- Interfață de chat simulată (bule de mesaj, timestamps)
- 4 sugestii rapide: "Cum creez un cont?", "Ce sunt clasele virtuale?", "Cum funcționează quiz-ul?", "Resurse formatori"
- 12+ întrebări frecvente preconfigurate cu răspunsuri complete
- Linkuri interne la `/help` pentru detalii

### 14.3 Componente UI principale
- **CourseCard** — card curs cu imagine, titlu, descriere, grupă vârstă, buton acțiune
- **CourseGridClient** — grid cursuri cu căutare text instant (client-side)
- **AdminCoursesTable** — tabel admin cu filtre per coloană
- **StatusToggleBadge** — badge click-to-toggle Draft↔Publicat cu `useTransition`
- **DeleteButton** — cu confirmare, alert eroare, redirect opțional
- **VideoEmbed** — player video adaptiv (YouTube + Google Drive)
- **PresentationViewer** — embed Google Drive Slides/PDF
- **QuizPlayer** — quiz interactiv cu feedback și scor
- **LessonCompleteOverlay** — overlay animat la finalizare lecție cu XP

### 14.4 Design system
- **Tailwind CSS v4** cu utility classes
- **shadcn/ui** pentru componente UI de bază (Button, Input, Select, Dialog, etc.)
- Paletă de culori:
  - Teal/verde: elevi 0–4 și butonul "Intră în grup"
  - Indigo/albastru: elevi 5–8
  - Amber/orange: accente și gamificare
  - Gray: neutru, stări disabled
- Design responsive: mobile-first, breakpoints sm/md/lg

### 14.5 Performanță
- Server Components by default (Next.js App Router)
- Client Components strict necesare pentru interactivitate (state, events)
- `Suspense` boundaries cu fallback skeleton (loading states)
- Filtrare client-side cu `useMemo` (fără round-trip server pentru search)
- `useTransition` pentru mutații non-blocante (status toggle, delete)
- Sortare DB-side (ORDER BY title) pentru consistency

---

## Anexă: Baza de date — tabele și scop

| Tabel | Scop |
|-------|------|
| `parent_profiles` | Conturi utilizatori (family/formator/profesor), câmpul `approved` |
| `child_profiles` | Profiluri cursanți legate de parent, PIN hash, grupă vârstă |
| `courses` | Cursuri cu status, audiență, grupă vârstă, slug |
| `modules` | Module ale cursurilor cu ordine |
| `lessons` | Lecții cu tip, URL-uri conținut, status editorial |
| `quizzes` | Quiz-uri legate de lecții |
| `quiz_questions` | Întrebările din quiz-uri |
| `quiz_answers` | Variantele de răspuns (cu is_correct) |
| `quiz_attempts` | Încercări quiz per profil cursant cu scor |
| `progress` | Progres lecție per profil cursant (not_started/in_progress/completed) |
| `certificates` | Diplome de absolvire curs + XP total permanent |
| `classes` | Clasele create de formatori (cod acces unic) |
| `class_students` | Elevii dintr-o clasă (display_name + cod personal) |
| `class_courses` | Cursurile asignate unei clase |
| `class_student_progress` | Progresul elevilor din clase (separat de `progress`) |
| `class_student_certificates` | Diplome pentru membri din grupuri |
| `learning_paths` | Trasee de instruire |
| `learning_path_courses` | Cursurile dintr-un traseu cu ordine |
| `webinars` | Webinariile platformei |
| `webinar_registrations` | Înregistrări participanți webinar |
| `admin_settings` | Setări cheie-valoare (ex: Google Drive refresh_token) |

---

*Document generat: 2026-05-22 | Versiune MVP 1.0*  
*Actualizare necesară la: WP12 (clase v2), WP13 (Drive automat), WP14 (UI/UX), WP15 (email)*
