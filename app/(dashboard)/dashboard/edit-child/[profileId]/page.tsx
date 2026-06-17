import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateChildProfile } from "@/lib/actions/child-profile";
import { DeleteChildButton } from "@/components/cursant/delete-child-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează profil cursant" };

interface PageProps {
  params: Promise<{ profileId: string }>;
}

export default async function EditChildPage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("child_profiles")
    .select("id, display_name, age_group, pin_hash")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();

  if (!child) notFound();

  const action = updateChildProfile.bind(null, profileId);

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-blue-500">← Înapoi la dashboard</Link>
        <h1 className="text-2xl font-bold mt-2">Editează profil</h1>
        <p className="text-gray-500 text-sm mt-1">Modifică datele profilului <strong>{child.display_name}</strong></p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="display_name">Prenumele copilului</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={child.display_name}
            minLength={2}
            maxLength={40}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Grupă de vârstă</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["0-4", "5-8"] as const).map((group) => (
              <label
                key={group}
                className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-blue-50 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 transition-colors"
              >
                <input
                  type="radio"
                  name="age_group"
                  value={group}
                  defaultChecked={child.age_group === group}
                  className="accent-blue-500"
                  required
                />
                <div>
                  <p className="font-semibold text-sm">{group === "0-4" ? "🌈 Clasele 0–4" : "🚀 Clasele 5–8"}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* PIN copil */}
        <div className="space-y-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="font-semibold text-sm text-blue-800">🔐 PIN de acces (opțional)</p>
          <p className="text-xs text-gray-500">
            {child.pin_hash ? "PIN activ — lasă câmpul gol pentru a nu-l schimba." : "Setează un PIN de 4 cifre pe care copilul îl va introduce pentru a-și accesa profilul."}
          </p>
          <Input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            placeholder={child.pin_hash ? "Lasă gol pentru a păstra PIN-ul" : "ex: 1234"}
            className="max-w-xs"
          />
          {child.pin_hash && (
            <label className="flex items-center gap-2 text-sm text-red-600 cursor-pointer">
              <input type="checkbox" name="clear_pin" value="1" className="accent-red-500" />
              Elimină PIN-ul existent
            </label>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700 flex-1">
            Salvează modificările
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard">Anulează</Link>
          </Button>
        </div>
      </form>

      {/* Zona de pericol */}
      <div className="mt-10 pt-6 border-t border-red-100">
        <p className="text-xs text-red-400 uppercase tracking-widest font-semibold mb-3">Zonă de pericol</p>
        <p className="text-sm text-gray-500 mb-4">
          Ștergerea profilului elimină definitiv tot progresul, XP-ul și diplomele lui <strong>{child.display_name}</strong>.
          Această acțiune nu poate fi anulată.
        </p>
        <DeleteChildButton profileId={profileId} childName={child.display_name} />
      </div>
    </div>
  );
}
