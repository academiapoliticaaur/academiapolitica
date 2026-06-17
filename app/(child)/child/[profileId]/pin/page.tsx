import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PinEntry } from "@/components/child/pin-entry";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Introducere PIN" };

interface PageProps {
  params: Promise<{ profileId: string }>;
}

export default async function PinPage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  if (cookieStore.get(`pin_ok_${profileId}`)?.value === "1") {
    redirect(`/child/${profileId}`);
  }

  const { data: child } = await supabase
    .from("child_profiles")
    .select("display_name, pin_hash")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();

  if (!child) redirect("/dashboard");
  if (!child.pin_hash) redirect(`/child/${profileId}`);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 px-4">
      <PinEntry profileId={profileId} childName={child.display_name} />
    </div>
  );
}
