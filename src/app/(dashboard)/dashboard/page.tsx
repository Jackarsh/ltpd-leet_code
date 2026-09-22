"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Settings } from "lucide-react";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { getUserCodingStats } from "@/server/services/leetcode/stats.service";
import { SyncControlBar } from "@/components/dashboard/SyncControlBar";
import { SolvedDifficultyCards } from "@/components/dashboard/SolvedDifficultyCards";
import { ContestRatingCard } from "@/components/dashboard/ContestRatingCard";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { RecentSubmissionsList } from "@/components/dashboard/RecentSubmissionsList";
import { LeetCodeConnectCard } from "@/components/profile/LeetCodeConnectCard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");
  const profile = await db.userProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/auth/login");
  const codingStats = await getUserCodingStats(session.user.id);
  const initials = getInitials(profile.displayName);
  const avatarColor = getAvatarColor(profile.displayName);

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#090d16] text-stone-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <div className="flex items-center gap-3.5 mb-4">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="h-12 w-12 rounded-xl object-cover border border-stone-200 dark:border-slate-700" />
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm ${avatarColor}`}>{initials}</div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-bold text-sm text-stone-900 dark:text-white truncate">{profile.displayName}</h2>
                <p className="text-xs text-stone-500 dark:text-slate-400 truncate font-mono">@{profile.leetcodeUsername}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-slate-400">Academic Cohort</span>
              <span className="font-semibold text-stone-800 dark:text-slate-200">{profile.branch ?? "CSE"} &middot; '{profile.graduationYear?.toString().slice(-2) ?? "26"}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-bold text-stone-400 dark:text-slate-500 uppercase tracking-wider">Quick Shortcuts</div>
            {[
              { href: `/profiles/${profile.leetcodeUsername}`, label: "My Public Profile" },
              { href: "/leaderboard", label: "Collegiate Leaderboard" },
              { href: "/gender-war", label: "Gender War" },
              { href: "/settings/profile", label: "Account Settings" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800/70 hover:text-stone-900 dark:hover:text-white transition-colors">
                <span>{link.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 dark:text-slate-500" />
              </Link>
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-stone-900 dark:text-white">Coding Command Center</h1>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">Verified performance metrics, synchronization status, and recent activity.</p>
          </div>

          {/* If no stats or unlinked, showcase LeetCode Connect Card prominently */}
          {(!codingStats || !codingStats.statistics) && (
            <LeetCodeConnectCard
              currentUsername={profile.leetcodeUsername}
              isVerified={codingStats?.isVerified}
            />
          )}

          {codingStats?.statistics && (
            <>
              <SyncControlBar
                username={profile.leetcodeUsername}
                status={codingStats.syncStatus || "PENDING"}
                lastSyncAt={codingStats.lastSyncAt || null}
                lastSyncError={codingStats.lastSyncError || null}
                isStale={codingStats.isStale || false}
              />
              <SolvedDifficultyCards
                totalSolved={codingStats.statistics.totalSolved}
                easySolved={codingStats.statistics.easySolved}
                mediumSolved={codingStats.statistics.mediumSolved}
                hardSolved={codingStats.statistics.hardSolved}
                acceptanceRate={codingStats.statistics.acceptanceRate}
              />
              <ContestRatingCard
                contestRating={codingStats.statistics.contestRating}
                globalContestRank={codingStats.statistics.globalContestRank}
                contestsAttended={codingStats.statistics.contestsAttended}
              />
              {codingStats.statistics.submissionCalendarJson && (
                <ActivityCalendar calendarJson={codingStats.statistics.submissionCalendarJson} />
              )}
              {codingStats.recentSubmissions && codingStats.recentSubmissions.length > 0 && (
                <RecentSubmissionsList submissions={codingStats.recentSubmissions} />
              )}
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-2">Collegiate Coding</h3>
            <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed mb-4">Sync daily to maintain your active streak, climb the college leaderboard, and unlock verified collegiate achievement badges.</p>
            <Link href="/leaderboard" className="block text-center rounded-xl bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 border border-stone-200/90 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-stone-800 dark:text-slate-200 transition-all shadow-sm">Explore Leaderboard</Link>
          </div>

          {/* Linked Account Summary Card */}
          <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">LeetCode Account</h3>
              <Link href="/settings/profile" className="text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors p-1" title="Manage Account">
                <Settings className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-xl border border-stone-200/80 dark:border-slate-800 bg-stone-50/80 dark:bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-stone-900 dark:text-slate-100 truncate">@{profile.leetcodeUsername}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${codingStats?.isVerified ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" : "border-stone-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400"}`}>
                  {codingStats?.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
            <Link href="/settings/profile" className="block text-center rounded-xl bg-stone-900 dark:bg-slate-800 hover:bg-stone-800 dark:hover:bg-slate-700 text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-sm">
              Manage / Change Username
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
