import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Settings, User, ExternalLink } from "lucide-react";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { getUserCodingStats } from "@/server/services/leetcode/stats.service";
import { SyncControlBar } from "@/components/dashboard/SyncControlBar";
import { SolvedDifficultyCards } from "@/components/dashboard/SolvedDifficultyCards";
import { ContestRatingCard } from "@/components/dashboard/ContestRatingCard";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { RecentSubmissionsList } from "@/components/dashboard/RecentSubmissionsList";
import { LeetCodeConnectCard } from "@/components/profile/LeetCodeConnectCard";

export const metadata = { title: "Dashboard | College Coding Platform" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/auth/login");

  const codingStats = await getUserCodingStats(session.user.id);
  const initials = getInitials(profile.displayName);
  const avatarColor = getAvatarColor(profile.displayName);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 space-y-8">
      {/* Header Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-16 w-16 rounded-2xl object-cover shadow-lg"
            />
          ) : (
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-lg ${avatarColor}`}
            >
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Welcome, {profile.displayName}!
            </h1>
            <p className="text-sm text-zinc-400 flex items-center gap-2">
              <span>@{profile.leetcodeUsername}</span>
              {profile.branch && <span>&bull; {profile.branch}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/profiles/${profile.leetcodeUsername}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all shadow-sm"
          >
            View Public Profile <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/settings/profile"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Sync Control Bar or Connect Account */}
      {codingStats ? (
        <SyncControlBar
          username={codingStats.username}
          status={codingStats.syncStatus}
          lastSyncAt={codingStats.lastSyncAt}
          lastSyncError={codingStats.lastSyncError}
          isStale={codingStats.isStale}
        />
      ) : (
        <LeetCodeConnectCard currentUsername={profile.leetcodeUsername} />
      )}

      {/* Coding Stats Grid */}
      {codingStats?.statistics ? (
        <div className="space-y-6">
          <SolvedDifficultyCards
            totalSolved={codingStats.statistics.totalSolved}
            easySolved={codingStats.statistics.easySolved}
            mediumSolved={codingStats.statistics.mediumSolved}
            hardSolved={codingStats.statistics.hardSolved}
            acceptanceRate={codingStats.statistics.acceptanceRate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ContestRatingCard
                contestRating={codingStats.statistics.contestRating}
                globalContestRank={codingStats.statistics.globalContestRank}
                contestsAttended={codingStats.statistics.contestsAttended}
              />
            </div>
            <div className="lg:col-span-2">
              <ActivityCalendar
                calendarJson={codingStats.statistics.submissionCalendarJson}
              />
            </div>
          </div>

          <RecentSubmissionsList submissions={codingStats.recentSubmissions} />
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-2">
          <p className="text-zinc-300 font-medium">No coding statistics synced yet.</p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Click &quot;Sync Now&quot; above to initiate your first automated LeetCode statistics ingestion.
          </p>
        </div>
      )}

      {/* Campus Modules Navigation */}
      <div className="grid gap-4 sm:grid-cols-2 pt-4">
        <Link
          href="/settings/profile"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all group shadow-sm flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-200">Account &amp; Profile Settings</h3>
            <p className="text-xs text-zinc-500">Manage email, handle, and academic info</p>
          </div>
        </Link>

        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/20 p-5 flex items-center gap-4 opacity-70">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-zinc-300">Campus Leaderboards</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                R3 Next
              </span>
            </div>
            <p className="text-xs text-zinc-500">Batch rankings, score formulas, and Gender Wars</p>
          </div>
        </div>
      </div>
    </div>
  );
}