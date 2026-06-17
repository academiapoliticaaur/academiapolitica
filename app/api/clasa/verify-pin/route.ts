import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";

// In-memory rate limiter: max 10 încercări / 5 min per IP+studentCode
// Notă: în-memory nu persistă între instanțe serverless — adaugă Upstash pentru producție la scară.
const rateLimitMap = new Map<string, { count: number; firstAt: number }>();
const RL_WINDOW = 5 * 60 * 1000; // 5 minute
const RL_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.firstAt > RL_WINDOW) {
    rateLimitMap.set(key, { count: 1, firstAt: now });
    return true;
  }
  if (entry.count >= RL_MAX) return false;
  entry.count++;
  return true;
}

function hashStudentPin(pin: string): string {
  return createHash("sha256").update(`ami-moti-elev:${pin}`).digest("hex");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const { classCode, studentCode, pin } = await request.json() as {
    classCode: string;
    studentCode: string;
    pin: string;
  };

  if (!classCode || !studentCode || !pin) {
    return NextResponse.json({ error: "Date lipsă" }, { status: 400 });
  }
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PIN invalid" }, { status: 400 });
  }

  const rlKey = `${ip}:${studentCode}`;
  if (!checkRateLimit(rlKey)) {
    return NextResponse.json({ error: "Prea multe încercări. Încearcă din nou peste 5 minute." }, { status: 429 });
  }

  const db = createAdminClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, status")
    .eq("access_code", classCode.toUpperCase())
    .single();

  if (!cls || cls.status !== "active") {
    return NextResponse.json({ error: "Clasa nu a fost găsită" }, { status: 404 });
  }

  const { data: student } = await db
    .from("class_students")
    .select("id, student_pin")
    .eq("class_id", cls.id)
    .eq("student_code", studentCode.toUpperCase())
    .single();

  if (!student) {
    return NextResponse.json({ error: "Elevul nu a fost găsit" }, { status: 404 });
  }

  // Student without PIN — allow access
  if (!student.student_pin) {
    return NextResponse.json({ ok: true });
  }

  if (student.student_pin !== hashStudentPin(pin)) {
    return NextResponse.json({ error: "PIN incorect. Încearcă din nou!" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
