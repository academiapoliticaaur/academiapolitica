export const runtime = "nodejs";
export const maxDuration = 30;

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

const MODULE_SYSTEM_PROMPT = `Ești un expert în design educațional. Extrage structura unui singur modul dintr-un document de curriculum.
Extrage TOATE lecțiile din document, nu omite nicio lecție.
Returnează EXCLUSIV un obiect JSON valid:
{
  "title": "string (titlul modulului)",
  "description": "string (1-2 propoziții)",
  "badge_name": "string (competența dobândită, sau string gol dacă nu există)",
  "learning_objectives": ["string"],
  "has_module_quiz": boolean,
  "lessons": [
    {
      "title": "string",
      "description": "string (1-2 propoziții)",
      "main_message": "string (1 propoziție — mesajul cheie al lecției)",
      "objectives": ["string"],
      "content_type": "video|presentation|worksheet|mixed",
      "has_lesson_quiz": boolean,
      "duration_minutes": number
    }
  ]
}
Reguli: returnează DOAR JSON valid, fără text suplimentar. Toate câmpurile sunt obligatorii.`;

const GROQ_MODELS = [
  { model: "llama-3.3-70b-versatile", maxOutputTokens: 3000, maxInputChars: 20000 },
  { model: "llama-3.1-8b-instant",    maxOutputTokens: 1500, maxInputChars: 8000 },
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY lipsă" }, { status: 500 });
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
    rawText = normalizeText(await extractText(buffer, ext));
  } catch (e) {
    return NextResponse.json({ error: `Eroare citire fișier: ${e instanceof Error ? e.message : e}` }, { status: 422 });
  }

  if (!rawText || rawText.trim().length < 50) {
    return NextResponse.json({ error: "Documentul este prea scurt sau gol" }, { status: 400 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  let raw = "";

  for (const cfg of GROQ_MODELS) {
    const textSnippet = rawText.slice(0, cfg.maxInputChars);
    try {
      const completion = await groq.chat.completions.create({
        model: cfg.model,
        messages: [
          { role: "system", content: MODULE_SYSTEM_PROMPT },
          { role: "user", content: `Extrage structura modulului din acest document:\n\n${textSnippet}` },
        ],
        temperature: 0.1,
        max_tokens: cfg.maxOutputTokens,
        response_format: { type: "json_object" },
      });
      raw = completion.choices[0]?.message?.content ?? "";
      break;
    } catch (e: unknown) {
      const err = e as { status?: number };
      if ((err.status === 429 || err.status === 413) && cfg !== GROQ_MODELS[GROQ_MODELS.length - 1]) {
        continue;
      }
      return NextResponse.json({ error: `Eroare Groq API: ${e instanceof Error ? e.message : e}` }, { status: 502 });
    }
  }

  if (!raw) {
    return NextResponse.json({ error: "Nu s-a putut obține răspuns de la AI." }, { status: 502 });
  }

  const jsonStr = extractJson(raw);
  let parsed: { title: string; description: string; badge_name: string; learning_objectives: string[]; has_module_quiz: boolean; lessons: unknown[] };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json({ error: "AI-ul nu a returnat JSON valid. Încearcă din nou." }, { status: 422 });
  }

  if (!parsed.title || !Array.isArray(parsed.lessons)) {
    return NextResponse.json({ error: "Structura modulului nu a putut fi extrasă" }, { status: 422 });
  }

  return NextResponse.json({ module: parsed });
}
