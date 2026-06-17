// Shared quiz parsing utilities — used by parse-quiz and parse-curriculum routes

export interface ParsedAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}

export interface ParsedQuestion {
  question_text: string;
  answers: ParsedAnswer[];
}

export interface QuizSection {
  title: string;
  questions: ParsedQuestion[];
}

// ─── Parser pentru formatul structurat "Întrebare: / • A. / Răspuns corect: A" ─
// Acceptă și varianta fără diacritice: "Intrebare:"
export function parseQuestionsFromBlock(block: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  // Acceptă Întrebare: și Intrebare: (cu sau fără diacritic Î)
  const parts = block.split(/(?=[ÎI]ntrebare:\s)/i);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed.match(/^[ÎIîi]ntrebare:/i)) continue;

    const qtextMatch = trimmed.match(/^[ÎIîi]ntrebare:\s*([\s\S]+?)(?=\n\s*[•*\-]\s*[A-Fa-f][.):]|\n\s*[A-Fa-f][.):])/i);
    if (!qtextMatch) continue;
    const questionText = qtextMatch[1].trim().replace(/\s+/g, " ");
    if (questionText.length < 5) continue;

    const answerRaw = [...trimmed.matchAll(/[•*\-]?\s*([A-Fa-f])[.)]\s*(.+?)(?=\n\s*(?:[•*\-]?\s*[A-Fa-f][.)]|R[aă]spuns|Explicație|Feedback|$))/gi)];
    if (answerRaw.length < 2) continue;

    const answers: ParsedAnswer[] = answerRaw.map((m) => ({
      answer_text: m[2].trim().replace(/\s+/g, " "),
      is_correct: false,
      feedback: "",
    }));

    const correctMatch = trimmed.match(/R[aă]spuns\s+corect:\s*([A-Fa-f])/i);
    if (correctMatch) {
      const idx = correctMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < answers.length) answers[idx].is_correct = true;
    }
    if (!answers.some((a) => a.is_correct)) answers[0].is_correct = true;

    const feedbackMatch = trimmed.match(/Feedback\s+pozitiv:\s*(.+?)(?:\n|$)/i);
    const correctIdx = answers.findIndex((a) => a.is_correct);
    if (feedbackMatch && correctIdx >= 0) {
      answers[correctIdx].feedback = feedbackMatch[1].trim();
    }

    questions.push({ question_text: questionText, answers });
  }

  return questions;
}

// ─── Parser format clasic "1. Întrebare\na) răspuns" cu barem ─────────────────
export function parseClassicFormat(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  const baremMap: Record<number, string> = {};
  const baremSection = text.match(/(?:barem|anex[aă]|r[aă]spunsuri\s+corecte)[^\n]*\n([\s\S]*?)(?:\n\n\n|$)/i);
  if (baremSection) {
    for (const line of baremSection[1].split("\n")) {
      const m = line.match(/^\s*(\d+)[.\s\t]+([a-fA-F]|adev[aă]rat|fals|true|false)/i);
      if (m) baremMap[parseInt(m[1])] = m[2].toLowerCase();
    }
  }

  const questionBlocks = text.split(/(?=\n?\s*\d{1,2}[.)]\s+[A-ZÎÂĂȘȚ])/);
  let qIndex = 1;
  for (const block of questionBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const qMatch = trimmed.match(/^(\d{1,2})[.)]\s+(.+?)(?=\n|☐|\[|a\))/i);
    if (!qMatch) continue;

    const qNum = parseInt(qMatch[1]);
    const questionText = qMatch[2].trim().replace(/\s+/g, " ");
    if (questionText.length < 5) continue;

    const answerPart = trimmed.replace(/^\d{1,2}[.)]\s+.+?\n/, "\n");
    const answerPattern = /(?:☐\s*|□\s*|\[\s*\]\s*)?([a-fA-F])\)\s*([^☐□\[\]]+?)(?=(?:☐\s*|□\s*|\[\s*\])?[b-fB-F]\)|$)/g;
    const answers: ParsedAnswer[] = [];
    let answerMatch;

    while ((answerMatch = answerPattern.exec(answerPart)) !== null) {
      const letter = answerMatch[1].toLowerCase();
      const answerText = answerMatch[2].trim().replace(/\s+/g, " ");
      if (answerText.length < 1) continue;
      const correctLetter = baremMap[qNum] || baremMap[qIndex];
      answers.push({ answer_text: answerText, is_correct: correctLetter ? correctLetter === letter : false, feedback: "" });
    }

    if (answers.length >= 2) {
      if (!answers.some((a) => a.is_correct)) answers[0].is_correct = true;
      questions.push({ question_text: questionText, answers });
      qIndex++;
    }
  }

  return questions;
}

// ─── Parser format nou: "Întrebarea N\ntextul\nA. varianta\nRăspuns corect: A" ─
// Acceptă și varianta fără diacritice: "Intrebarea N", "Raspuns corect"
export function parseNewFormatQuestions(block: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  // Split acceptă atât Întrebarea cât și Intrebarea (cu/fără î circumflex)
  const parts = block.split(/\n(?=[ÎI]ntrebarea\s+\d+)/gi);

  for (const part of parts) {
    const trimmed = part.trim();
    // Acceptă Întrebarea N și Intrebarea N
    if (!/^[ÎI]ntrebarea\s+\d+/i.test(trimmed)) continue;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 4) continue;

    const questionText = lines[1];
    if (!questionText || questionText.length < 3) continue;

    const answers: ParsedAnswer[] = [];
    let correctLetter = "";

    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const answerMatch = line.match(/^([A-F])[.):\s]\s*(.+)/i);
      if (answerMatch) {
        answers.push({ answer_text: answerMatch[2].trim(), is_correct: false, feedback: "" });
        continue;
      }
      // Acceptă Răspuns corect și Raspuns corect (cu/fără ă)
      const correctMatch = line.match(/R[aă]spuns\s+corect:\s*([A-F])/i);
      if (correctMatch) correctLetter = correctMatch[1].toUpperCase();
    }

    if (answers.length >= 2) {
      if (correctLetter) {
        const idx = correctLetter.charCodeAt(0) - 65;
        if (idx >= 0 && idx < answers.length) answers[idx].is_correct = true;
      }
      if (!answers.some((a) => a.is_correct)) answers[0].is_correct = true;
      questions.push({ question_text: questionText, answers });
    }
  }
  return questions;
}

// ─── Parsare orice bloc: încearcă toate formatele ─────────────────────────────
export function parseAnyFormat(block: string): ParsedQuestion[] {
  const structured = parseQuestionsFromBlock(block);
  if (structured.length > 0) return structured;
  const newFormat = parseNewFormatQuestions(block);
  if (newFormat.length > 0) return newFormat;
  return parseClassicFormat(block);
}

// ─── Detectare secțiuni multiple (format M01_L01 / M01_FINAL / Quiz – Title) ─
export function detectQuizSections(text: string): QuizSection[] {
  const sectionMarker = /(?:^|\n)([A-Z]\d+_(?:L\d+|FINAL)|Quiz)\s*[\-–—―‒―]\s*([^\n]+)/gi;
  const markers: { title: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionMarker.exec(text)) !== null) {
    markers.push({ title: m[2].trim(), index: m.index });
  }

  if (markers.length === 0) {
    const questions = parseAnyFormat(text);
    if (questions.length === 0) return [];
    return [{ title: "Quiz", questions }];
  }

  if (markers.length === 1) {
    const start = markers[0].index;
    const questions = parseAnyFormat(text.slice(start));
    if (questions.length === 0) return [];
    return [{ title: markers[0].title, questions }];
  }

  const sections: QuizSection[] = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
    const block = text.slice(start, end);
    const questions = parseAnyFormat(block);
    if (questions.length > 0) {
      sections.push({ title: markers[i].title, questions });
    }
  }
  return sections;
}

// ─── Mapare secțiuni quiz la structura curriculum (M01_L02 → modules[0].lessons[1]) ─
export interface QuizSectionWithId {
  sectionId: string; // e.g. "M01_L02" or "M01_FINAL"
  title: string;
  questions: ParsedQuestion[];
}

// Detectează secțiunile quiz și le asociază cu ID-ul lecției/modulului.
// Strategie: caută TOATE apariţiile ID-urilor M01_L01 / M01_FINAL în text,
// fără restricție de poziție pe linie — mai robustă față de variații de format.
export function detectQuizSectionsWithId(text: string): QuizSectionWithId[] {
  const idRe = /([A-Z]\d+_(?:L\d+|FINAL))/gi;
  const allOccurrences: { sectionId: string; index: number; lineStart: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = idRe.exec(text)) !== null) {
    const matchIdx = m.index;
    const lineStart = text.lastIndexOf("\n", matchIdx - 1) + 1;
    allOccurrences.push({ sectionId: m[1].toUpperCase(), index: matchIdx, lineStart });
  }

  if (allOccurrences.length === 0) return [];

  // Extrage bloc de text pentru fiecare apariție și încearcă să parseze întrebări
  // Dacă același ID apare de mai multe ori, păstrăm cel cu mai multe întrebări
  const bestBySection = new Map<string, QuizSectionWithId>();

  for (let i = 0; i < allOccurrences.length; i++) {
    const { sectionId, lineStart } = allOccurrences[i];

    // Blocul se termină la apariția URMĂTORULUI ID (oricare)
    const nextIdx = i + 1 < allOccurrences.length ? allOccurrences[i + 1].lineStart : text.length;
    const block = text.slice(lineStart, nextIdx);

    const questions = parseAnyFormat(block);
    if (questions.length === 0) continue;

    // Extrage titlul din prima linie a blocului
    const firstLine = block.split("\n")[0].trim();
    const titleMatch = firstLine.match(/[A-Z]\d+_(?:L\d+|FINAL)\s*[\-–—―]?\s*(.*)/i);
    const title = titleMatch?.[1]?.trim() || sectionId;

    const existing = bestBySection.get(sectionId);
    if (!existing || questions.length > existing.questions.length) {
      bestBySection.set(sectionId, { sectionId, title, questions });
    }
  }

  return Array.from(bestBySection.values());
}

// ─── Utilitar debug: returnează ce ID-uri de secțiune sunt prezente în text ────
export function findSectionIds(text: string): string[] {
  const ids: string[] = [];
  const re = /([A-Z]\d+_(?:L\d+|FINAL))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = m[1].toUpperCase();
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}
