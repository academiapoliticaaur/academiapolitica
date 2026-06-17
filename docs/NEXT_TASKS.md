# Next Tasks

## MVP finalizat (2026-05-07) — toate WP-urile completate

### WP01 — Stabilizare și verificare (DONE — 2026-05-04)
- [x] `.env.local` cu toate cheile Supabase
- [x] `npm run lint` — 0 erori
- [x] `npm run build` — SUCCESS
- [x] App funcțional pe localhost:3000

### WP02 — Supabase database (DONE — 2026-05-04)
- [x] Tabele create + RLS policies aplicate (001_initial_schema.sql)
- [x] Conexiune DB → app verificată

### WP03 — Pagini publice (DONE — 2026-05-04)
- [x] Home page cu hero, features, grupe vârstă
- [x] Listing cursuri cu căutare și filtru
- [x] Detaliu curs cu module/lecții

### WP04 — Auth părinți (DONE — 2026-05-04)
- [x] Register → Dashboard
- [x] Login / Logout
- [x] Dashboard cu profiluri copii
- [x] Middleware protecție rute

### WP05 — Zona copilului (DONE — 2026-05-04)
- [x] Profil copil cu cursuri filtrate
- [x] Pagina curs cu progres
- [x] Player lecție (video, prezentare, fișă lucru)
- [x] Marcare lecție completată

### WP06 — Admin MVP (DONE — 2026-05-04)
- [x] CRUD cursuri / module / lecții
- [x] Publicare/retragere cursuri

### WP07 — Demo content (DONE — 2026-05-04)
- [x] 2 cursuri demo cu module și lecții (002_demo_data.sql)

### WP08 — Deployment (DONE — 2026-05-04)
- [x] Vercel conectat la GitHub, auto-deploy
- [x] Variabile de mediu configurate

### WP09 — Post-MVP features (DONE — 2026-05-07)
- [x] Quiz editor cu import DOCX/PDF/TXT (regex + fallback Claude AI)
- [x] Quiz gate 80% pentru finalizare lecție
- [x] Delete cascade cursuri / module / lecții
- [x] Previzualizare lecții pentru părinți (fără progres)
- [x] Reia cursul (reset progres, XP permanent)
- [x] XP permanent din certificates (nu se pierde la replay)
- [x] Daily streak (zile consecutive activitate)
- [x] Badges (9 insigne)
- [x] Diplomă de absolvire printabilă
- [x] Email diplomă la finalizare curs (Resend)
- [x] Raport săptămânal progres (cron luni 08:00)
- [x] PIN profil copil cu expirare 8h
- [x] MFA TOTP pentru admin (2FA obligatoriu)
- [x] Chat widget FAQ client-side (zero API)
- [x] Pagina /help cu secțiuni acordeon
- [x] Formular contact → suport@amisimoti.ro → ADMIN_EMAIL
- [x] Header link Ajutor, Admin dashboard quick access

### WP10 — Sistem clase cadre didactice (DONE — 2026-05-22)
- [x] Migrație 006_classes.sql: 4 tabele (classes, class_students, class_courses, class_student_progress) + RLS
- [x] /dashboard/classes — lista clase active/arhivate cu cod de acces
- [x] /dashboard/classes/new — creare clasă (cod unic 4-12 car.)
- [x] /dashboard/classes/[id] — detaliu clasă: tab Elevi (adaugă/șterge) + tab Cursuri (asignează/elimină)
- [x] /clasa — landing page elevi (introduc codul clasei)
- [x] /clasa/[code] — selectare elev din clasă
- [x] /clasa/[code]/[studentCode] — zona elevului cu cursuri asignate clasei
- [x] /api/clasa/verify — validare cod clasă (folosit de landing page client-side)
- [x] Nav "Intră în clasă" (verde) vizibil global (desktop + mobil)
- [x] Sidebar dashboard profesor: Clasele mele + Cursurile mele
- [x] Fix "Copii" ascuns pentru profesori: fallback user_metadata când account_type e null în DB
- [x] Diplome elevi clase (007_class_certificates.sql)

### WP10b — Bugfixes & Admin improvements (DONE — 2026-05-22)
- [x] Fix: titlu lecție trunchiat în admin (truncate + title tooltip)
- [x] Fix: /cadre-didactice — invatator vedea resurse profesor (adăugat isApproved check)
- [x] Fix: /courses — resurse cadre didactice apăreau la elevi (filtru audience=children/all)
- [x] Fix: /courses — profesorii nu erau filtrați pe grupa de vârstă (forcedAgeGroup)
- [x] Fix: ștergere curs afișa pagina de eroare Next.js (acum alert cu mesaj specific)
- [x] Fix: după ștergere curs apărea 404 (redirectTo="/admin/courses" în DeleteButton)
- [x] Admin: pagina Teachers redesigned (ca pagina Parents, cu Editează button)
- [x] Admin: /admin/teachers/[userId]/edit — editare cont profesor nou
- [x] Admin: /admin/parents/[userId]/edit — schimbare tip cont (family/invatator/profesor)
- [x] Admin: buton Șterge curs pe pagina de detaliu curs (nu doar în lista de cursuri)
- [x] Guard centralizat requireAdmin() în lib/admin/guard.ts

### WP11 — Google Drive Integration (DONE cod — 2026-05-22, PENDING configurare)
- [x] lib/google-drive.ts — funcții OAuth2 (getAuthUrl, exchangeCodeForTokens, getAccessToken, saveRefreshToken, isDriveConnected)
- [x] /api/admin/drive/auth — inițiază OAuth2 flow
- [x] /api/admin/drive/callback — finalizează OAuth2, salvează refresh_token
- [x] /api/admin/drive/token — returnează access_token pentru Picker
- [x] /admin/settings/google-drive — pagina setări Drive (conectare/deconectare)
- [x] components/admin/GooglePickerButton — Google Picker client-side
- [x] components/admin/GoogleDriveLinkField — câmp hibrid URL + Picker
- [x] 009_google_drive.sql — drive_folder_id pe courses/modules/lessons + tabel admin_settings
- [x] Aplicat 009_google_drive.sql în Supabase Dashboard
- [x] Adăugat NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY în Vercel
- [x] Conectat Google Drive din /admin/settings/google-drive

### WP12 — Funcții clase v2 (DONE — 2026-06-07)
- [x] Progres elev în clasă: înregistrare la completarea lecției (class_student_progress) — POST /api/clasa/progress
- [x] Tab "Progres" în /dashboard/classes/[id] — tabel per elev × curs, sumar clasă, ultima activitate
- [x] PIN opțional per elev (student_pin, modal 4 cifre, sessionStorage, regenerare)
- [x] Reordonare cursuri asignate — butoane Sus/Jos, swap order_index
- [x] Export CSV progres clasă — GET /api/dashboard/classes/[id]/progress-csv, format wide, BOM UTF-8

### WP13 — Google Drive organizare automată (DONE — 2026-06-07)
- [x] La creare curs: creare folder Drive "Curs — Titlu" (fire-and-forget din /admin/courses/new)
- [x] La creare modul: creare subfolder "Modul — Titlu" în folderul cursului
- [x] Salvare drive_folder_id pe curs/modul în DB
- [x] Buton "Deschide în Drive" (verde) și "Crează folder Drive" (outline) pe paginile de editare
- [x] Aplicat 009_google_drive.sql în Supabase Dashboard
- [x] Adăugat NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY în Vercel
- [x] Conectat Google Drive din /admin/settings/google-drive

### WP14 — Îmbunătățiri UI/UX (DONE — 2026-06-07)
- [x] Loading skeletons — 3 pagini noi: /courses/[slug], /cadre-didactice, /child/.../lesson/[lessonId]
- [x] Error boundary — error.tsx în (public), (dashboard), (child), (admin)
- [x] Pagina /courses: sortare cursuri — butoane A–Z / Noi întâi (persist în URL, combinate cu filtrele de grupă)
- [x] Admin: reordonare module/lecții cu drag-and-drop (@dnd-kit — handles GripVertical, optimistic UI, server actions reorderModules/reorderLessons)

### WP15 — Email și notificări (DONE — 2026-06-07)
- [x] Email de aprobare cont cadru didactic (în approveUser() Server Action)
- [x] Email de bun venit la înregistrare (sendWelcomeEmail — trimis din auth/callback la primul cont nou)
- [x] Notificare admin când se înregistrează cont nou de cadru didactic (notifyAdminNewTeacher)

### WP16 — Teste automatizate (DONE — 2026-06-07)
- [x] Vitest 4.1.8 configurat (vitest.config.ts, alias @/, environment node)
- [x] __tests__/google-drive-utils.test.ts — 20+ teste utils Google Drive
- [x] __tests__/badges.test.ts — 10 teste computeBadges (toate 9 insigne)
- [x] __tests__/schemas.test.ts — 17 teste Zod schemas (login, register, childProfile, course)
- [x] __tests__/admin-delete.test.ts — 8 teste Server Actions (deleteLesson, deleteModule, deleteCourse) cu mock Supabase + vi.hoisted
- [x] __tests__/clasa-verify-pin.test.ts — 8 teste POST /api/clasa/verify-pin (validare PIN, clase, elevi)
- [x] __tests__/clasa-progress.test.ts — 6 teste POST /api/clasa/progress (missing fields, class/course/student not found, happy path)
- [x] CI: .github/workflows/test.yml — rulare automată npm run test la push/PR pe main
- Total: 69 teste, 6 fișiere, 354ms

### WP18 — Soft delete + Coș de gunoi (DONE — 2026-06-07)
- [x] Migration 011_soft_delete.sql: deleted_at pe courses/modules/lessons + indexuri parțiale
- [x] Soft delete: deleteLesson/Module/Course setează deleted_at în loc de DELETE real
- [x] Restore: restoreLesson/Module/Course + restaurare lecții ale modulului
- [x] Permanent delete: permanentDeleteLesson/Module/Course (DELETE real, doar din Coș de gunoi)
- [x] DeleteButton: AlertDialog shadcn/ui înlocuiește window.confirm()
- [x] Filtrare deleted_at IS NULL în lib/db/courses.ts și admin courses list/detail
- [x] /admin/trash: pagina Coș de gunoi cu 3 secțiuni (cursuri/module/lecții) + timp scurs
- [x] Link Coș de gunoi în sidebar admin și nav mobile
- [x] types/index.ts: deleted_at adăugat pe Course, Module, Lesson
- [x] Migration 011 aplicată în Supabase Dashboard ✓

### WP17 — Abonamente (DONE — 2026-06-07)
- [x] Migration 010_subscriptions.sql: 3 câmpuri pe parent_profiles (`subscription_plan`, `subscription_expires_at`, `subscription_activated_by`) + index ✓ APLICAT
- [x] lib/subscription.ts: `isSubscriptionActive`, `subscriptionExpiresIn`, `formatSubscriptionExpiry`, `PLAN_LABELS`, `PLAN_DAYS`
- [x] Server Actions: `activateSubscription(userId, formData)` + `deactivateSubscription(userId)` în lib/admin/actions.ts
- [x] SubscriptionPanel: componentă admin reutilizabilă (status badge, formular activare, buton dezactivare)
- [x] Admin /admin/parents/[userId]/edit + /admin/teachers/[userId]/edit: secțiune subscripție adăugată
- [x] Gate lecții copii: layout.tsx blochează accesul dacă parentProfile.subscription_expires_at nu e activ (după aprobare)
- [x] Gate lecții elevi clase: pagina lecției verifică subscripția profesorului (teacher_id din class)
- [x] Pagina curs copil: banner indigo "Abonament necesar" + lacăte indigo pe lecții (vs amber pentru neaprobat)

### WP19 — Flux cereri abonament self-service (DONE — 2026-06-14)
- [x] Migration 012_subscription_requests.sql: tabel subscription_requests (id, user_id, plan, status, created_at, reviewed_at, reviewed_by) + RLS ✓ APLICAT
- [x] lib/actions/subscription-request.ts: `requestSubscription(formData)` + `cancelSubscriptionRequest()`
- [x] lib/admin/actions.ts: `approveSubscriptionRequest(requestId, userId, plan)` + `rejectSubscriptionRequest(requestId, userId)`
- [x] Email notificare admin la cerere nouă (`sendSubscriptionRequestToAdmin`)
- [x] Email răspuns utilizator la aprobare/respingere (`sendSubscriptionResponseEmail`)
- [x] components/dashboard/SubscriptionRequestBanner: banner cu selector plan + submit/anulare (client component)
- [x] Dashboard /dashboard: bannerul apare automat pentru conturi family aprobate fără abonament activ
- [x] Admin /admin/approvals: secțiunea cereri abonament adăugată (Aprobă/Respinge inline)
- [x] Admin /admin/subscriptions: pagina completă cu toți utilizatorii, filtre (activ/expirat/fără), InlineSubscriptionControl
- [x] components/admin/InlineSubscriptionControl: activare/reînnoire/dezactivare rapid din tabel
- [x] Unicitate cerere pending: index UNIQUE parțial (un singur pending per user)

### WP20 — Import CSV elevi (DONE — 2026-06-15)
- [x] POST /api/dashboard/classes/[id]/import-students — parser CSV propriu, detecție header automată, max 100 elevi
- [x] Generare cod unic + PIN hashed per elev (identic cu adăugarea individuală)
- [x] ImportStudentsButton — client component: upload fișier, link template, rezultate cu PINuri, router.refresh()
- [x] Integrat în tab Elevi din /dashboard/classes/[id]

### WP21 — Căutare globală conținut cursuri (DONE — 2026-06-15)
- [x] getPublishedCourseLessonTitles() — index courseId → titluri module+lecții, cached (tag "courses")
- [x] filterCourses extins: caută și în index module/lecții, returnează contentMatchIds
- [x] CourseGridClient: placeholder actualizat, badge "Potrivire în lecții" pe carduri găsite indirect
- [x] Fetch parallel courses + titleIndex în CourseList

### WP22 — Distribuire certificat social media (DONE — 2026-06-15)
- [x] ShareButtons client component: WhatsApp, Facebook, Copiază link (clipboard + fallback, feedback 2s)
- [x] Integrat în bara .no-print pe /child/[id]/certificate/[certId] și /clasa/.../certificate/[certId]
- [x] Responsive: iconițe pe mobil, iconițe + text pe desktop

### WP23 — Calendar webinarii (DONE — 2026-06-15)
- [x] Migration 016_webinar_schedule.sql: scheduled_at TIMESTAMPTZ + registration_url TEXT pe webinars ✓ APLICAT
- [x] webinar-actions.ts: include scheduled_at + registration_url în create/update; youtube_id opțional
- [x] Admin forms (new + edit): datetime-local + URL înregistrare extern
- [x] Pagina /webinars: secțiune "Webinarii viitoare" (card dată + buton înregistrare) + "Înregistrări anterioare" (video grid)
- [x] Badge dată stilizat cu zi/lună/an, ora, AZI/MÂINE

---

## Template pentru platformă AI Literacy — pași următori

### Setup inițial fork
1. Clonează repo sau descarcă arhiva template
2. Redenumește proiectul în `package.json` și `next.config.ts`
3. Înlocuiește brandul "Ami & Moti" cu noul brand (personaje, culori, favicon)
4. Creează proiect nou Supabase și aplică migrațiile SQL (001-009)
5. Configurează variabilele de mediu (Supabase, Resend, domeniu, Google Drive)
6. Deploy pe Vercel

### Adaptări necesare pentru AI Literacy
- [ ] Conținut cursuri: module despre AI, prompting, etica AI, instrumente AI
- [ ] Grupe vârstă: adaptat pentru adulți/profesioniști dacă e cazul
- [ ] Tipuri lecție noi: poate Notebook interactiv, sandbox code
- [ ] Personaje noi în loc de Ami & Moti
- [ ] Schema XP/gamificare: posibil simplificat pentru adulți
- [ ] Certificare: diplomă adaptată pentru cursuri profesionale

### Funcții care rămân identice (zero modificări)
- Autentificare Supabase (login/register/middleware)
- Quiz system (import, player, gate 80%)
- Admin CRUD complet
- Email (Resend) — doar actualizezi brandul în template-uri
- MFA admin
- Chat widget FAQ (actualizezi întrebările)
- Help page (actualizezi conținutul)
- Formular contact
- Google Drive integration
- Sistem clase
