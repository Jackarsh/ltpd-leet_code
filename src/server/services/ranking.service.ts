import { db } from '@/lib/db';
import { calculateWeightedScore, RANKING_CONFIG } from '@/lib/ranking-config';
import { ScoreBreakdownDTO } from '@/types/leaderboard';

export interface RankCandidate {
  userId: string;
  profileId: string;
  displayName: string;
  isSynced: boolean;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  contestRating: number | null;
  weightedScore: number;
  createdAt: Date;
}

export function computeStudentScoreBreakdown(
  easySolved: number = 0,
  mediumSolved: number = 0,
  hardSolved: number = 0,
  contestRating: number | null = null
): ScoreBreakdownDTO {
  const {
    totalWeightedScore,
    easyContribution,
    mediumContribution,
    hardContribution,
    contestRatingContribution,
  } = calculateWeightedScore(easySolved, mediumSolved, hardSolved, contestRating);

  return {
    easySolved,
    easyWeight: RANKING_CONFIG.easyWeight,
    easyContribution,
    mediumSolved,
    mediumWeight: RANKING_CONFIG.mediumWeight,
    mediumContribution,
    hardSolved,
    hardWeight: RANKING_CONFIG.hardWeight,
    hardContribution,
    contestRating,
    contestRatingWeight: RANKING_CONFIG.contestRatingWeight,
    contestRatingContribution,
    totalWeightedScore,
  };
}

/**
 * Recalculates college ranks and weighted scores for all eligible active students.
 * Runs atomically to guarantee consistency without mid-cycle rank shifts (FR-215).
 */
export async function recalculateAllCollegeRanks(): Promise<{ totalRanked: number }> {
  // 1. Fetch all active users with profile and linked accounts
  const activeUsers = await db.user.findMany({
    where: {
      status: 'ACTIVE',
      profile: { isNot: null },
    },
    include: {
      profile: true,
      codingAccounts: {
        where: { platform: 'LEETCODE' },
        include: { statistics: true },
        take: 1,
      },
    },
  });

  // 2. Map to rank candidates
  const candidates: RankCandidate[] = activeUsers
    .filter((u) => u.profile !== null)
    .map((u) => {
      const profile = u.profile!;
      const leetcodeAccount = u.codingAccounts[0];
      const stats = leetcodeAccount?.statistics;
      const isSynced = leetcodeAccount?.syncStatus === 'SUCCESS' && stats !== null && stats !== undefined;

      const easySolved = stats?.easySolved ?? 0;
      const mediumSolved = stats?.mediumSolved ?? 0;
      const hardSolved = stats?.hardSolved ?? 0;
      const totalSolved = stats?.totalSolved ?? 0;
      const contestRating = stats?.contestRating ?? null;

      const weightedScore = isSynced
        ? calculateWeightedScore(easySolved, mediumSolved, hardSolved, contestRating).totalWeightedScore
        : 0;

      return {
        userId: u.id,
        profileId: profile.id,
        displayName: profile.displayName || 'Anonymous Student',
        isSynced,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        contestRating,
        weightedScore,
        createdAt: u.createdAt,
      };
    });

  // 3. Deterministic Sort (FR-213 & Edge Cases)
  // - Scored (synced) users first
  // - Weighted score DESC
  // - Hard solved DESC
  // - Medium solved DESC
  // - Easy solved DESC
  // - Contest rating DESC (null as 0)
  // - Display name ASC (alphabetical)
  // - User createdAt ASC
  candidates.sort((a, b) => {
    // Both or neither synced
    if (a.isSynced !== b.isSynced) {
      return a.isSynced ? -1 : 1;
    }

    if (b.weightedScore !== a.weightedScore) {
      return b.weightedScore - a.weightedScore;
    }

    if (b.hardSolved !== a.hardSolved) {
      return b.hardSolved - a.hardSolved;
    }

    if (b.mediumSolved !== a.mediumSolved) {
      return b.mediumSolved - a.mediumSolved;
    }

    if (b.easySolved !== a.easySolved) {
      return b.easySolved - a.easySolved;
    }

    const ratingA = a.contestRating ?? 0;
    const ratingB = b.contestRating ?? 0;
    if (ratingB !== ratingA) {
      return ratingB - ratingA;
    }

    const nameCompare = a.displayName.localeCompare(b.displayName);
    if (nameCompare !== 0) {
      return nameCompare;
    }

    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  // 4. Batch update ranks in a transaction
  const updates = candidates.map((candidate, index) => {
    const rank = index + 1;
    return db.userProfile.update({
      where: { id: candidate.profileId },
      data: {
        collegeRank: rank,
        weightedScore: candidate.isSynced ? candidate.weightedScore : 0,
      },
    });
  });

  // Clear ranks for disabled or deactivated accounts
  const clearDisabled = db.userProfile.updateMany({
    where: {
      user: {
        status: { not: 'ACTIVE' },
      },
    },
    data: {
      collegeRank: null,
    },
  });

  await db.$transaction([...updates, clearDisabled]);

  return { totalRanked: candidates.length };
}