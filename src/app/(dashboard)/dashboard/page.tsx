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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-4">
            <div className="flex items-center gap-3 mb-3">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.displayName} className="h-12 w-12 rounded-lg object-cover border border-[#21262d]" />
              ) : (
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold text-white shadow-sm ${avatarColor}`}>{initials}</div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-bold text-sm text-[#e6edf3] truncate">{profile.displayName}</h2>
                <p className="text-xs text-[#848d97] truncate">@{profile.leetcodeUsername}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#21262d] flex items-center justify-between text-xs">
              <span className="text-[#848d97]">Academic Cohort</span>
              <span className="font-semibold text-[#e6edf3]">{profile.branch ?? "CSE"} &middot; '{profile.graduationYear?.toString().slice(-2) ?? "26"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-3 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-[#6e7681] uppercase tracking-wider">Quick Shortcuts</div>
            {[
              { href: `/profiles/${profile.leetcodeUsername}`, label: "My Public Profile" },
              { href: "/leaderboard", label: "Collegiate Leaderboard" },
              { href: "/gender-war", label: "Gender War" },
              { href: "/studio/card", label: "Card Studio" },
              { href: "/settings/profile", label: "Settings" },
            ].map((link) => (
              <Link key={link.href} href={link.href}
                className="flex items-center justify-between px-2.5 py-2 rounded-md text-xs text-[#c9d1d9] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors">
                <span>{link.label}</span>
                <ArrowUpRight className="h-3 w-3 text-[#6e7681]" />
              </Link>
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h1 className="font-display text-xl font-bold text-[#e6edf3]">Coding Command Center</h1>
            <p className="text-xs text-[#848d97]">Verified performance metrics, synchronization status, and recent activity.</p>
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
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-4">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#e6edf3] mb-2">Collegiate Coding</h3>
            <p className="text-xs text-[#848d97] leading-relaxed mb-3">Sync daily to maintain your active streak, climb the college leaderboard, and unlock verified collegiate achievement badges.</p>
            <Link href="/leaderboard" className="block text-center rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-3 py-1.5 text-xs font-semibold text-[#e6edf3] transition-colors">Explore Leaderboard</Link>
          </div>

          {/* Linked Account Summary Card (replaces Platform Updates) */}
          <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#e6edf3]">LeetCode Account</h3>
              <Link href="/settings/profile" className="text-[11px] text-[#848d97] hover:text-[#e6edf3] transition-colors" title="Manage Account">
                <Settings className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-[#e6edf3] truncate">@{profile.leetcodeUsername}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${codingStats?.isVerified ? "border-[#238636]/40 bg-[#21262d] text-[#3fb950]" : "border-[#30363d] bg-[#21262d] text-[#848d97]"}`}>
                  {codingStats?.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
            <Link href="/settings/profile" className="block text-center rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-3 py-1.5 text-xs font-semibold text-[#e6edf3] transition-colors">
              Manage / Change Username
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
