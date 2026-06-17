import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashStudentPin(pin: string): string {
  return createHash("sha256").update(`academia-aur-elev:${pin}`).digest("hex");
}

function generateStudentCode(name: string): string {
  const words = name.trim().toUpperCase().replace(/[^A-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EL";
  if (words.length === 1) return words[0].slice(0, 3);
  return words.map((w) => w[0]).join("").slice(0, 6);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { current += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const db = createAdminClient();

  const { data: cls } = await db.from("classes").select("id").eq("id", id).eq("teacher_id", user.id).single();
  if (!cls) return NextResponse.json({ error: "Clasa nu a fost găsită" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Niciun fișier selectat" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) return NextResponse.json({ error: "Fișierul este gol" }, { status: 400 });

  // Skip header row if first cell matches known header names
  const startRow = /^(nume|name|elev|student)/i.test(rows[0]?.[0]?.trim() ?? "") ? 1 : 0;
  const dataRows = rows.slice(startRow).filter((row) => row[0]?.trim());

  if (dataRows.length === 0) return NextResponse.json({ error: "Nu s-au găsit rânduri cu date" }, { status: 400 });
  if (dataRows.length > 100) return NextResponse.json({ error: "Maximum 100 elevi per import" }, { status: 400 });

  const { data: existing } = await db.from("class_students").select("student_code").eq("class_id", id);
  const usedCodes = new Set((existing ?? []).map((s) => s.student_code));

  type StudentInsert = { class_id: string; display_name: string; student_code: string; age_group: string; student_pin: string };
  const toInsert: StudentInsert[] = [];
  const pinsForReturn: Array<{ display_name: string; student_code: string; pin: string }> = [];
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const display_name = row[0]?.trim();
    let age_group = row[1]?.trim() || "5-8";

    if (!display_name) {
      errors.push(`Rândul ${startRow + i + 2}: Numele lipsește`);
      continue;
    }
    if (display_name.length > 40) {
      errors.push(`Rândul ${startRow + i + 2}: Numele "${display_name.slice(0, 20)}…" depășește 40 de caractere`);
      continue;
    }
    if (!["0-4", "5-8"].includes(age_group)) age_group = "5-8";

    const base = generateStudentCode(display_name);
    let student_code = base;
    let suffix = 1;
    while (usedCodes.has(student_code)) { student_code = `${base}${suffix}`; suffix++; }
    usedCodes.add(student_code);

    const pin = generatePin();
    toInsert.push({ class_id: id, display_name, student_code, age_group, student_pin: hashStudentPin(pin) });
    pinsForReturn.push({ display_name, student_code, pin });
  }

  if (toInsert.length === 0) {
    return NextResponse.json({ error: "Nu s-a putut procesa niciun rând", errors }, { status: 400 });
  }

  const { error: insertError } = await db.from("class_students").insert(toInsert);
  if (insertError) {
    return NextResponse.json({ error: "Eroare la salvare: " + insertError.message }, { status: 500 });
  }

  return NextResponse.json({ added: toInsert.length, errors, students: pinsForReturn });
}
