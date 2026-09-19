import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

import Link from "next/link";
import { Share2 } from "lucide-react";

export const metadata = {
  title: "Profile Settings | College Coding Platform",
};

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user || !user.profile) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Profile Settings</h1>
        <Link
          href="/studio/card"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-indigo-300 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>Card Studio</span>
        </Link>
      </div>
      <ProfileSettingsForm
        initialData={{
          displayName: user.profile.displayName,
          gender: user.profile.gender,
          leetcodeUsername: user.profile.leetcodeUsername,
          admissionYear: user.profile.admissionYear,
          graduationYear: user.profile.graduationYear,
          branch: user.profile.branch,
          bio: user.profile.bio,
          email: user.email,
        }}
      />
    </div>
  );
}