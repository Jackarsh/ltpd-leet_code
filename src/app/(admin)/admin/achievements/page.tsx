import { assertAdmin } from "@/server/auth/rbac";
import { getAdminAchievements } from "@/server/services/admin-achievement.service";
import { AchievementStudioClient } from "@/components/admin/AchievementStudioClient";
import { Trophy } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Achievement Studio | CodeRank Admin",
  description: "Define, categorize, and activate programmatic achievement badges with condition rules.",
};

export default async function AdminAchievementsPage() {
  await assertAdmin();

  const achievements = await getAdminAchievements();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Trophy className="h-4 w-4" />
          <span>Gamification & Incentives Engine</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Achievement Studio
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Create, update, and manage collegiate achievement badges with verified condition rules. Historical unlocks are permanently grandfathered.
        </p>
      </div>

      <AchievementStudioClient initialAchievements={achievements} />
    </div>
  );
}
