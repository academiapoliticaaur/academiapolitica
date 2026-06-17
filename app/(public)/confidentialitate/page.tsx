import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de confidențialitate — Academia Politica AUR",
  description: "Politica de prelucrare a datelor cu caracter personal a platformei educaționale Academia Politica AUR, conform GDPR.",
};

export default function ConfidentialitatePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-blue-500">← Înapoi acasă</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Politica de confidențialitate</h1>
        <p className="text-sm text-gray-500">
          Ultima actualizare: <strong>Iunie 2026</strong> · Versiunea 1.1
        </p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ Acest document este în curs de revizuire juridică. Versiunea finală va fi publicată înainte de lansarea publică oficială. Necesită validare finală avocat/DPO.
        </div>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-bold mb-3">1. Operatorul de date cu caracter personal</h2>
          <p className="text-gray-700 leading-relaxed">
            Operatorul datelor cu caracter personal este <strong>[DENUMIRE JURIDICĂ COMPLETĂ]</strong>,
            persoană juridică română, cu sediul în <strong>[ADRESĂ COMPLETĂ]</strong>,
            CUI <strong>[CUI]</strong>, în sensul Regulamentului (UE) 2016/679 (GDPR).
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
            <p>Email contact general: <a href="mailto:[EMAIL CONTACT]" className="text-blue-600 hover:underline">[EMAIL CONTACT]</a></p>
            <p>Email protecția datelor (GDPR): <a href="mailto:[EMAIL GDPR]" className="text-blue-600 hover:underline">[EMAIL GDPR]</a></p>
            <p>Responsabil cu protecția datelor (DPO): <strong>[NUME DPO / FUNCȚIE / EMAIL]</strong> — dacă este obligatoriu conform GDPR.</p>
          </div>
          <p className="text-xs text-amber-700 mt-2 italic">
            [DE COMPLETAT] Datele complete ale operatorului trebuie completate înainte de publicarea finală. Necesită validare finală avocat/DPO.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Categorii de persoane vizate</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Prezenta politică se aplică tuturor persoanelor ale căror date sunt prelucrate prin intermediul platformei:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
            <li><strong>Părinți / tutori legali</strong> — titularii conturilor de familie</li>
            <li><strong>Formatori</strong> — învățători (clasele 0–4) și profesori (clasele 5–8) cu cont aprobat</li>
            <li><strong>Copii / elevi</strong> — ale căror profiluri sunt create și administrate de părinți/tutori sau formatori</li>
            <li><strong>Administratori</strong> — persoane autorizate să administreze platforma</li>
            <li><strong>Vizitatori ai site-ului</strong> — persoane care accesează paginile publice fără cont</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Ce date colectăm</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Date privind titularul contului adult (părinte / formator)</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                <li>Nume complet</li>
                <li>Adresă de email</li>
                <li>Parola (stocată criptat — hash bcrypt, nu avem acces la parola în clar)</li>
                <li>Tipul de cont (Părinte, Formator, Profesor)</li>
                <li>Data creării contului</li>
                <li>Preferința privind emailurile (raport săptămânal activ/inactiv)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Date privind profilurile copiilor</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                <li>Prenume sau pseudonim (ales de părinte — nu colectăm date de identificare completă a copilului)</li>
                <li>Nivel educațional: clasele 0–4 sau clasele 5–8</li>
                <li>Clasa școlară (opțional)</li>
                <li>Progresul lecțiilor completate și scorurile quiz-urilor</li>
                <li>Certificatele obținute</li>
                <li>Hash PIN de acces (opțional, criptat)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Date minime privind elevii din clase (zona /clasa)</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                <li>Prenume sau inițiale sau cod intern (introduse de cadrul didactic)</li>
                <li>Cod de identificare în clasă</li>
                <li>Progresul lecțiilor și scorurile quiz-urilor</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Date tehnice și loguri de securitate</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                <li>Adrese IP (procesate temporar de furnizorii de infrastructură)</li>
                <li>Cookies de autentificare (httpOnly, strict necessary)</li>
                <li>Date de erori tehnice (prin Sentry, dacă este activat — fără PII)</li>
                <li>Loguri de acces și securitate (prevenirea abuzurilor)</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-2">Date de suport și contact</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                <li>Mesajele trimise prin formularul de contact (nume, email, mesaj)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Temeiurile juridice ale prelucrării (Art. 6 GDPR)</h2>
          <div className="space-y-3">
            {[
              {
                temeiu: "Executarea contractului (Art. 6(1)(b))",
                desc: "Furnizarea serviciului de platformă educațională: autentificare, stocare progres, certificate, funcționalități de clasă.",
              },
              {
                temeiu: "Consimțământ (Art. 6(1)(a))",
                desc: "Trimiterea raportului săptămânal pe email. Poți retrage consimțământul oricând din profilul tău sau prin link-ul de dezabonare din email.",
              },
              {
                temeiu: "Interes legitim (Art. 6(1)(f))",
                desc: "Securitatea platformei, detectarea și prevenirea abuzurilor, monitorizarea erorilor tehnice, administrarea platformei.",
              },
              {
                temeiu: "Obligație legală (Art. 6(1)(c))",
                desc: "Respectarea legislației aplicabile, inclusiv obligații fiscale, contabile sau de raportare, acolo unde este cazul.",
              },
              {
                temeiu: "Autorizație parentală pentru profilurile copiilor",
                desc: "Prelucrarea datelor copiilor se realizează în temeiul Art. 6(1)(b) și Art. 8 GDPR, cu autorizarea expresă a părintelui/tutorelui legal la crearea profilului.",
              },
            ].map((item) => (
              <div key={item.temeiu} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-sm text-gray-800">{item.temeiu}</p>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-3 italic">
            [DE COMPLETAT] Temeiul exact pentru utilizarea instituțională de către școli/formatori trebuie stabilit și documentat separat. Necesită validare finală avocat/DPO.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Datele copiilor</h2>
          <p className="text-gray-700 leading-relaxed">
            Datele copiilor sunt prelucrate numai în măsura necesară furnizării funcționalităților educaționale.
            Platforma nu solicită date excesive despre copii și recomandă părinților și cadrelor didactice să evite
            introducerea de informații sensibile, date medicale, date privind situația familială sau alte informații
            care nu sunt necesare scopului educațional.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Scorurile quiz-urilor reprezintă rezultate tehnice ale răspunsurilor selectate și nu constituie
            evaluare psihologică, diagnostic educațional sau decizie automată cu efect semnificativ.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Formatori și funcționalitatea de clasă</h2>
          <p className="text-gray-700 leading-relaxed">
            În cazul utilizării funcției de clasă, cadrul didactic trebuie să introducă numai date minime necesare
            scopului educațional. Se recomandă utilizarea prenumelui, inițialelor, pseudonimului sau unui cod intern
            pentru identificarea elevilor, evitând introducerea de date excesive.
          </p>
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>[DE COMPLETAT]</strong> — Pentru utilizarea instituțională de către o unitate de învățământ,
            relația juridică privind prelucrarea datelor trebuie stabilită separat, printr-un acord de prelucrare
            a datelor sau alt document adecvat. Trebuie stabilit dacă platforma acționează ca operator independent,
            persoană împuternicită sau operator asociat în raport cu unitatea de învățământ. Necesită validare finală avocat/DPO.
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Utilizarea inteligenței artificiale</h2>
          <p className="text-gray-700 leading-relaxed">
            Platforma poate utiliza servicii AI (modelul Llama 3 prin furnizorul Groq) pentru asistarea generării
            de conținut educațional: structuri de cursuri, quiz-uri, materiale auxiliare.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Datele personale ale copiilor, părinților, cadrelor didactice sau elevilor nu sunt transmise
            către sistemele AI pentru generarea de conținut. AI este utilizat pe conținut curricular
            (documente Word/PDF), nu pe profilurile utilizatorilor.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Conținutul asistat de AI este verificat de un educator uman înainte de publicare și este marcat
            vizibil prin indicatorul <strong>„Conținut asistat de AI și revizuit uman"</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Interdicții privind utilizarea AI în raport cu copiii</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            Platforma nu utilizează AI pentru:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
            <li>profilarea copiilor;</li>
            <li>evaluarea automată individuală a copiilor;</li>
            <li>decizii automate cu efect juridic sau similar semnificativ (conform Art. 22 GDPR);</li>
            <li>recunoaștere emoțională;</li>
            <li>scoring social;</li>
            <li>manipulare comportamentală;</li>
            <li>exploatarea vulnerabilităților legate de vârstă.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">9. Furnizori tehnici și subprocesori</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Nu vindem, nu închiriem și nu divulgăm date personale către terți în scop comercial.
            Utilizăm următorii furnizori de servicii tehnice (subprocesori):
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 font-semibold">Furnizor</th>
                  <th className="text-left p-3 font-semibold">Scop</th>
                  <th className="text-left p-3 font-semibold">Rol</th>
                  <th className="text-left p-3 font-semibold">Localizare</th>
                  <th className="text-left p-3 font-semibold">Garanții / DPA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-medium">Supabase</td>
                  <td className="p-3 text-gray-600">Baza de date și autentificare</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">SUA / EU (AWS) — <span className="text-amber-700">[DE VERIFICAT regiune exactă]</span></td>
                  <td className="p-3 text-gray-600">SCCs — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Vercel</td>
                  <td className="p-3 text-gray-600">Hosting și CDN</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">SUA / Global</td>
                  <td className="p-3 text-gray-600">SCCs, DPA disponibil — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Resend</td>
                  <td className="p-3 text-gray-600">Trimitere email-uri</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">SUA</td>
                  <td className="p-3 text-gray-600">SCCs — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Groq</td>
                  <td className="p-3 text-gray-600">Procesare AI conținut curricular (admin)</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">SUA</td>
                  <td className="p-3 text-gray-600">SCCs — date procesate exclusiv de admin, fără PII utilizatori — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Sentry</td>
                  <td className="p-3 text-gray-600">Monitorizare erori tehnice</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">SUA</td>
                  <td className="p-3 text-gray-600">SCCs — date tehnice anonimizate, fără PII — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Google Drive</td>
                  <td className="p-3 text-gray-600">Stocare conținut educațional (lecții)</td>
                  <td className="p-3 text-gray-600">Persoană împuternicită</td>
                  <td className="p-3 text-gray-600">Global</td>
                  <td className="p-3 text-gray-600">SCCs, conținut public educațional — <span className="text-amber-700">[DE COMPLETAT status DPA]</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-amber-700 mt-3 italic">
            Lista furnizorilor și garanțiile de transfer trebuie verificate și actualizate înainte de lansarea oficială. Necesită validare finală avocat/DPO.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">10. Transferuri internaționale de date</h2>
          <p className="text-gray-700 leading-relaxed">
            Unii furnizori tehnici prelucrează date în afara Spațiului Economic European (SEE). În aceste cazuri,
            Operatorul se asigură că transferul se realizează cu garanții adecvate, care pot include:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4 text-sm">
            <li>clauze contractuale standard (Standard Contractual Clauses — SCCs) adoptate de Comisia Europeană;</li>
            <li>acorduri de prelucrare a datelor (DPA) cu furnizorii;</li>
            <li>evaluări ale impactului transferului (Transfer Impact Assessment — TIA);</li>
            <li>măsuri suplimentare tehnice și organizaționale, după caz.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">11. Cât timp păstrăm datele (Retenție)</h2>
          <div className="space-y-2 text-sm text-gray-700">
            {[
              { categorie: "Date cont adult", retentie: "Pe durata existenței contului + 30 zile după ștergere (backup)" },
              { categorie: "Date profil cursant", retentie: "Pe durata existenței contului de părinte" },
              { categorie: "Progres lecții și certificate", retentie: "Pe durata existenței profilului copilului" },
              { categorie: "Date elevi clasă", retentie: "Pe durata existenței clasei + 30 zile după arhivare" },
              { categorie: "Loguri tehnice Sentry", retentie: "90 zile" },
              { categorie: "Date după ștergerea contului", retentie: "Ștergere permanentă în 30 zile" },
              { categorie: "Date de contact / suport", retentie: "12 luni sau până la soluționarea solicitării" },
            ].map((item) => (
              <div key={item.categorie} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium min-w-[200px]">{item.categorie}</span>
                <span className="text-gray-600">{item.retentie}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">12. Securitatea datelor (Art. 32 GDPR)</h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            Operatorul aplică măsuri tehnice și organizaționale adecvate riscului, incluzând:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
            <li>Autentificare cu flux PKCE (Proof Key for Code Exchange) — standard de securitate modern</li>
            <li>Autentificare în doi pași (2FA TOTP) obligatorie pentru conturile administrative</li>
            <li>Criptarea tuturor comunicațiilor prin HTTPS (TLS 1.2+)</li>
            <li>Parolele stocate exclusiv ca hash-uri criptografice (bcrypt)</li>
            <li>PIN-ul copilului stocat ca hash criptografic</li>
            <li>Controlul accesului prin Row Level Security (RLS) în baza de date</li>
            <li>Datele copiilor accesibile exclusiv de părintele/tutorele contului</li>
            <li>Jurnalizare, backup și restaurare</li>
            <li>Monitorizare de erori tehnice (Sentry) și revizuirea periodică a drepturilor de acces</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">13. Incidente de securitate</h2>
          <p className="text-gray-700 leading-relaxed">
            În cazul unei încălcări a securității datelor cu caracter personal, Operatorul va evalua fără
            întârziere natura incidentului, datele afectate, categoriile de persoane vizate, riscurile probabile
            și măsurile de remediere necesare.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Dacă incidentul este susceptibil să genereze un risc pentru drepturile și libertățile persoanelor
            vizate, Operatorul va notifica autoritatea competentă (ANSPDCP) în cel mult 72 de ore de la
            constatare, conform Art. 33 GDPR.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Dacă incidentul este susceptibil să genereze un risc ridicat pentru persoanele vizate, Operatorul
            va informa direct persoanele afectate, fără întârzieri nejustificate, conform Art. 34 GDPR.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">14. Drepturile tale (GDPR Cap. III)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { drept: "Acces (Art. 15)", desc: "Poți solicita o copie a datelor deținute despre tine.", action: "Email la [EMAIL GDPR]" },
              { drept: "Rectificare (Art. 16)", desc: "Poți corecta datele incorecte din profilul tău.", action: "Din setările contului sau email" },
              { drept: "Ștergere (Art. 17)", desc: "Poți șterge contul și toate datele asociate.", action: "Profil → Zona periculoasă" },
              { drept: "Portabilitate (Art. 20)", desc: "Poți descărca datele tale în format JSON.", action: "Profil → Descarcă datele mele" },
              { drept: "Obiecție (Art. 21)", desc: "Te poți dezabona de la emailuri de raport.", action: "Profil → Notificări sau link din email" },
              { drept: "Restricție (Art. 18)", desc: "Poți solicita suspendarea temporară a prelucrării.", action: "Email la [EMAIL GDPR]" },
              { drept: "Retragerea consimțământului", desc: "Poți retrage oricând consimțământul pentru emailuri, fără a afecta prelucrările anterioare.", action: "Profil → Notificări" },
            ].map((item) => (
              <div key={item.drept} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-semibold text-sm text-blue-800">{item.drept}</p>
                <p className="text-xs text-gray-600 mt-1 mb-2">{item.desc}</p>
                <p className="text-xs font-medium text-blue-600">→ {item.action}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed mt-4 text-sm">
            Cererile sunt soluționate, de regulă, în termen de cel mult o lună de la primire, conform GDPR.
            Termenul poate fi prelungit cu două luni în cazuri complexe, cu notificarea prealabilă a solicitantului.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3 text-sm">
            Ai dreptul să depui o plângere la{" "}
            <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>{" "}
            — <a href="https://www.dataprotection.ro" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">15. Cookie-uri</h2>
          <div className="space-y-3 text-sm">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">Cookie-uri strict necesare</p>
              <p className="text-gray-600 mt-1">
                Platforma folosește cookie-uri <code className="bg-gray-200 px-1 rounded">httpOnly</code> pentru
                autentificare (sesiune Supabase). Acestea sunt strict necesare pentru funcționarea serviciului
                și nu necesită consimțământ. Nu conțin date personale în clar.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">Cookie-uri de monitorizare erori (Sentry)</p>
              <p className="text-gray-600 mt-1">
                Dacă Sentry este activat, poate stoca informații tehnice de sesiune pentru urmărirea erorilor.
                Nu colectează date de identificare personală. Activare condiționată de prezența variabilei de configurare.
              </p>
            </div>
            <p className="text-gray-600">Platforma nu utilizează cookie-uri de tracking, publicitate sau analiză comportamentală.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">16. Evaluarea de impact (DPIA)</h2>
          <p className="text-gray-700 leading-relaxed">
            Având în vedere că platforma prelucrează date ale copiilor și date educaționale, Operatorul va realiza
            un screening DPIA (Data Protection Impact Assessment) și, dacă este necesar, o evaluare completă
            de impact asupra protecției datelor, înainte de lansarea publică sau extinderea funcționalităților
            care implică noi categorii de date sau riscuri sporite.
          </p>
          <p className="text-xs text-amber-700 mt-2 italic">Necesită validare finală avocat/DPO.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">17. Alfabetizare AI (AI Literacy) pentru operatorii platformei</h2>
          <p className="text-gray-700 leading-relaxed">
            Persoanele care utilizează instrumente AI în administrarea platformei trebuie să fie instruite
            cu privire la:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4 text-sm">
            <li>limitele sistemelor AI și riscurile de eroare sau bias;</li>
            <li>protecția datelor cu caracter personal în contextul utilizării AI;</li>
            <li>verificarea factuală a conținutului generat de AI;</li>
            <li>protecția minorilor și restricțiile privind utilizarea AI pentru copii;</li>
            <li>utilizarea responsabilă și transparentă a conținutului generat de AI.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">18. Modificarea politicii</h2>
          <p className="text-gray-700 leading-relaxed">
            Orice modificare esențială a prezentei politici va fi comunicată utilizatorilor prin email
            cu minimum 15 zile înainte de intrarea în vigoare. Data ultimei actualizări este afișată
            la începutul acestei pagini.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">19. Contact GDPR</h2>
          <p className="text-gray-700 leading-relaxed">
            Pentru orice întrebări legate de prelucrarea datelor cu caracter personal sau pentru
            exercitarea drepturilor tale GDPR, ne poți contacta la:
          </p>
          <div className="mt-3 p-4 bg-blue-50 rounded-xl text-sm">
            <p><strong>[DENUMIRE JURIDICĂ COMPLETĂ]</strong></p>
            <p>[ADRESĂ COMPLETĂ]</p>
            <p>Email contact: <a href="mailto:[EMAIL CONTACT]" className="text-blue-600 hover:underline">[EMAIL CONTACT]</a></p>
            <p>Email GDPR: <a href="mailto:[EMAIL GDPR]" className="text-blue-600 hover:underline">[EMAIL GDPR]</a></p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/termeni" className="hover:text-gray-600">Termeni și condiții</Link>
        <Link href="/" className="hover:text-gray-600">Pagina principală</Link>
      </div>
    </div>
  );
}
