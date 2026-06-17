import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import type { ChildProfile } from "@/types";

interface ChildProfileCardProps {
  profile: ChildProfile;
  progressPercent?: number;
  onSelect?: () => void;
}

const AVATARS = ["🦊", "🐧", "🐬", "🦋", "🐸", "🐯", "🦁", "🐺"];

export function ChildProfileCard({ profile, progressPercent, onSelect }: ChildProfileCardProps) {
  const avatarEmoji = AVATARS[profile.display_name.charCodeAt(0) % AVATARS.length];
  const ageLabel = profile.age_group === "0-4" ? "Clasele 0–4" : "Clasele 5–8";

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={onSelect}>
      <CardContent className="p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-transform">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name} width={80} height={80} className="w-full h-full rounded-full object-cover" />
          ) : (
            avatarEmoji
          )}
        </div>

        <div className="min-h-[3.5rem] flex items-center justify-center">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{profile.display_name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-1">{ageLabel}</p>
        {profile.grade && (
          <p className="text-xs text-gray-400">Clasa {profile.grade}</p>
        )}

        {progressPercent !== undefined && (
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progressPercent}% completat</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
