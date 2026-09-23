import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { LeetCodeConnectCard } from "@/components/profile/LeetCodeConnectCard";
import { AppearanceSettings } from "@/components/profile/AppearanceSettings";
import { DeleteAccountCard } from "@/components/profile/DeleteAccountCard";

export const metadata = {
  title: "Profile Settings | College Coding Platform",
};

export default async function ProfileSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, codingAccounts: true },
  });

  if (!user || !user.profile) redirect("/auth/login");

  const leetcodeAccount = user.codingAccounts.find((a) => a.platform === "LEETCODE");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">Profile & Account Settings</h1>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Manage your personal details, academic cohort, and LeetCode connection.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <AppearanceSettings />

        {/* LeetCode Account Connect & Verify */}
        <LeetCodeConnectCard
          currentUsername={leetcodeAccount?.username || user.profile.leetcodeUsername}
          isVerified={leetcodeAccount?.isVerified}
        />

        {/* Profile Details Form */}
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

        {/* Danger Zone */}
        <DeleteAccountCard />
      </div>
    </div>
  );
}
