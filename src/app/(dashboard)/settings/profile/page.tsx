import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";

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
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Profile Settings</h1>
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