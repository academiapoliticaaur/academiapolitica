"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "bot";
  text: string;
  helpLink?: string;
}

const FAQ: { keywords: string[]; answer: string; helpLink?: string }[] = [
  {
    keywords: ["cont", "inregistrare", "register", "creare", "inregistrez", "creez"],
    answer: "Exista 3 tipuri de cont:\n• Parinte/tutore — acces la cursuri pentru copii\n• Formator (cls. 0-4) — resurse didactice, necesita aprobare\n• Profesor gimnaziu (cls. 5-8) — resurse didactice, necesita aprobare\nApasa Creeaza cont pe pagina principala si alege tipul potrivit.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["copil", "profil cursant", "adaug copil", "nou copil", "child"],
    answer: "Dupa autentificare, mergi la Dashboard si apasa Adauga profil cursant. Completezi numele, grupa de varsta (0-4 sau 5-8) si optional un PIN de 4 cifre. Poti adauga mai multi copii pe acelasi cont.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["curs", "cursuri", "ce cursuri", "disponibil", "oferta"],
    answer: "Cursurile pentru elevi sunt pe pagina /courses, filtrate dupa grupa (0-4 sau 5-8). Cadrele didactice aprobate au acces la resurse suplimentare pe pagina /formatori. Toate cursurile sunt listate alfabetic.",
    helpLink: "/help#cursuri",
  },
  {
    keywords: ["lectie", "lectii", "acces lectie", "cum intru", "deschid lectia"],
    answer: "Intri in profilul copilului, selectezi un curs, apoi selectezi lectia dorita. Lectiile pot fi video, prezentari Google Slides/PDF, fise de lucru descarcabile sau quiz-uri interactive.",
    helpLink: "/help#copii",
  },
  {
    keywords: ["quiz", "test", "intrebari", "raspuns", "gresit", "incearca"],
    answer: "Quiz-urile necesita minim 80% raspunsuri corecte pentru a trece la lectia urmatoare. Daca nu atingi 80%, poti apasa Incearca din nou si repeti quiz-ul de cate ori vrei.",
    helpLink: "/help#copii",
  },
  {
    keywords: ["xp", "puncte", "experienta", "scor", "recompensa", "badge", "insigna"],
    answer: "XP-urile se castiga astfel: 10 XP per lectie, 50 XP la finalizarea unui modul, 100 XP bonus la finalizarea cursului. XP-ul este permanent — nu se pierde daca reiei cursul. Exista si 9 insigne de competenta si un daily streak.",
    helpLink: "/help#copii",
  },
  {
    keywords: ["diploma", "certificat", "absolvire", "felicitari", "finalizat"],
    answer: "La finalizarea unui curs, copilul primeste automat o diploma de absolvire printabila. Parintele primeste si un email de felicitare. Elevii din clase primesc de asemenea diploma la finalizarea unui curs.",
    helpLink: "/help#copii",
  },
  {
    keywords: ["pin", "protectie", "parola copil", "blocat", "securitate"],
    answer: "Poti seta un PIN de 4 cifre pe profilul copilului din Dashboard -> Editeaza profil. PIN-ul protejeaza accesul si este valabil 8 ore din sessionStorage. Se poate elimina oricand din aceleasi setari.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["progres", "avansare", "urmaresc", "completat", "status"],
    answer: "Din Dashboard apasa iconita grafic (Progres) de langa profilul copilului. Vei vedea toate lectiile, statusul fiecareia si scorurile de la quiz-uri.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["parola", "schimb parola", "resetez", "am uitat", "contul meu", "profilul meu"],
    answer: "Din Dashboard -> Profilul meu poti schimba numele si parola contului. Pe pagina de login apasa Ai uitat parola? pentru resetare prin email.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["email", "notificare", "raport", "saptamanal"],
    answer: "Parintii primesc automat un raport saptamanal pe email in fiecare luni dimineata, cu lectiile completate de copii. La finalizarea unui curs, se trimite si un email cu diploma.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["varsta", "grupa", "0-4", "5-8"],
    answer: "Platforma are doua grupe: Clasele 0-4 (ciclu primar) si Clasele 5-8 (gimnaziu). Continutul este adaptat fiecarei grupe. Cadrele didactice vad automat cursurile grupei lor.",
    helpLink: "/help#cursuri",
  },
  {
    keywords: ["pret", "gratuit", "cost", "plata", "abonament"],
    answer: "Platforma Academia Politica AUR este complet gratuita — pentru parinti, copii si formatori. Nu exista abonamente sau costuri ascunse.",
    helpLink: "/help#cursuri",
  },
  {
    keywords: ["contact", "ajutor", "problema", "eroare", "suport"],
    answer: "Pentru probleme tehnice sau intrebari, consulta Centrul de ajutor (/help). Poti trimite si un mesaj direct la suport@academia-aur.ro sau prin formularul de contact din pagina Ajutor.",
    helpLink: "/help#tehnic",
  },
  {
    keywords: ["login", "autentific", "intru in cont", "deconect", "logout"],
    answer: "Accesezi /login si introduci emailul si parola. Pentru deconectare folosesti butonul Deconectare din meniu. Daca ai MFA activat (admin), vei introduce si codul TOTP.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["ami", "moti", "personaj", "caracter"],
    answer: "Academia Politica AUR este platforma de formare politica si educatie civica a Aliantei pentru Unirea Romanilor. Cursuri pentru membri, formatori si lectori.",
  },
  {
    keywords: ["video", "film", "youtube", "vizionat", "google drive"],
    answer: "Lectiile video pot fi YouTube Unlisted sau fisiere video din Google Drive. Prezentarile sunt Google Slides sau PDF-uri vizualizate direct in pagina.",
    helpLink: "/help#tehnic",
  },
  {
    keywords: ["instalare", "instaleaza", "aplicatie", "ecran principal", "pwa", "iphone", "ipad", "android", "telefon"],
    answer: "Poti adauga Academia Politica AUR pe ecranul principal ca aplicatie:\n• Pe Android/Chrome: apasa butonul Instaleaza care apare automat in josul ecranului.\n• Pe iPhone/iPad (Safari): apasa butonul Distribuie (patratul cu sageata in sus), apoi Adauga pe ecranul principal — pe iOS nu apare un buton automat de instalare, dar functioneaza la fel de bine prin acest pas manual.",
    helpLink: "/help#tehnic",
  },
  {
    keywords: ["fisa", "fisa lucru", "pdf", "descarcare", "printeaza"],
    answer: "Fisele de lucru sunt PDF-uri descarcabile din Google Drive, disponibile in lectiile de tip Fisa de lucru. Daca butonul nu apare, optiunea nu este activata pentru lectia respectiva.",
    helpLink: "/help#copii",
  },
  {
    keywords: ["previzualiz", "preview", "vedere prealabila"],
    answer: "Ca parinte autentificat, pe pagina unui curs apare butonul Previzualizare langa fiecare lectie. Progresul si XP nu se salveaza in modul previzualizare.",
    helpLink: "/help#parinti",
  },
  {
    keywords: ["reia", "reincepe", "restart", "reluare curs"],
    answer: "Pe pagina unui curs finalizat apare butonul Reia cursul care reseteaza progresul si permite parcurgerea din nou. XP-ul castigat ramane permanent.",
    helpLink: "/help#cursuri",
  },
  {
    keywords: ["formator", "lector", "cadre", "didactic", "aprobare", "aprobat", "resurse"],
    answer: "Conturile de Formator si Profesor necesita aprobare manuala de administrator. Dupa aprobare, ai acces la resurse didactice de pe /formatori, filtrate pe grupa ta (0-4 sau 5-8). Daca esti aprobat dar nu vezi resursele, deconecteaza-te si reconecteaza-te.",
    helpLink: "/help#cadre",
  },
  {
    keywords: ["clasa", "clase", "cod clasa", "elev", "elevi", "cod acces", "intru clasa"],
    answer: "Cadrele didactice pot crea o clasa virtuala cu un cod unic de acces. Elevii intra pe /clasa, introduc codul clasei, selecteaza numele si acceseaza cursurile — fara sa creeze cont. Progresul si diplomele functioneaza identic.",
    helpLink: "/help#clase",
  },
  {
    keywords: ["cod personal", "student code", "nu gasesc numele", "lista clasa"],
    answer: "Elevii primesc un cod personal de la profesor. Dupa ce introduci codul clasei, selectezi numele din lista clasei. Daca nu gasesti numele, contacteaza profesorul — poate fi adaugat cu un alt prenume.",
    helpLink: "/help#clase",
  },
  {
    keywords: ["streak", "zile consecutive", "activitate zilnica"],
    answer: "Daily streak-ul numara zilele consecutive in care copilul a completat cel putin o lectie. Mentinerea streak-ului deblocheaza insigne speciale de activitate.",
    helpLink: "/help#copii",
  },
];

const WELCOME = "Buna! Sunt asistentul platformei Academia Politica AUR 🌟\nCu ce te pot ajuta?\n\n• Parinti: conturi copii, progres, XP, diplome\n• Formatori: aprobare cont, clase virtuale, resurse\n• Elevi: acces cu cod clasa, quiz-uri, certificate\n\nPentru raspunsuri complete consulta Centrul de ajutor.";
const FALLBACK_TEXT = "Nu am informatii despre acest subiect. Consulta Centrul de ajutor (/help) pentru raspunsuri complete, sau scrie-ne la suport@academia-aur.ro.";
const FALLBACK_LINK = "/help";
const SUGGESTIONS = ["Cum creez un cont?", "Ce sunt clasele virtuale?", "Cum functioneaza quiz-ul?", "Resurse formatori"];

interface AnswerResult {
  text: string;
  helpLink?: string;
}

function findAnswer(input: string): AnswerResult {
  const normalized = input.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  let best: { score: number; answer: string; helpLink?: string } = { score: 0, answer: FALLBACK_TEXT, helpLink: FALLBACK_LINK };
  for (const faq of FAQ) {
    const score = faq.keywords.filter((kw) => normalized.includes(kw)).length;
    if (score > best.score) best = { score, answer: faq.answer, helpLink: faq.helpLink };
  }
  return { text: best.answer, helpLink: best.helpLink };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: WELCOME, helpLink: "/help" }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const result = findAnswer(msg);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: msg },
      { role: "bot", text: result.text, helpLink: result.helpLink },
    ]);
    setInput("");
  };

  const reset = () => setMessages([{ role: "bot", text: WELCOME, helpLink: "/help" }]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Asistent Academia Politica AUR"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
          style={{ maxHeight: "min(560px, calc(100vh - 2rem))" }}
        >
          <div className="bg-blue-500 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <div>
                <p className="font-semibold text-sm leading-tight">Asistent Academia Politica AUR</p>
                <p className="text-xs text-blue-200 leading-tight">Informatii despre platforma</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/help"
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-blue-400 rounded-lg transition-colors text-xs font-semibold text-blue-100 hover:text-white"
                title="Centru de ajutor"
              >
                Ajutor
              </Link>
              <button onClick={reset} className="px-2 py-1 text-xs font-medium hover:bg-blue-400 rounded-lg transition-colors" title="Conversatie noua">
                Nou
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-blue-400 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}>
                  {msg.role === "bot" && (
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 mr-1.5">🌟</span>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
                {msg.role === "bot" && msg.helpLink && (
                  <div className="ml-8 mt-1">
                    <Link
                      href={msg.helpLink}
                      onClick={() => setOpen(false)}
                      className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
                    >
                      Detalii complete in Centrul de ajutor →
                    </Link>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-3 pb-2 bg-gray-50 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((q) => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Scrie o intrebare..."
                className="flex-1 text-sm border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button onClick={() => send()} disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
