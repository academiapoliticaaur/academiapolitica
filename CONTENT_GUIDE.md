# CONTENT_GUIDE.md — Ghid pentru crearea și gestionarea conținutului

## 1. Structura unui curs

```
Curs
├── Modul 1
│   ├── Lecție 1.1 (video)
│   ├── Lecție 1.2 (prezentare)
│   └── Lecție 1.3 (quiz)
└── Modul 2
    ├── Lecție 2.1 (fișă de lucru)
    └── Lecție 2.2 (mixt: video + prezentare)
```

**Recomandare**: 2-4 module per curs, 2-4 lecții per modul.

## 2. Cum adaugi un curs nou (prin panou admin)

1. Autentifică-te cu un cont admin
2. Mergi la `/admin/courses`
3. Apasă **Curs nou**
4. Completează:
   - **Titlu**: scurt și atractiv
   - **Slug**: generat automat din titlu (ex: `atelierul-de-zambete`)
   - **Descriere**: 2-4 propoziții pentru părinți și copii
   - **Grupă de vârstă**: Clasele 0–4 sau Clasele 5–8
   - **Status**: Draft (nu apare public) sau Publicat
5. Salvează → vei fi redirecționat la pagina cursului
6. Adaugă module și lecții

## 3. Cum adaugi un video YouTube

**Pasul 1**: Încarcă videoclipul pe YouTube
- Mergi la [studio.youtube.com](https://studio.youtube.com)
- Apasă **Creare → Încarcă videoclip**
- **Vizibilitate**: alege **Unlistat** (nu Privat, nu Public)
  - Unlistat = nu apare în căutare, dar oricine cu linkul îl poate accesa
  - Privat = necesită autentificare YouTube, nu funcționează în embed

**Pasul 2**: Copiază linkul
- `https://www.youtube.com/watch?v=VIDEO_ID`

**Pasul 3**: Adaugă în admin
- La crearea lecției, lipește URL-ul în câmpul **URL Video YouTube**

> ⚠️ **Limitare YouTube Unlisted**: dacă cineva copiază URL-ul, îl poate distribui.
> Pentru viitor, consideră Cloudflare Stream sau Vimeo (plan privat).

## 4. Cum pregătești o prezentare PPTX pentru web

### Fluxul recomandat: PPTX → PDF → Upload → Lecție

**Pasul 1**: Creează prezentarea în PowerPoint sau Google Slides

**Pasul 2**: Exportă ca PDF
- PowerPoint: **Fișier → Exportă → Creare PDF/XPS**
- Google Slides: **Fișier → Descarcă → PDF**

**Pasul 3**: Încarcă PDF-ul în Supabase Storage
1. Mergi la Supabase Dashboard → **Storage**
2. Selectează bucket-ul `presentations`
3. Apasă **Upload** și selectează PDF-ul
4. Copiază URL-ul public al fișierului (format: `https://xxxx.supabase.co/storage/v1/object/public/presentations/fisier.pdf`)

**Pasul 4**: Adaugă URL-ul în lecție
- La crearea lecției, lipește URL-ul în câmpul **URL Prezentare**

> 💡 **Alternativă**: Google Slides poate fi publicat direct ca URL embed. Mergi la **Publicare → Publicare pe web** și folosește URL-ul generat.

## 5. Cum adaugi o fișă de lucru descărcabilă

1. Prepară documentul (Word, PDF, etc.)
2. Încarcă în Supabase Storage → bucket `worksheets`
3. Copiază URL-ul public
4. Adaugă în câmpul **URL Fișă de lucru** la lecție

## 6. Crearea lecțiilor pentru Clasele 0–4

**Principii**:
- Titluri scurte, cu emoji: "Ce sunt emoțiile? 😊"
- Propoziții scurte, cuvinte simple
- Conținut vizual: imagini colorate, caractere mari
- Durata: 5–15 minute per lecție
- Feedback pozitiv în quiz: "Bravo!", "Super!", "Ai reușit!"
- Evită textele lungi

**Personajele**:
- Ami (fetiță 11 ani, șatenă, ochi verzi): explică, povestește, ghidează
- Moti (pisoi portocaliu): pune întrebări, provoacă curiozitatea, face glume

**Mesaje AmiMoti recomandate pentru 0–4**:
- Ami: "Hai să descoperim împreună ce sunt emoțiile!"
- Moti: "Eu, Moti, te provoc: poți ghici ce emoție am eu acum? 🐱"
- Misiune: "Misiunea ta: colorează câte o față pentru fiecare emoție!"

## 7. Crearea lecțiilor pentru Clasele 5–8

**Principii**:
- Structură clară: Introducere → Conținut → Activitate → Quiz
- Explicații mai consistente, terminologie specifică
- Conexiuni cu viața reală
- Durata: 10–25 minute per lecție
- Quiz cu 3–5 întrebări mai complexe

**Mesaje AmiMoti recomandate pentru 5–8**:
- Ami: "În această lecție vei descoperi cum funcționează gândirea critică."
- Moti: "Moti te provoacă: crezi că poți recunoaște un fake news în 30 de secunde?"
- Misiune: "Misiunea ta: analizează 3 titluri de știri și identifică care e fals."

## 8. Verificarea conținutului AI

Orice lecție generată cu AI trebuie:
1. Bifată ca **AI Generated: Da**
2. Citită și verificată de un educator sau adult responsabil
3. Bifată ca **Human Reviewed: Da** ÎNAINTE de publicare
4. Adăugate **Reviewer notes** dacă s-au făcut modificări

> ⚠️ Nu publica lecții AI fără verificare umană. Conținutul AI poate fi inexact sau inadecvat vârstei.

## 9. Statuses pentru lecții

| Status | Semnificație |
|--------|-------------|
| Draft | Nu apare copilului, în lucru |
| Reviewed | Verificat, gata de publicare |
| Published | Vizibil pentru copii autentificați |

## 10. Personajele Ami și Moti — ghid vizual

Folosește componenta `<AmiMotiGuide>` cu variantele:
- `ami`: Ami îți explică (verde)
- `moti`: Moti te provoacă (portocaliu)
- `mission`: Misiunea lecției (violet)
- `discovery`: Ce ai descoperit azi? (galben)
