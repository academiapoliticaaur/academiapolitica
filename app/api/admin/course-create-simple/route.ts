import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { title, age_group, audience } = await request.json() as {
    title: string;
    age_group?: string;
    audience?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Titlul cursului este obligatoriu" }, { status: 400 });
  }

  const db = createAdminClient();
  let slug = slugify(title);

  // Ensure unique slug
  const { count } = await db.from("courses").select("id", { count: "exact", head: true }).eq("slug", slug);
  if (count && count > 0) slug = `${slug}-${Date.now()}`;

  const { data: course, error } = await db
    .from("courses")
    .insert({
      title: title.trim(),
      slug,
      description: "",
      age_group: age_group ?? "0-4",
      audience: audience ?? "children",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !course) {
    return NextResponse.json({ error: error?.message ?? "Eroare la creare curs" }, { status: 500 });
  }

  return NextResponse.json({ courseId: course.id });
}
