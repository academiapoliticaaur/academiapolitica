import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "@/components/common/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ajutor & Ghid — Ami & Moti" };

const SECTIONS: {
  id: string;
  icon: string;
  title: string;
  color: string;
  items: { q: string; a: string }[];
}[] = [
  {
    id: "parinti",
    icon: "👨‍👩‍👧",
    title: "Ghid pentru părinți",
    color: "blue",
    items: [
      {
        q: "Cum creez un cont?",
        a: "Apasă pe butonul \"Creează cont\" de pe pagina principală. Completezi numele complet, adresa de email, tipul de cont (Părinte/Tutore) și o parolă. Vei primi un email de confirmare — apasă linkul din email pentru a activa contul.",
      },
      {
        q: "Cum adaug un profil de copil?",
        a: "După autentificare, mergi la Dashboard și apasă \"Adaugă profil copil\". Completezi numele afișat, grupa de vârstă (0-4 sau 5-8) și poți seta un PIN opțional. Poți adăuga mai mulți copii pe același cont.",
      },
      {
        q: "Cum urmăresc progresul copilului?",
        a: "Din Dashboard, apasă iconița grafic (Progres) de lângă profilul copilului. Vei vedea toate lecțiile parcurse, statusul fiecăreia și scorurile obținute la quiz-uri.",
      },
      {
        q: "Cum setez un PIN de protecție?",
        a: "Din Dashboard → Editează profil → secțiunea PIN. Introduci 4 cifre și salvezi. Copilul va trebui să introducă PIN-ul la fiecare acces. PIN-ul expiră după 8 ore. Îl poți elimina oricând bifând \"Elimină PIN\".",
      },
      {
        q: "Pot previzualiza lecțiile înainte să le dau copilului?",
        a: "Da. Pe pagina unui curs (ca părinte autentificat) apare butonul \"Previzualizare\" lângă fiecare lecție. Progresul nu se salvează în modul previzualizare.",
      },
      {
        q: "Cum schimb parola sau numele contului meu?",
        a: "Din Dashboard → \"Profilul meu\". Poți actualiza numele complet și parola. Pentru parolă ai nevoie de parola actuală.",
      },
      {
        q: "Primesc notificări despre progresul copilului?",
        a: "Da. În fiecare luni dimineață primești pe email un raport săptămânal cu lecțiile completate de copii în săptămâna anterioară. Poți activa sau dezactiva acest raport din Dashboard → Profilul meu → secțiunea Notificări.",
      },
      {
        q: "Cum văd progresul detaliat al copilului pe module?",
        a: "Din Dashboard, apasă iconița Progres (grafic) de lângă profilul copilului. Vei vedea progresul general, un grafic cu activitatea din ultimele 7 zile și, pentru fiecare curs, modulele sunt expandabile — fiecare cu propria bară de progres și lista lecțiilor.",
      },
      {
        q: "Pot exporta datele personale (GDPR)?",
        a: "Da. Din Dashboard → Profilul meu → secțiunea Date personale, apasă \"Exportă datele mele\". Vei primi un fișier JSON cu toate datele asociate contului tău (profil, copii, progres, certificate).",
      },
      {
        q: "Cum șterg contul meu?",
        a: "Din Dashboard → Profilul meu → secțiunea Pericol → \"Șterge contul\". Aceasta va șterge ireversibil contul tău, profilurile copiilor, progresul și certificatele. Acțiunea necesită confirmare explicită.",
      },
    ],
  },
  {
    id: "cadre",
    icon: "🎓",
    title: "Ghid pentru cadre didactice",
    color: "purple",
    items: [
      {
        q: "Cum îmi creez un cont de cadru didactic?",
        a: "Pe pagina de înregistrare, la câmpul \"Tip cont\" alege \"Învățător (clasele 0–4)\" sau \"Profesor gimnaziu (clasele 5–8)\". Completezi restul datelor și trimiți. Vei primi un email de confirmare — după confirmare, contul intră în așteptare pentru aprobare de administrator.",
      },
      {
        q: "De ce nu pot accesa cursurile imediat după înregistrare?",
        a: "Conturile de cadre didactice necesită aprobare manuală de administrator pentru a verifica calitatea educatorului. Primești un email când contul este aprobat. Poți naviga și vedea titlurile cursurilor, dar conținutul lecțiilor devine disponibil doar după aprobare.",
      },
      {
        q: "Ce cursuri pot accesa ca Învățător?",
        a: "Ai acces la secțiunea \"Cadre didactice\" → \"Resurse Învățători\" — cursuri concepute specific pentru predarea AI literacy în clasele 0–4. Poți accesa pagina prin meniul de sus sau direct la /cadre-didactice.",
      },
      {
        q: "Ce cursuri pot accesa ca Profesor de gimnaziu?",
        a: "Ai acces la secțiunea \"Cadre didactice\" → \"Resurse Profesori Gimnaziu\" — cursuri pentru predarea competențelor digitale și AI în clasele 5–8.",
      },
      {
        q: "Pot vedea și cursurile pentru elevi?",
        a: "Da. Cursurile pentru elevi (Clasele 0-4 și 5-8) sunt vizibile public la /courses. Ca profesor aprobat poți accesa și conținutul lecțiilor din cursurile de elevi relevante pentru nivelul tău.",
      },
      {
        q: "Cum știu că am fost aprobat?",
        a: "Vei vedea în Dashboard un mesaj verde \"Cont aprobat\" în loc de cel galben \"Cont în așteptare\". De asemenea, butonul de acces la lecțiile din cursurile de cadre didactice devine activ.",
      },
    ],
  },
  {
    id: "copii",
    icon: "🧒",
    title: "Ghid pentru copii",
    color: "teal",
    items: [
      {
        q: "Cum intru în zona mea?",
        a: "Părintele tău trebuie să intre în cont și să apese pe profilul tău din Dashboard. Dacă ai PIN, va trebui să-l introduci.",
      },
      {
        q: "Cum accesez un curs?",
        a: "Din zona ta, apasă pe cursul dorit. Vei vedea toate modulele și lecțiile disponibile. Apasă pe o lecție pentru a o începe.",
      },
      {
        q: "Ce sunt XP-urile?",
        a: "XP = Experience Points (puncte de experiență). Le câștigi astfel: 10 XP pentru fiecare lecție completată, 50 XP bonus când termini un modul întreg și 100 XP bonus când termini tot cursul!",
      },
      {
        q: "Cum funcționează quiz-ul?",
        a: "La fiecare quiz trebuie să răspunzi corect la cel puțin 80% din întrebări pentru a trece la lecția următoare. Dacă nu reușești, apasă \"Încearcă din nou\" — poți repeta de câte ori vrei!",
      },
      {
        q: "Ce primesc când termin un curs?",
        a: "Primești o diplomă de absolvire pe care o poți vedea și descărca. Părintele tău primește și el un email de felicitare!",
      },
      {
        q: "Pot descărca fișele de lucru?",
        a: "Da, dacă lecția are o fișă de lucru atașată apare un buton de descărcare sau printare a PDF-ului.",
      },
    ],
  },
  {
    id: "cursuri",
    icon: "📚",
    title: "Despre cursuri",
    color: "indigo",
    items: [
      {
        q: "Ce grupe de vârstă sunt disponibile pentru elevi?",
        a: "Platforma are conținut pentru două grupe: Clasele 0-4 (ciclul primar) și Clasele 5-8 (gimnaziu). Conținutul este adaptat nivelului fiecărei grupe.",
      },
      {
        q: "Există și cursuri pentru profesori?",
        a: "Da. Există cursuri dedicate Învățătorilor (cls. 0-4) și Profesorilor de gimnaziu (cls. 5-8), accesibile din secțiunea \"Cadre didactice\" după aprobarea contului.",
      },
      {
        q: "Ce tipuri de lecții există?",
        a: "Există 5 tipuri de lecții: Video (filme YouTube unlisted), Prezentare (PDF sau Google Slides), Fișă de lucru (PDF descărcabil), Quiz (test interactiv cu feedback imediat) și Mixt (combinație). Lecțiile mixte pot include mai multe tipuri.",
      },
      {
        q: "Cum caut un curs?",
        a: "Pe pagina Cursuri (/courses) există o bară de căutare în partea de sus. Scrie titlul sau un cuvânt cheie și lista se filtrează automat. Poți filtra și după grupa de vârstă.",
      },
      {
        q: "Pot relua un curs finalizat?",
        a: "Da. Pe pagina cursului finalizat apare butonul \"Reia cursul\" care resetează progresul și permite parcurgerea din nou. XP-ul câștigat rămâne permanent.",
      },
      {
        q: "Cât costă accesul la platformă?",
        a: "La înregistrare primești automat un trial gratuit de 7 zile cu acces complet. După expirare, accesul la conținut premium necesită un abonament activat de administrator. Există planuri lunar (30 zile), trimestrial (90 zile) și anual (365 zile). Detalii pe pagina /preturi.",
      },
    ],
  },
  {
    id: "abonamente",
    icon: "💳",
    title: "Abonamente & Prețuri",
    color: "violet",
    items: [
      {
        q: "Ce este trial-ul gratuit?",
        a: "La crearea unui cont de tip Părinte/Tutore primești automat 7 zile de acces complet la toate cursurile — fără card de credit, fără obligații. La expirare, accesul la conținut premium este suspendat, dar datele și progresul sunt păstrate.",
      },
      {
        q: "Ce planuri de abonament există?",
        a: "Există trei planuri: Lunar (30 zile), Trimestrial (90 zile) și Anual (365 zile). Detalii complete cu prețuri pe pagina /preturi.",
      },
      {
        q: "Cum activez un abonament?",
        a: "Din Dashboard → Profilul meu sau din bannerul de pe Dashboard, apasă \"Cere abonament\", selectează planul dorit și trimite cererea. Administratorul platformei o va procesa și vei primi un email de confirmare cu instrucțiuni de plată.",
      },
      {
        q: "Cât durează până se activează abonamentul?",
        a: "De regulă în 24–48 de ore în zilele lucrătoare, după confirmarea plății. Vei primi un email când abonamentul este activ.",
      },
      {
        q: "Primesc o avertizare înainte să expire abonamentul?",
        a: "Da. Platforma îți trimite un email cu 7 zile înainte și din nou cu o zi înainte de expirare. De asemenea, Dashboard-ul afișează un banner de avertizare cu zilele rămase.",
      },
      {
        q: "Ce se întâmplă la expirarea abonamentului?",
        a: "Accesul la lecțiile cursurilor premium este suspendat. Datele de progres, certificatele și profilurile copiilor sunt păstrate integral. La reactivarea abonamentului, totul revine la normal.",
      },
      {
        q: "Pot anula o cerere de abonament trimisă?",
        a: "Da. Din Dashboard, bannerul de cerere în așteptare conține un buton \"Anulează cererea\". Cererea va fi retrasă.",
      },
    ],
  },
  {
    id: "tehnic",
    icon: "⚙️",
    title: "Probleme tehnice",
    color: "gray",
    items: [
      {
        q: "Nu pot viziona videoclipul lecției.",
        a: "Videoclipurile sunt YouTube Unlisted (private). Dacă nu se încarcă, verifică conexiunea la internet sau încearcă să reîmprospătezi pagina (F5). Dacă problema persistă, contactează administratorul platformei.",
      },
      {
        q: "Nu se descarcă PDF-ul.",
        a: "Descărcarea PDF-ului poate fi dezactivată de administrator pentru anumite lecții. Dacă butonul nu apare, această opțiune nu este disponibilă pentru lecția respectivă.",
      },
      {
        q: "Am uitat parola contului meu.",
        a: "Pe pagina de Login apasă \"Ai uitat parola?\" și urmează instrucțiunile trimise pe email pentru resetarea parolei.",
      },
      {
        q: "Copilul nu poate accesa profilul — apare ecranul de PIN.",
        a: "Introdu PIN-ul de 4 cifre setat de tine ca părinte. Dacă nu îl mai știi, mergi la Dashboard → Editează profil copil → bifează \"Elimină PIN\" și salvează.",
      },
      {
        q: "Confirmarea emailului nu funcționează sau pagina rămâne blocată.",
        a: "Apasă direct pe linkul din emailul de confirmare (nu copia/lipi URL-ul). Dacă pagina se blochează, închide tab-ul și intră pe /login — dacă emailul a fost confirmat, vei putea autentifica normal.",
      },
      {
        q: "Contul de cadru didactic este aprobat dar tot nu văd cursurile.",
        a: "Deconectează-te și reconectează-te pentru a reîmprospăta sesiunea. Dacă problema persistă, contactează administratorul.",
      },
      {
        q: "Cum instalez aplicația pe telefon sau tabletă?",
        a: "Pe Android/Chrome apare automat un buton \"Instalează\" în partea de jos a ecranului. Pe iPhone/iPad (Safari) nu există un buton automat — apasă pe butonul Distribuie (pătratul cu săgeata în sus din bara de jos) și alege \"Adaugă pe ecranul principal\". În ambele cazuri, aplicația va apărea ca o iconiță separată și se va deschide pe tot ecranul, fără bara browserului.",
      },
    ],
  },
  {
    id: "clase",
    icon: "🏫",
    title: "Elevi din clase (acces cu cod)",
    color: "emerald",
    items: [
      {
        q: "Cum intru în platforma dacă sunt elev dintr-o clasă?",
        a: "Accesează ami-moti.everydai.ro/clasa (sau apasă \"Intră în clasă\" din meniu). Introduce codul clasei dat de profesorul tău, selectează-ți numele din lista clasei și ești gata!",
      },
      {
        q: "Am nevoie de un cont sau parolă?",
        a: "Nu! Elevii din clase nu au nevoie de cont, email sau parolă. Accesul se face doar cu codul clasei și cu codul personal dat de profesor.",
      },
      {
        q: "Nu găsesc numele meu în lista clasei.",
        a: "Asigură-te că ai introdus corect codul clasei (literele mari și mici contează). Dacă codul e corect dar nu îți găsești numele, contactează profesorul — este posibil ca acesta să te fi adăugat cu un alt prenume.",
      },
      {
        q: "Ce cursuri pot accesa?",
        a: "Poți accesa cursurile asignate clasei tale de profesor. Lista apare automat după ce îți selectezi numele. Nu poți accesa alte cursuri din afara celor asignate clasei.",
      },
      {
        q: "Câștig XP și pot obține diplomă ca elev din clasă?",
        a: "Da! Sistemul de XP funcționează identic: 10 XP per lecție, 50 XP bonus per modul, 100 XP bonus la finalizarea cursului. Quiz-urile necesită minim 80% pentru a trece. La finalizarea unui curs primești o diplomă de absolvire.",
      },
      {
        q: "Dacă închid browserul, se pierde progresul meu?",
        a: "Nu. Progresul este salvat în baza de date a platformei. Poți reveni oricând cu codul clasei și codul personal și vei găsi lecțiile marcate ca finalizate.",
      },
      {
        q: "Codul clasei nu funcționează sau apare eroare.",
        a: "Verifică că ai scris corect codul (fără spații). Codul poate fi dezactivat dacă clasa a fost arhivată de profesor. Contactează profesorul pentru a confirma codul corect.",
      },
    ],
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200",
  teal: "bg-teal-50 border-teal-200",
  indigo: "bg-indigo-50 border-indigo-200",
  gray: "bg-gray-50 border-gray-200",
  purple: "bg-purple-50 border-purple-200",
  emerald: "bg-emerald-50 border-emerald-200",
  violet: "bg-violet-50 border-violet-200",
};

const headerColorMap: Record<string, string> = {
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
  gray: "bg-gray-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-600",
};

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="bg-gray-50 flex-1">
      <div className="max-w-4xl mx-auto px-4 py-12">

        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Centru de ajutor</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Răspunsuri la cele mai frecvente întrebări despre platforma Ami & Moti.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                className="text-sm font-semibold px-4 py-2 rounded-full border bg-white hover:bg-gray-50 transition-colors text-gray-700">
                {s.icon} {s.title}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.id} id={section.id}>
              <div className={`rounded-2xl border overflow-hidden ${colorMap[section.color]}`}>
                <div className={`${headerColorMap[section.color]} text-white px-6 py-4`}>
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h2>
                </div>
                <div className="divide-y divide-white/60">
                  {section.items.map((item, i) => (
                    <details key={i} className="group px-6 py-4 bg-white/70 hover:bg-white transition-colors">
                      <summary className="font-semibold text-gray-800 cursor-pointer list-none flex items-center justify-between gap-4">
                        {item.q}
                        <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 text-lg">⌄</span>
                      </summary>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-lg font-semibold text-blue-800 mb-2">Nu ai găsit răspunsul?</p>
          <p className="text-sm text-blue-600 mb-4">
            Folosește asistentul nostru virtual (butonul 💬 din colțul dreapta-jos) sau trimite-ne un mesaj direct.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="text-sm font-semibold px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Vezi cursurile
            </Link>
            <Link href="/preturi" className="text-sm font-semibold px-4 py-2 rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors">
              Prețuri & Abonamente
            </Link>
            <Link href="/cadre-didactice" className="text-sm font-semibold px-4 py-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors">
              Cadre didactice
            </Link>
            {!user && (
              <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
                Creează cont gratuit
              </Link>
            )}
            {user && (
              <Link href="/dashboard" className="text-sm font-semibold px-4 py-2 rounded-full border border-blue-300 text-blue-700 hover:bg-blue-100 transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <section id="contact" className="mt-10">
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
            <div className="bg-gray-700 text-white px-6 py-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">✉️</span>
                Contactează-ne
              </h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-gray-600 mb-2">
                Nu ai găsit răspuns în ghid? Scrie-ne direct la{" "}
                <span className="font-semibold text-blue-600">suport@amisimoti.ro</span>{" "}
                sau folosește formularul de mai jos.
              </p>
              <p className="text-xs text-gray-400 mb-6">Răspundem în maximum 24–48 de ore în zilele lucrătoare.</p>
              <ContactForm />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
