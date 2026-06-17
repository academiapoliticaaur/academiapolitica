import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureLessonFolder } from "@/lib/google-drive";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { courseId, moduleId, lessonId } = await req.json() as {
    courseId: string; moduleId: string; lessonId: string;
  };

  if (!courseId || !moduleId || !lessonId) {
    return NextResponse.json({ error: "courseId, moduleId, lessonId sunt obligatorii" }, { status: 400 });
  }

  const db = createAdminClient();

  const [{ data: course }, { data: module_ }, { data: lesson }] = await Promise.all([
    db.from("courses").select("title").eq("id", courseId).single(),
    db.from("modules").select("title").eq("id", moduleId).single(),
    db.from("lessons").select("title").eq("id", lessonId).single(),
  ]);

  if (!course || !module_ || !lesson) {
    return NextResponse.json({ error: "Curs, modul sau lecție negăsite" }, { status: 404 });
  }

  try {
    const folders = await ensureLessonFolder({
      courseId, courseTitle: course.title,
      moduleId, moduleTitle: module_.title,
      lessonId, lessonTitle: lesson.title,
    });
    return NextResponse.json(folders);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Eroare Google Drive";
    const status = msg.includes("neconectat") ? 503 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
