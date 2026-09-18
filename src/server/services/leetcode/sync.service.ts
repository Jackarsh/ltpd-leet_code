import { evaluateAndAwardAchievements } from '@/server/services/achievement.service';
import { recalculateAllCollegeRanks } from '@/server/services/ranking.service';
import { db } from "@/lib/db";
import { leetcodeProvider } from "@/server/providers/leetcode.provider";

export const STALE_THRESHOLD_HOURS = 24;

export function isDataStale(lastSyncAt: Date | null): boolean {
  if (!lastSyncAt) return true;
  const cutoff = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000);
  return lastSyncAt < cutoff;
}

export async function syncUserLeetCodeData(accountId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const account = await db.linkedCodingAccount.findUnique({
    where: { id: accountId },
    include: { statistics: true },
  });

  if (!account) {
    return { success: false, error: "Linked account not found" };
  }

  // Update status to IN_PROGRESS
  await db.linkedCodingAccount.update({
    where: { id: accountId },
    data: { syncStatus: "IN_PROGRESS" },
  });

  try {
    // Fetch fresh stats from LeetCode GraphQL
    const data = await leetcodeProvider.fetchUserData(account.username);

    // Historical peak contest rating (FR-313)
    const existingPeak = account.statistics?.highestContestRating ?? 0;
    const currentRating = data.contestRating ?? 0;
    const highestContestRating = Math.max(existingPeak, currentRating) || null;

    // Atomic non-destructive persistence transaction (US4)
    await db.$transaction(async (tx) => {
      // 1. Upsert coding statistics
      await tx.codingStatistics.upsert({
        where: { accountId },
        create: {
          accountId,
          totalSolved: data.totalSolved,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          acceptanceRate: data.acceptanceRate,
          contestRating: data.contestRating,
          highestContestRating,
          globalContestRank: data.globalContestRank,
          contestsAttended: data.contestsAttended,
          submissionCalendarJson: JSON.stringify(data.submissionCalendar),
        },
        update: {
          totalSolved: data.totalSolved,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          acceptanceRate: data.acceptanceRate,
          contestRating: data.contestRating,
          highestContestRating,
          globalContestRank: data.globalContestRank,
          contestsAttended: data.contestsAttended,
          submissionCalendarJson: JSON.stringify(data.submissionCalendar),
        },
      });

      // 2. Upsert recent submissions (deduplicate)
      for (const sub of data.recentSubmissions) {
        await tx.submissionHistory.upsert({
          where: {
            accountId_titleSlug_timestamp: {
              accountId,
              titleSlug: sub.titleSlug,
              timestamp: sub.timestamp,
            },
          },
          create: {
            accountId,
            title: sub.title,
            titleSlug: sub.titleSlug,
            timestamp: sub.timestamp,
            status: sub.status,
            lang: sub.lang,
          },
          update: {
            status: sub.status,
          },
        });
      }

      // 3. Mark sync successful
      await tx.linkedCodingAccount.update({
        where: { id: accountId },
        data: {
          syncStatus: "SUCCESS",
          lastSyncAt: new Date(),
          lastSyncError: null,
        },
      });
    });

    // Evaluate achievements and materialize ranks post-sync (FR-328, FR-215)
    try {
      await evaluateAndAwardAchievements(account.userId, accountId);
    } catch (achErr) {
      console.error('Failed to evaluate achievements post-sync:', achErr);
    }

    try {
      await recalculateAllCollegeRanks();
    } catch (rankingErr) {
      console.error('Failed to recalculate college ranks post-sync:', rankingErr);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);

    // US4: Failed sync must NOT wipe out existing statistics!
    await db.linkedCodingAccount.update({
      where: { id: accountId },
      data: {
        syncStatus: "FAILED",
        lastSyncError: errorMessage,
      },
    });

    return { success: false, error: errorMessage };
  }
}