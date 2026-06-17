import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și condiții — Academia Politica AUR",
  description: "Termenii și condițiile de utilizare ale platformei educaționale Academia Politica AUR.",
};

export default function TermeniPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-blue-500">← Înapoi acasă</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Termeni și condiții</h1>
        <p className="text-sm text-gray-500">
          Ultima actualizare: <strong>Iunie 2026</strong> · Versiunea 1.1
        </p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ Acest document este în curs de revizuire juridică. Versiunea finală va fi publicată înainte de lansarea publică oficială. Necesită validare finală avocat/DPO.
        </div>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">

        <section>
          <h2 className="text-xl font-bold mb-3">1. Operatorul platformei</h2>
          <p className="text-gray-700 leading-relaxed">
            Platforma <strong>Academia Politica AUR</strong> (accesibilă la <strong>academia-aur.ro</strong>) este operată de{" "}
            <strong>[DENUMIRE JURIDICĂ COMPLETĂ]</strong>, persoană juridică română, cu sediul social în{" "}
            <strong>[ADRESĂ COMPLETĂ]</strong>, înregistrată cu CUI <strong>[CUI]</strong>,
            reprezentată legal de <strong>[REPREZENTANT LEGAL]</strong> (denumit în continuare „Operatorul").
          </p>
          <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
            <p>Contact general: <a href="mailto:[EMAIL CONTACT]" className="text-blue-600 hover:underline">[EMAIL CONTACT]</a></p>
            <p>Contact protecția datelor (GDPR): <a href="mailto:[EMAIL GDPR]" className="text-blue-600 hover:underline">[EMAIL GDPR]</a></p>
            <p>Responsabil cu protecția datelor / punct de contact GDPR: <strong>[NUME / FUNCȚIE / EMAIL]</strong> — după caz.</p>
          </div>
          <p className="text-xs text-amber-700 mt-2 italic">Necesită validare finală avocat/DPO înainte de utilizarea oficială.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Obiectul și acceptarea termenilor</h2>
          <p className="text-gray-700 leading-relaxed">
            Prezentele Termeni și Condiții reglementează accesul și utilizarea platformei educaționale Academia Politica AUR,
            care oferă cursuri de alfabetizare digitală și AI pentru copii din clasele 0–8 și pentru cadrele didactice.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Prin crearea unui cont sau utilizarea platformei, confirmi că ai citit, înțeles și accepți în totalitate
            prezentele Termeni și Condiții. Dacă nu ești de acord, nu poți utiliza platforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Tipuri de conturi</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">Cont Părinte / Tutore</p>
              <p className="text-sm text-gray-600 mt-1">
                Creat de un adult (părinte sau tutore legal al copilului). Titularul contului este responsabil legal
                pentru activitatea desfășurată prin contul său și pentru profilurile copiilor create sub acesta.
                Accesul este imediat după confirmarea adresei de email.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">Cont Cadru Didactic (Formator / Profesor)</p>
              <p className="text-sm text-gray-600 mt-1">
                Creat de un formator activ din România. Contul necesită aprobare din partea administratorului
                platformei. Cadrele didactice se angajează să utilizeze platforma exclusiv în scop educațional
                și să respecte normele deontologice profesionale.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Vârsta minimă, consimțământul parental și conturile copiilor</h2>
          <p className="text-gray-700 leading-relaxed">
            Copiii nu pot crea conturi proprii pe platformă. Profilurile copiilor sunt create și administrate
            exclusiv de un adult — părinte, tutore legal sau adult autorizat — prin contul propriu al acestuia.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Prin completarea câmpului „consimțământ parental" la înregistrare și prin crearea profilului copilului,
            adultul declară că:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
            <li>are capacitate deplină de exercițiu;</li>
            <li>este părintele sau tutorele legal al copilului/copiilor înscriși sau deține autoritatea necesară administrării profilului;</li>
            <li>autorizează prelucrarea datelor minime ale copilului strict necesare furnizării serviciului educațional, conform Politicii de confidențialitate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Utilizarea platformei de către cadrele didactice</h2>
          <p className="text-gray-700 leading-relaxed">
            Cadrele didactice care utilizează funcționalitatea de clasă trebuie să introducă numai date minime
            necesare scopului educațional. Se recomandă utilizarea prenumelui, inițialelor, pseudonimului sau
            unui cod intern, evitând introducerea de informații excesive despre elevi.
          </p>
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>[DE COMPLETAT]</strong> — Pentru utilizarea instituțională de către școli, trebuie stabilit
            dacă platforma acționează ca operator independent, persoană împuternicită pentru unitatea de
            învățământ sau operator asociat. Această relație trebuie reglementată printr-un acord de prelucrare
            a datelor sau alt instrument juridic adecvat. <em>Necesită validare finală avocat/DPO.</em>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Utilizarea platformei</h2>
          <p className="text-gray-700 leading-relaxed">Utilizatorul se angajează să:</p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
            <li>nu partajeze datele de autentificare cu terțe persoane;</li>
            <li>nu utilizeze platforma în scopuri comerciale fără acordul scris al Operatorului;</li>
            <li>nu reproducă, distribuie sau modifice conținutul platformei fără permisiune;</li>
            <li>nu încerce să acceseze conturi sau date ale altor utilizatori;</li>
            <li>nu utilizeze instrumente automate (roboți, scrapers) pentru a extrage date din platformă.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Conținut asistat de Inteligență Artificială</h2>
          <p className="text-gray-700 leading-relaxed">
            Platforma poate utiliza instrumente de inteligență artificială pentru asistarea generării de conținut
            curricular, quiz-uri, materiale educaționale și materiale auxiliare pentru profesori sau părinți.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Instrumentele AI sunt utilizate exclusiv de administratori sau persoane autorizate, pe conținut
            curricular (documente Word/PDF), fără transmiterea datelor personale ale copiilor, părinților,
            cadrelor didactice sau elevilor către sistemele AI.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Conținutul asistat de AI este verificat și aprobat de un educator uman înainte de publicare.
            Materialele asistate de AI sunt marcate vizibil prin formula <strong>„Conținut asistat de AI și revizuit uman"</strong>.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Operatorul nu garantează absența erorilor în conținutul generat automat și recomandă utilizatorilor
            să trateze orice informație factual verificabilă cu spirit critic.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Limitări privind utilizarea AI în raport cu copiii</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Platforma nu utilizează AI pentru:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>profilarea copiilor;</li>
            <li>evaluarea automată individuală a copiilor;</li>
            <li>luarea unor decizii automate cu efect juridic sau similar semnificativ;</li>
            <li>stabilirea nivelului educațional al copilului prin AI;</li>
            <li>recomandări educaționale individualizate generate automat cu impact semnificativ;</li>
            <li>recunoaștere emoțională;</li>
            <li>scoring social;</li>
            <li>manipularea comportamentului copiilor;</li>
            <li>exploatarea vulnerabilităților legate de vârstă.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Scorurile quiz-urilor sunt calculate tehnic pe baza răspunsurilor selectate și nu reprezintă
            evaluare psihologică, profilare, diagnostic sau decizie educațională automată.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">9. Proprietate intelectuală</h2>
          <p className="text-gray-700 leading-relaxed">
            Toate drepturile de proprietate intelectuală asupra platformei, designului, codului sursă, conținutului
            educațional, personajelor Academia Politica AUR și materialelor auxiliare aparțin Operatorului sau licențiatorilor
            săi. Este interzisă orice utilizare neautorizată.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">10. Disponibilitate și limitarea răspunderii</h2>
          <p className="text-gray-700 leading-relaxed">
            Operatorul depune diligențe rezonabile pentru asigurarea disponibilității platformei, dar nu garantează
            funcționarea neîntreruptă. Operatorul nu răspunde pentru pierderi indirecte, de profit sau de date
            rezultate din utilizarea sau imposibilitatea de utilizare a platformei.
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Limitarea răspunderii nu afectează drepturile conferite de legislația aplicabilă, inclusiv legislația
            privind protecția consumatorilor, protecția datelor cu caracter personal, răspunderea pentru intenție
            sau culpă gravă și alte drepturi care nu pot fi limitate prin contract.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">11. Modificarea termenilor</h2>
          <p className="text-gray-700 leading-relaxed">
            Operatorul poate modifica prezentele termeni în orice moment. Utilizatorii vor fi notificați prin email
            cu minimum 15 zile înainte de intrarea în vigoare a modificărilor esențiale. Continuarea utilizării
            platformei după notificare reprezintă acceptarea noilor termeni.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">12. Legea aplicabilă și jurisdicția</h2>
          <p className="text-gray-700 leading-relaxed">
            Prezentul contract este guvernat de legislația română. Orice litigiu se va soluționa pe cale amiabilă
            sau, în lipsa unui acord, la instanțele judecătorești competente din România.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">13. Contact</h2>
          <p className="text-gray-700 leading-relaxed">
            Pentru orice întrebări legate de prezentele termeni, ne poți contacta la:{" "}
            <a href="mailto:[EMAIL CONTACT]" className="text-blue-600 hover:underline">[EMAIL CONTACT]</a>
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Pentru solicitări privind protecția datelor cu caracter personal:{" "}
            <a href="mailto:[EMAIL GDPR]" className="text-blue-600 hover:underline">[EMAIL GDPR]</a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 text-sm text-gray-400">
        <Link href="/confidentialitate" className="hover:text-gray-600">Politica de confidențialitate</Link>
        <Link href="/" className="hover:text-gray-600">Pagina principală</Link>
      </div>
    </div>
  );
}
