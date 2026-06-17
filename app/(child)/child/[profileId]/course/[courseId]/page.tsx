import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Circle, PlayCircle, FileText, ClipboardList, Lock, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AgeGroupBadge } from "@/components/course/age-group-badge";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { ProgressBar } from "@/components/common/progress-bar";
import { ReplayCourseButton } from "@/components/course/replay-course-button";
import { sendDiplomaEmail } from "@/lib/email";
import { isSubscriptionActive } from "@/lib/subscription";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ profileId: string; courseId: string }>;
}

export const metadata: Metadata = { title: "Curs" };

const lessonTypeIcon: Record<string, React.ReactNode> = {
  video: <PlayCircle size={16} className="text-red-400" />,
  presentation: <FileText size={16} className="text-indigo-400" />,
  worksheet: <ClipboardList size={16} className="text-teal-400" />,
  quiz: <span className="text-sm">🎯</span>,
  mixed: <span className="text-sm">📚</span>,
};

export default async function CourseLearningPage({ params }: PageProps) {
  const { profileId, courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: childProfile }, { data: parentProfile }] = await Promise.all([
    supabase.from("child_profiles").select("*").eq("id", profileId).eq("parent_id", user.id).single(),
    supabase.from("parent_profiles").select("full_name, approved, subscription_expires_at").eq("user_id", user.id).single(),
  ]);

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";
  const isApproved = isAdmin || (parentProfile?.approved ?? false);
  const hasSubscription = isAdmin || isSubscriptionActive(parentProfile?.subscription_expires_at);

  if (!childProfile) notFound();

  const { data: course } = await supabase
    .from("courses")
    .select(`*, modules(*, lessons(*))`)
    .eq("id", courseId)
    .eq("status", "published")
    .order("order_index", { referencedTable: "modules" })
    .order("order_index", { referencedTable: "modules.lessons" })
    .single();

  if (!course) notFound();

  const { data: progressData } = await supabase
    .from("progress")
    .select("lesson_id, status")
    .eq("child_profile_id", profileId)
    .eq("course_id", courseId);

  const completedIds = new Set(
    progressData?.filter((p) => p.status === "completed").map((p) => p.lesson_id) || []
  );

  type ModuleWithLessons = { id: string; title: string; description?: string; lessons?: { id: string; title: string; lesson_type: string; duration_minutes?: number }[] };

  const allLessons = course.modules?.flatMap((m: ModuleWithLessons) => m.lessons || []) || [];
  const completedCount = allLessons.filter((l: { id: string }) => completedIds.has(l.id)).length;
  const isCourseComplete = allLessons.length > 0 && completedCount === allLessons.length;

  const moduleStats = (course.modules as ModuleWithLessons[] ?? []).map((mod) => {
    const lessons = mod.lessons ?? [];
    const isModuleComplete = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
    return { ...mod, isModuleComplete };
  });

  const completedModulesCount = moduleStats.filter((m) => m.isModuleComplete).length;
  const earnedPoints = completedCount * 10 + completedModulesCount * 50 + (isCourseComplete ? 100 : 0);
  const totalPossiblePoints = allLessons.length * 10 + (moduleStats.length * 50) + 100;

  // Auto-creare certificat la finalizarea cursului
  let certificateId: string | undefined;
  if (isCourseComplete) {
    const lessonTitles = allLessons.map((l: { title: string }) => l.title);

    // Verificăm dacă există deja un certificat (pentru a ști dacă emailul a fost trimis)
    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id")
      .eq("child_profile_id", profileId)
      .eq("course_id", courseId)
      .single();

    if (!existingCert) {
      // Certificat nou — îl creăm și trimitem emailul
      const { data: newCert } = await supabase
        .from("certificates")
        .insert({
          child_profile_id: profileId,
          course_id: courseId,
          course_title: course.title,
          child_name: childProfile.display_name,
          lessons_completed: lessonTitles,
          total_points: earnedPoints,
        })
        .select("id")
        .single();

      certificateId = newCert?.id;

      // Trimitem email notificare părintelui
      if (newCert && user.email) {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        try {
          await sendDiplomaEmail({
            parentEmail: user.email,
            parentName: parentProfile?.full_name || user.email,
            childName: childProfile.display_name,
            courseName: course.title,
            diplomaUrl: `${siteUrl}/child/${profileId}/certificate/${newCert.id}`,
            totalPoints: earnedPoints,
          });
        } catch (e) {
          console.error("Eroare trimitere email diploma:", e);
        }
      }
    } else {
      certificateId = existingCert.id;
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-2">
        <Link href={`/child/${profileId}`} className="text-sm text-gray-400 hover:text-blue-500">
          ← Înapoi la cursuri
        </Link>
      </div>

      <div className="mb-6">
        <AgeGroupBadge ageGroup={course.age_group} size="sm" className="mb-3" />
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600">{course.description}</p>
      </div>

      {/* XP curs */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-4 sm:px-5 py-3 mb-6 flex items-center justify-between">
        <div className="text-sm text-yellow-800">
          <span className="font-bold">⭐ {earnedPoints} XP</span>
          <span className="text-yellow-600"> câștigați din </span>
          <span className="font-semibold">{totalPossiblePoints} XP posibili</span>
        </div>
        <div className="text-xs text-yellow-700 hidden sm:block">
          10 XP/lecție · +50 XP modul · +100 XP curs
        </div>
      </div>

      {allLessons.length > 0 && (
        <ProgressBar
          value={completedCount}
          max={allLessons.length}
          label={`${completedCount} din ${allLessons.length} lecții completate`}
          className="mb-6"
          color="green"
        />
      )}

      {isCourseComplete && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl p-5 mb-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-extrabold text-xl mb-1">Felicitări! Curs finalizat!</h3>
          <p className="font-semibold opacity-90 mb-3">+100 XP bonus pentru finalizarea cursului!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {certificateId && (
              <Link
                href={`/child/${profileId}/certificate/${certificateId}`}
                className="inline-flex items-center gap-2 bg-white text-yellow-700 font-bold px-5 py-2 rounded-full hover:bg-yellow-50 transition-colors shadow"
              >
                🎓 Vezi diploma ta de absolvire
              </Link>
            )}
            <ReplayCourseButton profileId={profileId} courseId={courseId} />
          </div>
        </div>
      )}

      {!isApproved && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <Lock size={20} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Cont în așteptare.</span>{" "}
            Poți vedea structura cursului, dar lecțiile sunt blocate până la aprobarea contului de către un administrator.
          </p>
        </div>
      )}
      {isApproved && !hasSubscription && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
          <CreditCard size={20} className="text-indigo-400 shrink-0" />
          <p className="text-sm text-indigo-700">
            <span className="font-semibold">Abonament necesar.</span>{" "}
            Poți vedea structura cursului, dar lecțiile necesită un abonament activ. Contactează administratorul platformei.
          </p>
        </div>
      )}
      {isApproved && hasSubscription && (
        <AmiMotiGuide
          variant="mission"
          message="Misiunea ta: parcurge toate lecțiile acestui curs. Poți face pauze oricând — progresul se salvează automat!"
          className="mb-6"
        />
      )}

      <div className="space-y-4">
        {moduleStats.map((module, mIdx) => (
          <div key={module.id} className="bg-white rounded-xl border overflow-hidden">
            <div className={`px-3 sm:px-5 py-3 sm:py-4 border-b ${module.isModuleComplete ? "bg-teal-50" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${module.isModuleComplete ? "bg-teal-500 text-white" : "bg-blue-100 text-blue-600"}`}>
                    {module.isModuleComplete ? "✓" : mIdx + 1}
                  </span>
                  {module.title}
                </h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${module.isModuleComplete ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                  {module.isModuleComplete ? "✓ +50 XP" : "+50 XP bonus"}
                </span>
              </div>
              {module.description && (
                <p className="text-sm text-gray-500 mt-1 ml-9">{module.description}</p>
              )}
            </div>

            <ul className="divide-y">
              {module.lessons?.map((lesson, lIdx) => {
                const isCompleted = completedIds.has(lesson.id);
                const rowContent = (
                  <>
                    <span className="text-gray-300 text-sm w-6 text-center flex-shrink-0">
                      {mIdx + 1}.{lIdx + 1}
                    </span>
                    <span className="flex-shrink-0">
                      {isApproved && hasSubscription
                        ? (lessonTypeIcon[lesson.lesson_type] || <Circle size={16} />)
                        : !isApproved
                          ? <Lock size={15} className="text-amber-400" />
                          : <Lock size={15} className="text-indigo-400" />}
                    </span>
                    <span className={`flex-1 text-sm font-medium ${isCompleted ? "text-teal-600" : isApproved && hasSubscription ? "text-gray-700" : "text-gray-400"}`}>
                      {lesson.title}
                    </span>
                    {isApproved && hasSubscription && (
                      <>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isCompleted ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"}`}>
                          {isCompleted ? "✓" : ""} 10 XP
                        </span>
                        {isCompleted ? (
                          <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                        ) : (
                          <Circle size={18} className="text-gray-200 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </>
                );
                return (
                  <li key={lesson.id}>
                    {isApproved && hasSubscription ? (
                      <Link
                        href={`/child/${profileId}/course/${courseId}/lesson/${lesson.id}`}
                        className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 hover:bg-blue-50 transition-colors ${isCompleted ? "bg-teal-50/40" : ""}`}
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 cursor-not-allowed bg-gray-50/60">
                        {rowContent}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bonus curs */}
      <div className={`mt-4 rounded-xl border px-4 sm:px-5 py-3 flex items-center justify-between ${isCourseComplete ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"}`}>
        <span className={`text-sm font-semibold ${isCourseComplete ? "text-yellow-700" : "text-gray-500"}`}>
          {isCourseComplete ? "🏆 Bonus finalizare curs" : "🏆 Bonus la finalizarea cursului"}
        </span>
        <span className={`text-sm font-bold ${isCourseComplete ? "text-yellow-600" : "text-gray-400"}`}>
          {isCourseComplete ? "✓ " : ""}+100 XP
        </span>
      </div>
    </div>
  );
}
