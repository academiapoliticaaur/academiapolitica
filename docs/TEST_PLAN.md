# Plan de testare — Platforma Academia Politica AUR

> Versiune: 2026-06-14 | Total: 196 teste manuale  
> Stack: Next.js 16 + Supabase + TypeScript + Tailwind  
> Tipuri conturi: `family` | `formator` | `profesor` | `admin`

---

## Legende

| Simbol | Semnificație |
|--------|-------------|
| ✅ | Test trecut |
| ❌ | Test eșuat |
| ⏭ | Skip / N/A |
| 🔴 | Blocker critic |
| 🟡 | Defect minor |

---

## 1. AUTENTIFICARE & ÎNREGISTRARE

### 1.1 Înregistrare cont nou

| # | Test | Date intrare | Rezultat așteptat | Status |
|---|------|-------------|-------------------|--------|
| T1 | Înregistrare cont `family` | email valid, parolă 8+ caractere | Email confirmare trimis, redirect `/login` | |
| T2 | Înregistrare cont `formator` | email valid, tip formator | Email admin trimis, cont în așteptare aprobare | |
| T3 | Înregistrare cont `profesor` | email valid, tip profesor | Email admin trimis, cont în așteptare aprobare | |
| T4 | Email deja existent | email existent în DB | Eroare afișată, fără cont duplicat | |
| T5 | Parolă prea scurtă | parolă < 8 caractere | Validare blocată, mesaj eroare specific | |
| T6 | Fără acceptare termeni | checkbox nebisat | Formular respins, mesaj validare | |
| T7 | Email invalid | `abc@` sau `test` | Validare HTML5/Zod blocată înainte de submit | |

### 1.2 Confirmare email (callback `/auth/callback`)

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T8 | Click link confirmare email (cont family) | Sesiune activată, trial 7 zile activat, redirect `/dashboard` | |
| T9 | Link confirmare expirat (>24h) | Redirect `/login?error=confirmare_esuata` | |
| T10 | Link confirmare folosit deja (replay) | Eroare graceful, redirect login fără crash | |
| T11 | Verificare trial activat în DB (family) | `subscription_plan='trial'`, `subscription_expires_at = now+7d` | |
| T12 | Verificare trial NU activat (formator) | `subscription_plan=null` pentru cont profesor/formator | |

### 1.3 Autentificare

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T13 | Login corect cont family | Redirect `/dashboard` | |
| T14 | Login corect cont profesor/formator | Redirect `/dashboard/grupuri` | |
| T15 | Login corect admin | Redirect `/dashboard` (buton Admin vizibil în header) | |
| T16 | Parolă greșită | Eroare "credențiale invalide", fără detalii tehnice | |
| T17 | Email inexistent | Eroare fără a dezvălui existența contului | |
| T18 | Cont neconfirmat prin email | Eroare specifică "confirmă emailul" | |

### 1.4 Deconectare & inactivitate

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T19 | Click "Deconectare" | Sesiune ștearsă, redirect `/login` | |
| T20 | Inactivitate 30 min | Auto-logout cu popup avertizare prealabilă | |
| T21 | Acces rută protejată fără sesiune | Redirect `/login` cu `?redirectTo` | |

---

## 2. DASHBOARD FAMILIE (Părinți)

### 2.1 Bannere abonament

| # | Test | Condiție | Banner așteptat | Status |
|---|------|----------|-----------------|--------|
| T22 | Trial activ, >7 zile rămase | `plan=trial`, `expires_in > 7` | 🎁 Violet "Trial gratuit activ" | |
| T23 | Trial expiră în 5 zile | `plan=trial`, `expires_in = 5` | ⏰ Amber "Trial expiră în 5 zile" | |
| T24 | Trial expiră mâine | `plan=trial`, `expires_in = 1` | ⚠️ Roșu "Trial expiră mâine!" | |
| T25 | Plan plătit activ, mult timp | `plan=monthly`, 20 zile rămase | ✅ Verde "Abonament activ" | |
| T26 | Plan plătit expiră în 5 zile | orice plan, `expires_in = 5` | ⏰ Amber cu data expirării | |
| T27 | Fără abonament și fără cerere | `plan=null`, fără `subscription_requests` | Banner indigo cerere abonament | |
| T28 | Cerere abonament în așteptare | `sub_request.status=pending` | Banner "Cerere trimisă, în așteptare" | |
| T29 | Admin logat | `isAdmin=true` | Niciun banner abonament afișat | |

### 2.2 Gestiune copii

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T30 | Profil cursant cu date valide (nume + grupă vârstă) | Copil creat, apare imediat în dashboard | |
| T31 | Profil cursant fără nume | Eroare validare, formular respins | |
| T32 | Editare profil cursant (nume, grupă vârstă) | Date actualizate, afișate corect | |
| T33 | Setare PIN parental 4 cifre | PIN setat (hash SHA256 în DB), confirmat la intrare zonă copil | |
| T34 | Schimbare PIN existent | Noul PIN funcționează, vechiul PIN respins | |
| T35 | Ștergere copil cu confirm dialog | Copil + progres + certificate șterse în cascadă | |
| T36 | Counter progres săptămânal per copil | Număr lecții completate de luni până azi, corect | |

### 2.3 Cereri abonament self-service

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T37 | Cerere abonament plan `monthly` | Email admin trimis, status `pending` în DB | |
| T38 | Anulare cerere în așteptare | Rândul șters din `subscription_requests`, banner dispare | |
| T39 | Cerere dublă (deja pending) | Mesaj "ai deja o cerere în așteptare", nou insert blocat | |

---

## 3. ZONA COPILULUI (`/cursant/[profileId]`)

### 3.1 Acces cu PIN parental

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T40 | PIN corect | Cookie `child_session` setat 8h, acces la zona cursantului | |
| T41 | PIN greșit (3 cifre, altele) | Eroare afișată, fără acces | |
| T42 | PIN setat, cookie expirat (>8h) | Redirect la pagina PIN entry | |
| T43 | Fără PIN setat | Acces direct fără PIN entry | |
| T44 | URL manipulation: alt `profileId` | `notFound()` sau redirect, cookie validat per profileId | |

### 3.2 Navigare cursuri copil

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T45 | Lista cursuri disponibile | Filtrare pe `age_group` copilului, doar published | |
| T46 | Curs cu abonament expirat | Curs locked sau redirect cu mesaj | |
| T47 | Acces lecție deja finalizată | Poate revedea, progres menținut | |
| T48 | Ordinea lecțiilor în modul | Sortate după `order_index` ASC | |

### 3.3 Lecții video

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T49 | Video YouTube embed | Player YouTube afișat corect | |
| T50 | Video Google Drive embed | Player Drive embed afișat, bara superioară blocată | |
| T51 | URL video invalid/lipsă | Mesaj eroare graceful, fără crash | |
| T52 | Buton "Lecție completată" | Progress salvat în `progress`, overlay finalizare afișat | |

### 3.4 Prezentare Viewer

| # | Test | Dispozitiv | Rezultat așteptat | Status |
|---|------|-----------|-------------------|--------|
| T53 | Google Slides embed | desktop | Prezentare afișată în iframe, navigare slide funcțională | |
| T54 | PDF Google Drive embed | desktop | PDF preview afișat cu scroll | |
| T55 | Fullscreen toggle | desktop | Overlay fullscreen, ESC sau buton X închide | |
| T56 | Fullscreen pe mobil | 375px | Ocupă tot ecranul `inset-0` (fără margini) | |
| T57 | Înălțime responsivă | 375/768/1024px | 320px / 480px / 600px | |
| T58 | Descărcare material (`allowDownload=true`) | desktop | Buton Download vizibil, fișier descărcabil | |
| T59 | Fără descărcare (`allowDownload=false`) | desktop | Buton Download absent | |

### 3.5 Quiz Player

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T60 | Quiz cu 3 întrebări | Afișate în ordine, max 1 răspuns selectat per întrebare | |
| T61 | Răspuns corect selectat | Feedback verde, XP acordat | |
| T62 | Răspuns greșit selectat | Feedback roșu, arată răspunsul corect | |
| T63 | Submit fără a selecta răspuns | Validare: buton disabled sau warning | |
| T64 | Score calculat corect | `score/total_questions` salvat în `quiz_attempts` | |
| T65 | Quiz refăcut | Score actualizat, cel mai bun scor păstrat (sau ultimul) | |

### 3.6 Certificate copil

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T66 | Finalizare ultimei lecții din curs | Overlay certificat afișat automat | |
| T67 | Certificat creat în DB | Row în `certificates` cu `issued_at` | |
| T68 | Pagina certificat accesibilă | `/cursant/[id]/certificate/[certId]` randează certificatul | |
| T69 | Buton print certificat | Dialog print browser deschis | |

---

## 4. ZONA CLASĂ (`/grup/*`) — Fără autentificare

### 4.1 Intrare clasă

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T70 | Cod grup valid și activ | Lista elevi afișată | |
| T71 | Cod grup invalid (inexistent) | Eroare "Clasă negăsită" | |
| T72 | Cod grup arhivat | Acces blocat cu mesaj | |
| T73 | Selectare elev din listă | Dacă PIN setat → input PIN; altfel → acces direct | |
| T74 | PIN elev corect | Cookie sesiune clasă setat, acces la cursuri | |
| T75 | PIN elev greșit | Eroare, fără acces | |

### 4.2 Lecții și progres în clasă

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T76 | Finalizare lecție → `POST /api/grup/progress` | Row în `class_student_progress` cu `status=completed` | |
| T77 | Progres persistent la revenire în clasă | Lecție marcată completă, nu se poate reimarca | |
| T78 | Certificat student la finalizare curs | Row în `class_student_certificates` | |
| T79 | URL manipulation (alt studentCode) | Cookie validat per student, acces blocat | |

---

## 5. DASHBOARD CADRE DIDACTICE

### 5.1 Gestiune clase

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T80 | Creare clasă nouă | Clasă creată cu `access_code` unic de 6 caractere | |
| T81 | Editare clasă (nume, an școlar) | Date actualizate | |
| T82 | Arhivare clasă | Status `archived`, dispare din lista activă | |
| T83 | Adăugare elev (cod generat din inițiale) | `student_code` unic generat, PIN 4 cifre random | |
| T84 | Cod duplicat → suffix numeric | `AB`, `AB1`, `AB2` — unicitate garantată | |
| T85 | Editare elev (nume, grupă) | Date actualizate | |
| T86 | Regenerare PIN elev | PIN nou generat, PIN vechi invalid | |
| T87 | Ștergere elev | Elev + progres clasei șterse | |
| T88 | Asignare curs la clasă | Curs apare în clasă și la elevi pe `/grup` | |
| T89 | Reordonare cursuri (buton sus/jos) | `order_index` swap-at, ordinea persistată | |
| T90 | Scoatere curs din clasă | Curs nu mai apare la elevi | |

### 5.2 Tab Progres clasă

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T91 | Tabel elevi × cursuri cu procente | Procente corecte, bazate pe `class_student_progress` | |
| T92 | Export CSV progres | Fișier CSV descărcat cu toate datele | |
| T93 | Export CSV — clasă fără elevi | CSV cu header, fără rânduri de date | |
| T94 | Ultima activitate per elev | Data corectă din `class_student_progress.completed_at` | |

### 5.3 Banner abonament profesori

| # | Test | Condiție | Rezultat așteptat | Status |
|---|------|----------|-------------------|--------|
| T95 | Fără abonament activ | `subscription_expires_at=null` | Banner indigo "Activează abonament" | |
| T96 | Abonament expiră în ≤7 zile | `expires_in ≤ 7` | Banner amber avertizare | |

---

## 6. PANOU ADMIN

### 6.1 Acces & gardă admin

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T97 | Email ne-admin accesează `/admin` | Redirect `/dashboard` | |
| T98 | Utilizator neautentificat accesează `/admin` | Redirect `/login` | |
| T99 | Admin logat | Dashboard admin accesibil | |
| T100 | Badge pending în sidebar | Număr corect: conturi neaprobate + cereri abonament pending | |

### 6.2 Gestiune cursuri

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T101 | Creare curs cu toate câmpurile | Curs creat cu `status=draft` | |
| T102 | Publicare curs | `status=published`, vizibil în catalog public | |
| T103 | Draft curs publicat | Dispare din catalog, inaccesibil copiilor | |
| T104 | Adăugare modul la curs | Modul creat cu `order_index` corect | |
| T105 | Reordonare module (drag-drop) | Ordinea persistată în DB | |
| T106 | Adăugare lecție video | Lecție cu `lesson_type=video`, URL salvat | |
| T107 | Adăugare lecție prezentare | URL Google Drive validat | |
| T108 | Adăugare lecție quiz | Lecție cu `lesson_type=quiz` | |
| T109 | Publicare lecție individuală | `status=published`, vizibilă copiilor | |
| T110 | Publicare toate lecțiile unui curs | Toate lecțiile set `status=published` în bulk | |
| T111 | Soft delete lecție | `deleted_at` setat, dispare din curs, apare în Trash | |
| T112 | Restore lecție din Trash | `deleted_at=null`, reapare în curs | |
| T113 | Delete permanent lecție | Șters definitiv din DB, nu mai e în Trash | |
| T114 | Preview lecție din admin | `/dashboard/preview/[courseId]/lesson/[id]` funcțional | |

### 6.3 Quiz Editor

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T115 | Creare quiz la lecție | Quiz creat, asociat `lesson_id` | |
| T116 | Adăugare întrebare | Întrebare adăugată cu `order_index` auto | |
| T117 | Adăugare 4 variante răspuns | Răspunsuri salvate | |
| T118 | Setare răspuns corect | `is_correct=true` pe unul, `false` pe ceilalți | |
| T119 | Ștergere întrebare | Cascadă: răspunsuri șterse împreună | |
| T120 | Import quiz din PDF/doc cu AI (Groq) | Întrebări parsate, preview afișat, import confirmat | |

### 6.4 Gestiune utilizatori

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T121 | Aprobare cont `formator` | `approved=true`, email confirmare trimis utilizatorului | |
| T122 | Aprobare bulk 5 conturi simultan | Toate aprobate, fiecare înregistrat în audit log | |
| T123 | Respingere cerere abonament | `status=rejected`, email notificare utilizator | |
| T124 | Aprobare cerere abonament `monthly` | Abonament activat 30 zile, email utilizator | |
| T125 | Aprobare bulk 3 cereri abonament | Toate activate, toate înregistrate în audit | |
| T126 | Ștergere părinte | Cascadă: copii + progres + certificate + auth user | |
| T127 | Ștergere formator | Profil + auth user șterse | |
| T128 | Search părinți (filtru text live) | Filtrare în timp real după nume/email | |
| T129 | Paginare tabel (25 rânduri/pagină) | Navigare prev/next funcțională, count corect | |

### 6.5 Gestiune abonamente (admin panel)

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T130 | Activare manuală abonament `annual` | `expires_at = now+365d`, `activated_by = admin_id` | |
| T131 | Dezactivare abonament activ | `plan=null`, `expires_at=null` | |
| T132 | Modificare plan activ (monthly → quarterly) | Plan și dată actualizate corect | |

### 6.6 Audit Log

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T133 | Aprobare cont → înregistrare automată | Action `approve_account` în `admin_audit_log` | |
| T134 | Ștergere utilizator → înregistrare | Action `delete_user` cu `details.userId` | |
| T135 | Aprobare abonament → înregistrare | Action `approve_subscription` cu plan | |
| T136 | Pagina Audit Log `/admin/audit-log` | Ultimele 200 acțiuni, email admin rezolvat din UUID | |
| T137 | Tabel `admin_audit_log` lipsă (migrație neaplicată) | Empty state cu instrucțiuni, fără crash | |

### 6.7 Statistici

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T138 | `/admin/stats` încărcată corect | Contoare: utilizatori, cursuri, progres afișate | |

### 6.8 Import Curriculum AI

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T139 | Upload document cu structură validă (DOCX/TXT) | Curriculum parsat cu AI, preview secțiuni afișat | |
| T140 | Import confirmat | Module + lecții create în DB cu `ai_generated=true` | |
| T141 | Quiz parsat din document | Quiz creat cu întrebări și răspunsuri | |
| T142 | Fișier invalid (imagine, binar) | Eroare graceful, fără crash server | |
| T143 | Groq API indisponibil | Mesaj eroare clar, fără crash | |

### 6.9 Google Drive Integration

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T144 | OAuth Google Drive (flow complet) | Token salvat în `admin_settings`, status "Conectat" afișat | |
| T145 | Google Picker în editare lecție | Picker Drive deschis, fișier selectat → URL salvat | |
| T146 | Creare folder Drive pentru curs | Folder creat, `drive_folder_id` salvat pe `courses` | |
| T147 | Upload fișier lecție în Drive | URL Drive salvat în `lesson.presentation_url` | |
| T148 | Publish lecție cu `allow_download=false` | Permisiunile Drive restricționate prin API | |

---

## 7. PAGINA PROGRES COPIL (`/dashboard/progress/[childId]`)

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T149 | Bară progres general cu gradient | Procent corect: `completedIds.size / totalLessons * 100` | |
| T150 | Grafic activitate 7 zile | Bare proporționale cu lecțiile per zi, ziua curentă albastru | |
| T151 | Zero activitate în ultimele 7 zile | Grafic cu bare plate, mesaj "Nicio activitate" | |
| T152 | Module expandabile per curs (`<details>`) | Click pe modul expandează lista lecțiilor | |
| T153 | Bară progres per modul | `done/total` corect, teal la 100%, albastru altfel | |
| T154 | Lecție completată afișată | CheckCircle verde, data completării, quiz score | |
| T155 | Lecție necompletată | Cerc gri, titlu estompat | |
| T156 | Curs finalizat complet | 🏅 emoji + XP afișat în header card | |
| T157 | Alt parent încearcă `childId` al altcuiva | `notFound()` — acces complet blocat | |

---

## 8. ZONA PUBLICĂ

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T158 | Homepage fără autentificare | Pagina publică accesibilă, niciun redirect | |
| T159 | Catalog cursuri `/courses` | Doar cursuri cu `status=published` afișate | |
| T160 | Filtrare cursuri pe grupă vârstă | Filtrare corectă (0-4 vs 5-8) | |
| T161 | Demo lecție `/demo/[slug]/lesson/[id]` | Vizibil fără autentificare | |
| T162 | Pagina `/preturi` | 3 carduri plan, secțiune FAQ, mențiune trial 7 zile | |
| T163 | CTA "Încearcă gratuit 7 zile" | Redirect corect la `/register` | |
| T164 | Link "Prețuri" în header (neautentificat) | Vizibil în nav desktop și mobil | |
| T165 | Link "Prețuri" ascuns (autentificat) | Nu apare în nav pentru utilizatori logați | |
| T166 | Pagina Learning Paths `/paths` | Trasee cu `status=published` afișate | |
| T167 | Pagina Webinare `/webinars` | Webinare cu `status=published` afișate | |
| T168 | Formular Contact `/help` | Email trimis la admin via Resend | |
| T169 | Pagina Cadre Didactice `/formatori` | Accesibilă public, CTA înregistrare | |

---

## 9. CRON JOBS & EMAIL

| # | Test | Condiție | Rezultat așteptat | Status |
|---|------|----------|-------------------|--------|
| T170 | `GET /api/cron/weekly-report` | Bearer `CRON_SECRET` valid | Email trimis părinților cu `email_reports=true` și progres >0 | |
| T171 | `GET /api/cron/weekly-report` | Bearer invalid / lipsă | 401 Unauthorized | |
| T172 | `GET /api/cron/weekly-report` | Fără progres săptămâna curentă | Email omis pentru acel utilizator | |
| T173 | `GET /api/cron/subscription-reminder` | Abonament expiră în 7 zile fix | Email de avertizare trimis | |
| T174 | `GET /api/cron/subscription-reminder` | Abonament expiră mâine (1 zi) | Email urgent trimis | |
| T175 | `GET /api/cron/subscription-reminder` | Abonament expiră în 3 zile (nu 7, nu 1) | Email omis (evitare spam zilnic) | |
| T176 | Toggle email reports `OFF` | `email_reports=false` | Utilizator exclus din weekly report | |
| T177 | Link dezabonare email `/api/unsubscribe?token=...` | Token base64 valid | `email_reports=false` setat în DB | |

---

## 10. SECURITATE API ENDPOINTS

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T178 | `POST /api/auth/activate-trial` fără sesiune | 401 Unauthorized | |
| T179 | `POST /api/auth/activate-trial` cont cu plan existent | `{activated: false}`, plan nemodificat | |
| T180 | `POST /api/auth/activate-trial` cont formator/profesor | `{activated: false}`, trial doar pentru family | |
| T181 | `GET /api/dashboard/grupuri/[id]/progress-csv` alt profesor | 403 sau 404 | |
| T182 | `POST /api/grup/progress` cu student_id invalid | 400/404 graceful | |
| T183 | `GET /api/export-my-data` fără sesiune | 401 Unauthorized | |
| T184 | `GET /api/export-my-data` autentificat | JSON cu datele proprii ale utilizatorului | |
| T185 | Server Actions admin fără sesiune admin | `requireAdmin()` aruncă eroare, return `{error}` | |
| T186 | IDOR: `deleteParent(altUserId)` de un non-admin | Blocat de `requireAdmin()` | |

---

## 11. PROFIL & SETĂRI UTILIZATOR (`/dashboard/profile`)

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T187 | Editare nume complet | Actualizat în `parent_profiles.full_name` | |
| T188 | Schimbare parolă (parolă curentă corectă) | Parolă actualizată, sesiune menținută | |
| T189 | Schimbare parolă (parolă curentă greșită) | Eroare afișată, parolă nemodificată | |
| T190 | Toggle rapoarte email ON | `email_reports=true` în DB | |
| T191 | Toggle rapoarte email OFF | `email_reports=false` în DB | |
| T192 | Ștergere cont propriu (confirm dialog) | Cascadă: copii + progres + certificate + auth; redirect `/` | |
| T193 | Abonament afișat în profil | Plan + dată expirare + zile rămase vizibile | |

---

## 12. MIDDLEWARE & RUTE PROTEJATE

| # | Test | Rezultat așteptat | Status |
|---|------|-------------------|--------|
| T194 | `GET /dashboard/*` fără sesiune | Redirect `/login` | |
| T195 | `GET /admin/*` fără sesiune | Redirect `/login` | |
| T196 | `GET /cursant/*` fără sesiune parent | Redirect `/login` | |

---

## 13. RESPONSIVITATE MOBILĂ

| # | Test | Dispozitiv | Rezultat așteptat | Status |
|---|------|-----------|-------------------|--------|
| T197 | Header nav mobile | 375px | Hamburger menu, toate linkurile accesibile | |
| T198 | Dashboard copii (grid) | 375px | 1 coloană, carduri vizibile și accesibile | |
| T199 | Admin sidebar nav | 375px | Nav orizontal scrollable | |
| T200 | PresentationViewer | 375px | Înălțime 320px, fullscreen `inset-0` | |
| T201 | Tab Progres clasă (tabel) | 375px | Scroll orizontal sau layout adaptat | |
| T202 | Pagina Prețuri | 375px | Carduri stivuite vertical (1/coloană) | |
| T203 | Formular adăugare elev | 375px | Input-uri full-width, buton vizibil | |

---

## Scenarii de regresie prioritare (smoke test după deploy)

Rulează aceste 10 teste după fiecare deploy major:

| # | Test rapid | Durată estimată |
|---|-----------|----------------|
| S1 | Înregistrare cont family nou → trial activat | 3 min |
| S2 | Login → dashboard → profil cursant → zonă copil | 3 min |
| S3 | Lecție video → finalizare → progres salvat | 2 min |
| S4 | Quiz → răspuns corect → score salvat | 2 min |
| S5 | Finalizare curs → certificat generat | 2 min |
| S6 | Admin login → publică curs → vizibil public | 3 min |
| S7 | Clasă → accces cod → elev → lecție → progres | 4 min |
| S8 | Admin → aprobare cont → email primit | 3 min |
| S9 | Pagina `/preturi` → click CTA → `/register` | 1 min |
| S10 | `/dashboard/progress/[childId]` → grafic și module | 2 min |

**Total smoke test: ~25 minute**

---

*Ultima actualizare: 2026-06-14 | Generat din inventarul complet al platformei*
