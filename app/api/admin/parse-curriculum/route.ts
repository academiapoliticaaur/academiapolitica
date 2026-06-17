export const runtime = "nodejs";
export const maxDuration = 120;

// pdf-parse v2 requires DOMMatrix (browser API) — polyfill for Node.js
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error polyfill required by pdf-parse canvas dependency
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() { return this; }
  };
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import mammoth from "mammoth";
import Groq from "groq-sdk";
import { detectQuizSectionsWithId, findSectionIds } from "@/lib/utils/quiz-parser";
import type { ParsedQuestion } from "@/lib/utils/quiz-parser";

interface ParsedAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}

interface QuizData {
  title: string;
  questions: Array<{ question_text: string; answers: ParsedAnswer[] }>;
}

interface ParsedLesson {
  title: string;
  description: string;
  main_message: string;
  objectives: string[];
  content_type: "video" | "presentation" | "worksheet" | "quiz" | "mixed";
  has_lesson_quiz: boolean;
  quiz?: QuizData;
  duration_minutes: number | null;
}

interface ParsedModule {
  title: string;
  description: string;
  badge_name: string;
  learning_objectives: string[];
  has_module_quiz: boolean;
  final_module_quiz?: QuizData;
  lessons: ParsedLesson[];
}

interface ParsedCurriculum {
  course_title: string;
  course_description: string;
  age_group: string;
  audience: string;
  estimated_duration_hours: number;
  modules: ParsedModule[];
}

const SYSTEM_PROMPT = `Ești un expert în design educațional. Analizezi un document de curriculum educațional și extragi structura COMPLETĂ.

IMPORTANT — detectează tipul de document:
- Dacă documentul este un ghid pentru ÎNVĂȚĂTORI sau PROFESORI (ghid de predare, resurse cadre didactice, plan de lecție pentru cadre), setează "audience": "invatator" sau "profesor"
- Dacă documentul este un curs pentru COPII sau ELEVI, setează "audience": "children"
- audience "invatator" = material pentru cei care predau la clase 0-4
- audience "profesor" = material pentru cei care predau la clase 5-8
- Titlul cursului ("course_title") trebuie să fie titlul ACESTUI document, nu al unui curs asociat menționat în text

EXTRAGE TOATE modulele și TOATE lecțiile din document — nu omite nimic, chiar dacă documentul este lung.
Descrierile pot fi scurte (1-2 propoziții) pentru a economisi spațiu.

IMPORTANT pentru lessons[]:
- Includeți DOAR lecțiile de conținut (video, prezentare, fișă de lucru)
- NU includeți quiz-uri sau teste finale de modul în array-ul lessons[]
- Dacă există un quiz/test final de modul, setează has_module_quiz: true (nu îl adăuga ca lecție)
- Dacă lecția are un quiz atașat, setează has_lesson_quiz: true

Returnează EXCLUSIV un obiect JSON valid:
{
  "course_title": "string (titlul ACESTUI document, nu al unui curs asociat)",
  "course_description": "string (2-3 propoziții)",
  "age_group": "string (ex: '0-4', '5-8')",
  "audience": "children|invatator|profesor",
  "estimated_duration_hours": number,
  "modules": [
    {
      "title": "string",
      "description": "string (1-2 propoziții)",
      "badge_name": "string (competența dobândită, ex: 'Explorator Digital')",
      "learning_objectives": ["string"],
      "has_module_quiz": boolean,
      "lessons": [
        {
          "title": "string",
          "description": "string (1-2 propoziții)",
          "main_message": "string (mesajul principal în 1 propoziție)",
          "objectives": ["string"],
          "content_type": "video|presentation|worksheet|mixed",
          "has_lesson_quiz": boolean,
          "duration_minutes": number|null
        }
      ]
    }
  ]
}

Reguli: returnează DOAR JSON valid, fără text suplimentar. Toate câmpurile sunt obligatorii.`;

const GROQ_MODELS: { model: string; maxOutputTokens: number; maxInputChars: number }[] = [
  { model: "llama-3.3-70b-versatile", maxOutputTokens: 12000, maxInputChars: 80000 },
  // maxInputChars crescuit la 20000 (de la 6000) pentru că scheletul structural
  // pentru 6+ module ajunge la ~10-12K chars — vechea limită tăia la modulul 3.
  { model: "llama-3.1-8b-instant",    maxOutputTokens: 4000, maxInputChars: 20000 },
];

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/^\d+\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extrage scheletul structural al documentului: metadata curs + titluri module/lecții
// cu primele ~400 caractere de context fiecare. Reduce input-ul de la 80K la ~5-15K chars.
// Quizurile sunt parsate separat din textul complet — nu sunt incluse în schelet.
function buildStructuralSkeleton(text: string): { skeleton: string; moduleCount: number; lessonCount: number } {
  // Oprire înaintea secțiunii quiz — quizurile sunt parsate separat fără AI
  const quizIdx = text.search(/SEC[TȚ]IUNEA\s+QUIZ(?:-URI)?|QUIZ-URI\s*\n/i);
  const content = quizIdx > 200 ? text.slice(0, quizIdx) : text;

  const moduleRe = /^(?:MODUL|Modulul?)\s+\d+[:\s.]+.+$/gim;
  const lessonRe = /^Lec[tț]ia\s+[\d.]+[:\s]+.+$/gim;
  const headingRe = /^((?:MODUL|Modulul?)\s+\d+[:\s.]+.+|Lec[tț]ia\s+[\d.]+[:\s]+.+)$/gim;

  const moduleCount = (content.match(moduleRe) ?? []).length;
  const lessonCount = (content.match(lessonRe) ?? []).length;

  let m: RegExpExecArray | null;
  const hits: number[] = [];
  while ((m = headingRe.exec(content)) !== null) hits.push(m.index);

  // Dacă nu s-au detectat titluri structurate, returnăm textul ca atare (document nestandard)
  if (hits.length === 0) return { skeleton: content, moduleCount: 0, lessonCount: 0 };

  const parts: string[] = [];

  // Header explicit: spune AI-ului câte module să extragă — previne oprire anticipată
  parts.push(`[STRUCTURA DETECTATĂ: ${moduleCount} module, ${lessonCount} lecții — extrage TOATE]`);

  // Primele caractere înaintea primului titlu = metadata curs (titlu, audiență, vârstă)
  const headerEnd = Math.min(hits[0], 1000);
  if (headerEnd > 0) parts.push(content.slice(0, headerEnd).trim());

  // Fiecare titlu + primele 400 caractere de context (descriere, mesaj central)
  for (let i = 0; i < hits.length; i++) {
    const start = hits[i];
    const nextStart = i + 1 < hits.length ? hits[i + 1] : content.length;
    const end = Math.min(start + 400, nextStart);
    parts.push(content.slice(start, end).trim());
  }

  return { skeleton: parts.filter(Boolean).join("\n\n"), moduleCount, lessonCount };
}

async function extractText(buffer: Buffer, ext: string): Promise<string> {
  if (ext === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (ext === "pdf") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
    const data = await pdfParse(buffer);
    return data.text;
  }
  throw new Error(`Format nesuportat: ${ext}`);
}

function extractWaitTime(errorMessage: string): string {
  const match = errorMessage.match(/try again in (\d+m[\d.]+s|[\d.]+s)/i);
  return match ? match[1] : "";
}

// Curăță output-ul AI: elimină lecțiile-quiz din lessons[] și normalizează has_module_quiz
function postProcessCurriculum(curriculum: ParsedCurriculum): ParsedCurriculum {
  for (const mod of curriculum.modules) {
    if (!Array.isArray(mod.lessons)) { mod.lessons = []; continue; }

    const quizLessons = mod.lessons.filter(
      (l) =>
        l.content_type === "quiz" ||
        /FINAL_QUIZ|_FINAL\b|quiz\s*final\s*modul|test\s*final/i.test(l.title)
    );

    if (quizLessons.length > 0) {
      mod.lessons = mod.lessons.filter(
        (l) =>
          l.content_type !== "quiz" &&
          !/FINAL_QUIZ|_FINAL\b|quiz\s*final\s*modul|test\s*final/i.test(l.title)
      );
      mod.has_module_quiz = true;
    }
  }
  return curriculum;
}

// Injectează întrebările de quiz din parsarea locală în structura curriculum
function injectQuizQuestions(
  curriculum: ParsedCurriculum,
  rawText: string
): { curriculum: ParsedCurriculum; quizzesDetected: number } {
  const sections = detectQuizSectionsWithId(rawText);
  if (sections.length === 0) return { curriculum, quizzesDetected: 0 };

  let quizzesDetected = 0;

  for (const section of sections) {
    const id = section.sectionId.toUpperCase(); // e.g. "M01_L02" or "M01_FINAL"

    // Parsează M01_L02: mIdx=0, lIdx=1
    const lessonMatch = id.match(/^[A-Z](\d+)_L(\d+)$/);
    const finalMatch = id.match(/^[A-Z](\d+)_FINAL$/);

    if (lessonMatch) {
      const mIdx = parseInt(lessonMatch[1]) - 1;
      const lIdx = parseInt(lessonMatch[2]) - 1;
      const mod = curriculum.modules[mIdx];
      if (mod?.lessons?.[lIdx]) {
        mod.lessons[lIdx].quiz = {
          title: section.title,
          questions: section.questions as ParsedQuestion[],
        };
        mod.lessons[lIdx].has_lesson_quiz = true;
        quizzesDetected++;
      }
    } else if (finalMatch) {
      const mIdx = parseInt(finalMatch[1]) - 1;
      const mod = curriculum.modules[mIdx];
      if (mod) {
        mod.final_module_quiz = {
          title: `Quiz final — ${mod.title}`,
          questions: section.questions as ParsedQuestion[],
        };
        mod.has_module_quiz = true;
        quizzesDetected++;
      }
    }
  }

  return { curriculum, quizzesDetected };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY lipsă — adaugă-l în Vercel env vars" }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Fișier lipsă" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!["docx", "pdf"].includes(ext)) {
    return NextResponse.json({ error: "Doar fișiere DOCX sau PDF" }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Fișierul depășește 4MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawText: string;
  try {
    rawText = await extractText(buffer, ext);
  } catch (e) {
    return NextResponse.json({ error: `Eroare citire fișier: ${e instanceof Error ? e.message : e}` }, { status: 422 });
  }

  if (!rawText || rawText.trim().length < 100) {
    return NextResponse.json({ error: "Documentul este prea scurt sau gol" }, { status: 400 });
  }

  rawText = normalizeText(rawText);

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // Dacă documentul e mare, trimitem doar scheletul structural (titluri + context scurt)
  // Quizurile sunt parsate din textul complet, separat — nu sunt afectate de acest pas
  const SKELETON_THRESHOLD = 15000; // chars
  const skeletonUsed = rawText.length > SKELETON_THRESHOLD;
  let textForGroq = rawText;
  let skeletonModuleCount = 0;
  let skeletonLessonCount = 0;
  if (skeletonUsed) {
    const { skeleton, moduleCount, lessonCount } = buildStructuralSkeleton(rawText);
    textForGroq = skeleton;
    skeletonModuleCount = moduleCount;
    skeletonLessonCount = lessonCount;
  }

  let raw = "";
  let usedModel = "";

  for (const cfg of GROQ_MODELS) {
    const textSnippet = textForGroq.slice(0, cfg.maxInputChars);
    const userMsg = skeletonUsed
      ? `Analizează structura acestui curriculum (schelet structural — conținut narativ omis, doar titluri și context esențial):\n\n${textSnippet}`
      : `Analizează acest curriculum și extrage structura:\n\n${textSnippet}`;
    try {
      const completion = await groq.chat.completions.create({
        model: cfg.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        temperature: 0.1,
        max_tokens: cfg.maxOutputTokens,
        response_format: { type: "json_object" },
      });
      raw = completion.choices[0]?.message?.content ?? "";
      usedModel = cfg.model;
      break;
    } catch (e: unknown) {
      const err = e as { status?: number; message?: string; error?: { message?: string } };
      const shouldFallback = err.status === 429 || err.status === 413;
      const isLastModel = cfg === GROQ_MODELS[GROQ_MODELS.length - 1];

      if (shouldFallback && !isLastModel) continue;

      if (shouldFallback) {
        const errMsg = err.error?.message ?? err.message ?? "";
        const waitTime = extractWaitTime(errMsg);
        return NextResponse.json({
          error: `Limită API depășită pe toate modelele disponibile.${waitTime ? ` Încearcă din nou în ${waitTime}.` : " Încearcă din nou în câteva minute sau upgradează planul Groq la console.groq.com."}`,
          rateLimited: true,
        }, { status: 429 });
      }

      return NextResponse.json({ error: `Eroare Groq API: ${e instanceof Error ? e.message : e}` }, { status: 502 });
    }
  }

  if (!raw) {
    return NextResponse.json({ error: "Nu s-a putut obține răspuns de la AI." }, { status: 502 });
  }

  function extractJson(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith("{")) return trimmed;
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) return fenced[1].trim();
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }
    return trimmed;
  }

  let jsonStr = extractJson(raw);

  let parsed: ParsedCurriculum | null = null;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Retry automat cu prompt simplificat — recuperează ~80% din cazurile de eșec
    try {
      const retryCompletion = await groq.chat.completions.create({
        model: GROQ_MODELS[0].model,
        messages: [
          { role: "system", content: "Returnează EXCLUSIV un obiect JSON valid cu structura cerută. Fără text suplimentar." },
          { role: "user", content: `Ai returnat JSON invalid. Reîncearcă și returnează DOAR JSON:\n\n${textForGroq.slice(0, GROQ_MODELS[0].maxInputChars)}` },
        ],
        temperature: 0,
        max_tokens: GROQ_MODELS[0].maxOutputTokens,
        response_format: { type: "json_object" },
      });
      jsonStr = extractJson(retryCompletion.choices[0]?.message?.content ?? "");
      parsed = JSON.parse(jsonStr);
    } catch {
      const preview = jsonStr.slice(-100);
      const isTruncated = !jsonStr.trimEnd().endsWith("}");
      const hint = isTruncated
        ? " JSON trunchiat — documentul poate fi prea mare. Încearcă cu un document mai scurt."
        : " Încearcă din nou.";
      return NextResponse.json({
        error: `AI-ul nu a returnat JSON valid după retry automat.${hint}`,
        debug: preview,
      }, { status: 422 });
    }
  }

  if (!parsed || !parsed.course_title || !Array.isArray(parsed.modules)) {
    return NextResponse.json({ error: "Structura nu a putut fi extrasă complet" }, { status: 422 });
  }

  // 1. Elimină lecțiile-quiz duplicate extrase de AI (le va crea has_module_quiz)
  parsed = postProcessCurriculum(parsed);

  // 2. Injectează întrebările detectate local din DOCX (fără AI, fără limite token)
  const { curriculum: enrichedCurriculum, quizzesDetected } = injectQuizQuestions(parsed, rawText);

  // Info debug — ajută la diagnosticarea problemelor de format
  const sectionIdsInText = findSectionIds(rawText);

  const wasTruncated = !skeletonUsed && rawText.length > GROQ_MODELS[0].maxInputChars;
  return NextResponse.json({
    curriculum: enrichedCurriculum,
    model: usedModel,
    quizzesDetected,
    debug: {
      textLength: rawText.length,
      skeletonLength: skeletonUsed ? textForGroq.length : null,
      skeletonUsed,
      skeletonModuleCount: skeletonUsed ? skeletonModuleCount : null,
      skeletonLessonCount: skeletonUsed ? skeletonLessonCount : null,
      modulesExtracted: enrichedCurriculum.modules.length,
      textSample: rawText.slice(0, 500),
      sectionIdsFound: sectionIdsInText,
    },
    ...(wasTruncated ? { warning: `Documentul a fost trunchiat la ${GROQ_MODELS[0].maxInputChars} caractere. Verifică că toate modulele au fost extrase.` } : {}),
  });
}
