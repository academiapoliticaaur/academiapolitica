import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parseQuestionsFromBlock,
  parseClassicFormat,
  parseNewFormatQuestions,
  parseAnyFormat,
  detectQuizSections,
} from "@/lib/utils/quiz-parser";
import type { QuizSection } from "@/lib/utils/quiz-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  if (name.endsWith(".txt") || file.type === "text/plain") {
    return buffer.toString("utf-8");
  }
  if (name.endsWith(".pdf")) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const result = await pdfParse(buffer);
      return result.text || "";
    } catch {
      throw new Error("PDF-ul nu poate fi citit direct. Salvează ca .docx sau lipește textul.");
    }
  }
  throw new Error("Format nesuportat. Folosește .docx, .txt sau lipește textul.");
}

// ─── Parser cu AI (Groq) — returnează secțiuni quiz ─────────────
async function parseWithAI(text: string): Promise<QuizSection[]> {
  const systemPrompt = `Ești expert în extragerea quiz-urilor din documente educaționale românești.
Extrage TOATE quiz-urile și întrebările din document.
Returnează EXCLUSIV JSON cu structura:
{"quizzes":[{"title":"Titlul quiz-ului","questions":[{"question_text":"...","answers":[{"answer_text":"...","is_correct":true,"feedback":""},...]},...]},...]}
Reguli:
- Fiecare întrebare are exact UN is_correct:true
- Minim 2 variante de răspuns per întrebare
- Dacă documentul are secțiuni separate (ex: "Quiz – Titlu"), creează un quiz per secțiune
- Dacă nu există secțiuni clare, pune toate întrebările într-un singur quiz cu titlul "Quiz"
- Returnează DOAR JSON valid, fără text explicativ`;

  if (process.env.GROQ_API_KEY) {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.slice(0, 20000) },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    if (parsed.quizzes && Array.isArray(parsed.quizzes)) {
      return (parsed.quizzes as QuizSection[]).filter(
        (q) => q.title && Array.isArray(q.questions) && q.questions.length > 0
      );
    }
    const arr = parsed.questions ?? parsed.data ?? (Array.isArray(parsed) ? parsed : []);
    const valid = arr.filter((q: QuizSection) => q.questions?.length >= 2);
    return valid.length > 0 ? [{ title: "Quiz", questions: valid }] : [];
  }

  return [];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    let text = "";
    if (pastedText?.trim()) {
      text = pastedText.trim();
    } else if (file) {
      text = await extractText(file);
    } else {
      return NextResponse.json({ error: "Niciun fișier sau text furnizat." }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Nu s-a putut extrage text din fișier." }, { status: 422 });
    }

    const buildResponse = (sections: QuizSection[], method: string) => {
      const allQuestions = sections.flatMap((s) => s.questions);
      return NextResponse.json({
        quizzes: sections,
        questions: allQuestions,
        total: allQuestions.length,
        method,
        multipleQuizzes: sections.length > 1,
      });
    };

    // 1. Încearcă detectare secțiuni structurate (zero cost)
    const sections = detectQuizSections(text);
    if (sections.length > 0) return buildResponse(sections, "structured");

    // 2. Fallback format clasic a)/b)/c) (zero cost)
    const classicQuestions = parseClassicFormat(text);
    if (classicQuestions.length > 0) {
      return buildResponse([{ title: "Quiz", questions: classicQuestions }], "classic");
    }

    // 3. Fallback AI
    try {
      const aiSections = await parseWithAI(text);
      if (aiSections.length > 0) return buildResponse(aiSections, "ai");
    } catch (aiErr) {
      const errMsg = aiErr instanceof Error ? aiErr.message : "";
      if (errMsg.includes("credit") || errMsg.includes("billing")) {
        return NextResponse.json({ error: "Contul AI nu are credite disponibile." }, { status: 402 });
      }
    }

    return NextResponse.json({
      error: "Nu s-au găsit întrebări. Verifică formatul documentului sau contactează suportul.",
    }, { status: 422 });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Eroare necunoscută";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Re-exportăm tipurile pentru compatibilitate cu alte module
export type { QuizSection };
export { parseQuestionsFromBlock, parseNewFormatQuestions, parseClassicFormat, parseAnyFormat, detectQuizSections };
