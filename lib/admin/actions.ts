"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { setFileDownloadRestriction, isDriveConnected, createDriveFolder, getRootFolder } from "@/lib/google-drive";
import { getGoogleDriveFileId, isGoogleDriveUrl } from "@/lib/utils/google-drive";
import { recalculateCourseDuration } from "@/lib/admin/course-duration";
import { PLAN_DAYS, type SubscriptionPlan } from "@/lib/subscription";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function approveUser(userId: string, email: string, fullName: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("parent_profiles")
    .update({ approved: true, approved_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Academia Politica AUR <noreply@academia-aur.ro>",
    to: email,
    subject: "Contul tău Academia Politica AUR a fost aprobat!",
    html: `
<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:22px;margin-bottom:8px">Bună, ${fullName}! 🎉</h1>
    <p style="color:#6b7280">Contul tău a fost aprobat. Poți accesa platforma Ami &amp; Moti acum.</p>
    <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3b82f6;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Intră în cont →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af">Ami &amp; Moti · Platformă educațională</p>
  </div>
</body></html>`,
  });

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/parents");
  void logAdminAction("approve_account", { userId, email, fullName });
}

export async function createUser({
  full_name, email, password, isAdmin,
}: { full_name: string; email: string; password: string; isAdmin: boolean }): Promise<string> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
    app_metadata: { role: isAdmin ? "admin" : "parent" },
  });

  if (authError || !authData.user) throw new Error(authError?.message || "Eroare creare cont");

  const { error: profileError } = await supabase.from("parent_profiles").insert({
    user_id: authData.user.id,
    full_name,
    accepted_terms: true,
    parental_consent: true,
  });
  if (profileError) throw new Error("Cont creat, dar eroare profil: " + profileError.message);

  revalidatePath("/admin/parents");
  return authData.user.id;
}

export async function deleteParent(userId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: profile } = await supabase.from("parent_profiles").select("id").eq("user_id", userId).single();
  if (profile) {
    await supabase.from("child_profiles").delete().eq("parent_id", profile.id);
    await supabase.from("parent_profiles").delete().eq("id", profile.id);
  }
  await supabase.auth.admin.deleteUser(userId);
  revalidatePath("/admin/parents");
  revalidatePath("/admin/children");
  void logAdminAction("delete_user", { userId, type: "parent" });
}

export async function deleteChild(childId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("child_profiles").delete().eq("id", childId);
  revalidatePath("/admin/children");
}

export async function deleteTeacher(userId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("parent_profiles").delete().eq("user_id", userId);
  await supabase.auth.admin.deleteUser(userId);
  revalidatePath("/admin/teachers");
  void logAdminAction("delete_user", { userId, type: "teacher" });
}

export async function bulkApproveAccounts(
  users: { userId: string; email: string; fullName: string }[]
): Promise<{ approved: number; errors: number }> {
  await requireAdmin();
  let approved = 0;
  let errors = 0;
  for (const u of users) {
    try {
      await approveUser(u.userId, u.email, u.fullName);
      approved++;
    } catch {
      errors++;
    }
  }
  return { approved, errors };
}

export async function bulkApproveSubscriptions(
  requests: { requestId: string; userId: string; plan: SubscriptionPlan }[]
): Promise<{ approved: number; errors: number }> {
  await requireAdmin();
  let approved = 0;
  let errors = 0;
  for (const r of requests) {
    try {
      await approveSubscriptionRequest(r.requestId, r.userId, r.plan);
      approved++;
    } catch {
      errors++;
    }
  }
  return { approved, errors };
}

// ─── Audit log ────────────────────────────────────────────────────────────────
// Non-critical: wrapped în try/catch — acțiunea principală nu eșuează dacă log-ul eșuează.
// Migrație necesară: 013_admin_audit_log.sql

async function logAdminAction(
  action: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const adminSupa = await createClient();
    const { data: { user: adminUser } } = await adminSupa.auth.getUser();
    const db = createAdminClient();
    await db.from("admin_audit_log").insert({
      admin_id: adminUser?.id ?? null,
      action,
      details,
    });
  } catch { /* non-critical */ }
}

export async function setLessonStatus(lessonId: string, courseId: string, status: "draft" | "published") {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lessons")
    .update({ status })
    .eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export interface LessonUpdateInput {
  title: string;
  description?: string;
  lesson_type: "video" | "presentation" | "worksheet" | "quiz" | "mixed";
  video_url?: string;
  presentation_url?: string;
  worksheet_url?: string;
  duration_minutes?: number;
  order_index?: number;
  status?: "draft" | "reviewed" | "published";
  ai_generated?: boolean;
  human_reviewed?: boolean;
  reviewer_notes?: string;
  allow_download?: boolean;
}

export async function getLessonForEdit(lessonId: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  data: LessonUpdateInput
): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("lessons").update({
      title: data.title,
      description: data.description || null,
      lesson_type: data.lesson_type,
      video_url: data.video_url || null,
      presentation_url: data.presentation_url || null,
      worksheet_url: data.worksheet_url || null,
      duration_minutes: data.duration_minutes ?? null,
      order_index: data.order_index ?? 0,
      status: data.status ?? "draft",
      ai_generated: data.ai_generated ?? false,
      human_reviewed: data.human_reviewed ?? false,
      reviewer_notes: data.reviewer_notes || null,
      allow_download: data.allow_download ?? false,
    }).eq("id", lessonId);

    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}`);
    revalidateTag("courses", "max");

    // Durata cursului = suma duratelor declarate la nivel de lecție —
    // ține totalul sincronizat de fiecare dată când o lecție e editată
    await recalculateCourseDuration(supabase, courseId);

    // Sincronizează restricția Drive (copiere/printare/descărcare) cu bifa "allow_download" —
    // acoperă și fișierele legate manual (Google Picker), nu doar cele încărcate din formular
    const driveUrls = [data.video_url, data.presentation_url, data.worksheet_url]
      .filter((u): u is string => !!u && isGoogleDriveUrl(u));
    const fileIds = [...new Set(driveUrls.map(getGoogleDriveFileId).filter((id): id is string => !!id))];
    if (fileIds.length > 0) {
      const restrict = !(data.allow_download ?? false);
      const results = await Promise.allSettled(fileIds.map((id) => setFileDownloadRestriction(id, restrict)));
      results.forEach((r, i) => {
        if (r.status === "rejected") console.error(`Eroare sincronizare restricție Drive (${fileIds[i]}):`, r.reason);
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function activateSubscription(userId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const plan = formData.get("plan") as SubscriptionPlan;
  if (!plan || !PLAN_DAYS[plan]) throw new Error("Plan invalid");

  const supabase = createAdminClient();
  const adminSupa = await createClient();
  const { data: { user: adminUser } } = await adminSupa.auth.getUser();

  const days = PLAN_DAYS[plan];
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("parent_profiles")
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt.toISOString(),
      subscription_activated_by: adminUser?.id ?? null,
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/parents/${userId}/edit`);
  revalidatePath(`/admin/teachers/${userId}/edit`);
  revalidatePath("/admin/subscriptions");
  void logAdminAction("activate_subscription", { userId, plan, days });
}

export async function deactivateSubscription(userId: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("parent_profiles")
    .update({
      subscription_plan: null,
      subscription_expires_at: null,
      subscription_activated_by: null,
    })
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/parents/${userId}/edit`);
  revalidatePath(`/admin/teachers/${userId}/edit`);
  revalidatePath("/admin/subscriptions");
  void logAdminAction("deactivate_subscription", { userId });
}

export async function approveSubscriptionRequest(
  requestId: string,
  userId: string,
  plan: SubscriptionPlan
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const adminSupa = await createClient();
  const { data: { user: adminUser } } = await adminSupa.auth.getUser();

  const days = PLAN_DAYS[plan];
  if (!days) throw new Error("Plan invalid");

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // Activează abonamentul
  const { error: subError } = await supabase
    .from("parent_profiles")
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt.toISOString(),
      subscription_activated_by: adminUser?.id ?? null,
    })
    .eq("user_id", userId);

  if (subError) throw new Error(subError.message);

  // Marchează cererea ca aprobată
  await supabase
    .from("subscription_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: adminUser?.id ?? null })
    .eq("id", requestId);

  // Trimite email utilizatorului
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const { data: profile } = await supabase.from("parent_profiles").select("full_name").eq("user_id", userId).single();
    if (authUser?.user?.email) {
      const { sendSubscriptionResponseEmail } = await import("@/lib/email");
      await sendSubscriptionResponseEmail({
        userEmail: authUser.user.email,
        userName: profile?.full_name ?? "Utilizator",
        approved: true,
        plan,
      });
    }
  } catch { /* email non-critical */ }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/subscriptions");
  void logAdminAction("approve_subscription", { requestId, userId, plan });
}

export async function rejectSubscriptionRequest(
  requestId: string,
  userId: string
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const adminSupa = await createClient();
  const { data: { user: adminUser } } = await adminSupa.auth.getUser();

  await supabase
    .from("subscription_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: adminUser?.id ?? null })
    .eq("id", requestId);

  // Trimite email utilizatorului
  try {
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const { data: profile } = await supabase.from("parent_profiles").select("full_name").eq("user_id", userId).single();
    if (authUser?.user?.email) {
      const { sendSubscriptionResponseEmail } = await import("@/lib/email");
      await sendSubscriptionResponseEmail({
        userEmail: authUser.user.email,
        userName: profile?.full_name ?? "Utilizator",
        approved: false,
      });
    }
  } catch { /* email non-critical */ }

  revalidatePath("/admin/approvals");
  revalidatePath("/admin/subscriptions");
  void logAdminAction("reject_subscription", { requestId, userId });
}

export async function swapModuleOrder(
  id1: string, _ord1: number,
  id2: string, _ord2: number,
  courseId: string
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id, order_index")
    .eq("course_id", courseId)
    .order("order_index")
    .order("id");

  if (!modules) return;

  const idx1 = modules.findIndex((m) => m.id === id1);
  const idx2 = modules.findIndex((m) => m.id === id2);
  if (idx1 === -1 || idx2 === -1) return;

  [modules[idx1], modules[idx2]] = [modules[idx2], modules[idx1]];
  for (let i = 0; i < modules.length; i++) {
    await supabase.from("modules").update({ order_index: i }).eq("id", modules[i].id);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export async function swapLessonOrder(
  id1: string, _ord1: number,
  id2: string, _ord2: number,
  courseId: string
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("module_id")
    .eq("id", id1)
    .single();
  if (!lesson) return;

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, order_index")
    .eq("module_id", lesson.module_id)
    .order("order_index")
    .order("id");

  if (!lessons) return;

  const idx1 = lessons.findIndex((l) => l.id === id1);
  const idx2 = lessons.findIndex((l) => l.id === id2);
  if (idx1 === -1 || idx2 === -1) return;

  [lessons[idx1], lessons[idx2]] = [lessons[idx2], lessons[idx1]];
  for (let i = 0; i < lessons.length; i++) {
    await supabase.from("lessons").update({ order_index: i }).eq("id", lessons[i].id);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export async function reorderModules(courseId: string, orderedIds: string[]): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("modules").update({ order_index: i }).eq("id", id))
  );
  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export async function reorderLessons(_moduleId: string, orderedIds: string[], courseId: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await Promise.all(
    orderedIds.map((id, i) => supabase.from("lessons").update({ order_index: i }).eq("id", id))
  );
  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export async function publishAllLessons(courseId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = (modules ?? []).map((m) => m.id);
  if (moduleIds.length > 0) {
    const { error } = await supabase
      .from("lessons")
      .update({ status: "published" })
      .in("module_id", moduleIds);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidateTag("courses", "max");
}

export async function setCourseStatus(courseId: string, status: "draft" | "published") {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("courses")
    .update({ status })
    .eq("id", courseId);
  if (error) throw new Error(error.message);

  // La publicare, publică automat toate lecțiile din curs
  if (status === "published") {
    const { data: modules } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    const moduleIds = (modules ?? []).map((m) => m.id);
    if (moduleIds.length > 0) {
      await supabase
        .from("lessons")
        .update({ status: "published" })
        .in("module_id", moduleIds);
    }
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidateTag("courses", "max");
}

/** Crează (sau verifică) folderul Drive pentru un curs. Silențios dacă Drive neconectat. */
export async function ensureCourseDriveFolder(courseId: string, courseTitle: string): Promise<void> {
  await requireAdmin();
  const connected = await isDriveConnected().catch(() => false);
  if (!connected) return;
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("drive_folder_id").eq("id", courseId).single();
  if (course?.drive_folder_id) return;
  try {
    const rootId = await getRootFolder();
    const folderId = await createDriveFolder(`Curs — ${courseTitle}`, rootId);
    await db.from("courses").update({ drive_folder_id: folderId }).eq("id", courseId);
    revalidatePath(`/admin/courses/${courseId}`);
  } catch { /* Drive neconectat sau eroare — ignorat silențios */ }
}

/** Crează (sau verifică) folderul Drive pentru un modul. Silențios dacă Drive neconectat. */
export async function ensureModuleDriveFolder(moduleId: string, moduleTitle: string, courseId: string): Promise<void> {
  await requireAdmin();
  const connected = await isDriveConnected().catch(() => false);
  if (!connected) return;
  const db = createAdminClient();
  const { data: mod } = await db.from("modules").select("drive_folder_id").eq("id", moduleId).single();
  if (mod?.drive_folder_id) return;
  try {
    const { data: course } = await db.from("courses").select("drive_folder_id, title").eq("id", courseId).single();
    let courseFolderId = course?.drive_folder_id ?? null;
    if (!courseFolderId) {
      const rootId = await getRootFolder();
      courseFolderId = await createDriveFolder(`Curs — ${course?.title ?? "Curs"}`, rootId);
      await db.from("courses").update({ drive_folder_id: courseFolderId }).eq("id", courseId);
    }
    const folderId = await createDriveFolder(`Modul — ${moduleTitle}`, courseFolderId);
    await db.from("modules").update({ drive_folder_id: folderId }).eq("id", moduleId);
    revalidatePath(`/admin/courses/${courseId}`);
  } catch { /* Drive neconectat sau eroare — ignorat silențios */ }
}
