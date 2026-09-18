import { db } from "@/lib/db";
import { isDataStale } from "@/server/services/leetcode/sync.service";
import { generate12MonthHeatmap } from "./activity.service";
import { getUserBadges } from "./achievement.service";
import {
  PublicStudentProfileDTO,
  DifficultyBreakdownDTO,
  ContestStatsDTO,
  ActivityFeedItemDTO,
} from "@/types/profile";

export async function getPublicStudentProfile(
  username: string,
  currentUserId?: string
): Promise<PublicStudentProfileDTO | null> {
  if (!username || username.trim() === "") return null;

  // 1. Find user by leetcode handle or profile
  const user = await db.user.findFirst({
    where: {
      status: "ACTIVE", // FR-305: Exclude deactivated accounts
      OR: [
        { profile: { leetcodeUsername: { equals: username, mode: "insensitive" } } },
        {
          codingAccounts: {
            some: {
              platform: "LEETCODE",
              username: { equals: username, mode: "insensitive" },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          gender: true,
          leetcodeUsername: true,
          admissionYear: true,
          graduationYear: true,
          branch: true,
          avatarUrl: true,
          collegeRank: true,
          weightedScore: true,
        },
      },
      codingAccounts: {
        where: { platform: "LEETCODE" },
        select: {
          id: true,
          username: true,
          syncStatus: true,
          lastSyncAt: true,
          statistics: {
            select: {
              totalSolved: true,
              easySolved: true,
              mediumSolved: true,
              hardSolved: true,
              contestRating: true,
              highestContestRating: true,
              globalContestRank: true,
              contestsAttended: true,
              submissionCalendarJson: true,
              longestStreak: true,
            },
          },
          submissions: {
            orderBy: { timestamp: "desc" },
            take: 20,
            select: {
              id: true,
              title: true,
              titleSlug: true,
              timestamp: true,
              status: true,
              lang: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!user || !user.profile) return null;

  const profile = user.profile;
  const isOwner = Boolean(currentUserId && currentUserId === user.id);
  const codingAccount = user.codingAccounts[0];
  const stats = codingAccount?.statistics;
  const isSynced = codingAccount?.syncStatus === "SUCCESS" && stats !== null && stats !== undefined;
  const isStale = isSynced ? isDataStale(codingAccount?.lastSyncAt ?? null) : false;

  // 2. Difficulty Breakdown (FR-307, FR-308)
  let difficultyStats: DifficultyBreakdownDTO | null = null;
  if (isSynced && stats) {
    const total = stats.totalSolved;
    difficultyStats = {
      totalSolved: total,
      easySolved: stats.easySolved,
      mediumSolved: stats.mediumSolved,
      hardSolved: stats.hardSolved,
      easyPercentage: total > 0 ? Number(((stats.easySolved / total) * 100).toFixed(1)) : null,
      mediumPercentage: total > 0 ? Number(((stats.mediumSolved / total) * 100).toFixed(1)) : null,
      hardPercentage: total > 0 ? Number(((stats.hardSolved / total) * 100).toFixed(1)) : null,
    };
  }

  // 3. Contest Statistics (FR-311, FR-312, FR-313)
  let contestStats: ContestStatsDTO | null = null;
  if (isSynced && stats) {
    const currentRating = stats.contestRating;
    const highestRating = stats.highestContestRating || stats.contestRating || null;
    contestStats = {
      currentRating,
      highestRating,
      globalRank: stats.globalContestRank,
      contestsAttended: stats.contestsAttended,
    };
  }

  // 4. 12-Month Activity Heatmap & Metrics (FR-314, FR-317)
  const heatmap = generate12MonthHeatmap(stats?.submissionCalendarJson);

  // 5. Badges & Achievements (FR-332, FR-333, FR-334)
  const badgeResult = await getUserBadges(user.id, isOwner);

  // 6. Recent Activity Feed (FR-319, FR-320, FR-321, FR-322)
  const feed: ActivityFeedItemDTO[] = [];

  // Add verified accepted problem solves
  if (codingAccount?.submissions) {
    for (const sub of codingAccount.submissions) {
      if (sub.status.toLowerCase().includes("accept")) {
        feed.push({
          id: sub.id,
          type: "PROBLEM_SOLVED",
          title: `Solved ${sub.title}`,
          subtitle: `Accepted in ${sub.lang}`,
          timestamp: sub.timestamp.toISOString(),
          iconKey: "check-circle",
        });
      }
    }
  }

  // Add earned achievements to feed
  for (const b of badgeResult.earned) {
    if (!b.isRevoked) {
      feed.push({
        id: b.id,
        type: "ACHIEVEMENT_EARNED",
        title: `Unlocked "${b.name}"`,
        subtitle: b.description || "Earned collegiate badge",
        timestamp: b.unlockedAt,
        iconKey: b.iconKey,
      });
    }
  }

  // Sort feed chronologically descending
  feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    displayName: profile.displayName || "Anonymous Student",
    leetcodeUsername: codingAccount?.username || profile.leetcodeUsername,
    avatarUrl: profile.avatarUrl,
    gender: profile.gender,
    branch: profile.branch || null,
    admissionYear: profile.admissionYear || null,
    graduationYear: profile.graduationYear || null,
    collegeRank: profile.collegeRank,
    weightedScore: profile.weightedScore,
    isSynced,
    isStale,
    lastSyncAt: codingAccount?.lastSyncAt ? codingAccount.lastSyncAt.toISOString() : null,
    stats: difficultyStats,
    contest: contestStats,
    heatmap,
    feed: feed.slice(0, 15),
    achievements: badgeResult.earned,
    lockedAchievements: badgeResult.locked,
  };
}