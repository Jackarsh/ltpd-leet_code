import { db } from '@/lib/db';
import { isDataStale } from '@/server/services/leetcode/sync.service';
import { calculateCurrentStreak, isUserActive } from '@/lib/activity-utils';
import { computeStudentScoreBreakdown } from '@/server/services/ranking.service';
import {
  LeaderboardFilterParams,
  LeaderboardResponseDTO,
  LeaderboardRowDTO,
} from '@/types/leaderboard';

export async function getLeaderboardData(
  params: LeaderboardFilterParams
): Promise<LeaderboardResponseDTO> {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 25));

  // 1. Base query condition: Only active users with a linked LeetCode account
  // Note: Email is NEVER included in queries or public DTOs per Constitution.
  const activeUsers = await db.user.findMany({
    where: {
      status: 'ACTIVE',
      profile: { isNot: null },
      codingAccounts: {
        some: {
          platform: 'LEETCODE',
        },
      },
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
        where: { platform: 'LEETCODE' },
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
              globalContestRank: true,
              contestsAttended: true,
              submissionCalendarJson: true,
            },
          },
          submissions: {
            orderBy: { timestamp: 'desc' },
            take: 1,
            select: { timestamp: true },
          },
        },
        take: 1,
      },
    },
  });

  // Get most recent platform-wide successful sync timestamp (FR-240)
  const latestSyncAccount = await db.linkedCodingAccount.findFirst({
    where: { syncStatus: 'SUCCESS' },
    orderBy: { lastSyncAt: 'desc' },
    select: { lastSyncAt: true },
  });
  const lastPlatformSyncAt = latestSyncAccount?.lastSyncAt?.toISOString() ?? null;

  // 2. Map users to LeaderboardRowDTO
  const mappedRows: LeaderboardRowDTO[] = activeUsers.map((u) => {
    const profile = u.profile!;
    const codingAccount = u.codingAccounts[0];
    const stats = codingAccount?.statistics;
    const isSynced = codingAccount?.syncStatus === 'SUCCESS' && stats !== null && stats !== undefined;
    const lastSubmission = codingAccount?.submissions?.[0];
    const lastSubmissionAt = lastSubmission ? lastSubmission.timestamp.toISOString() : null;

    const streak = isSynced ? calculateCurrentStreak(stats?.submissionCalendarJson) : null;
    const active = isSynced ? isUserActive(lastSubmission?.timestamp, 30) : false;

    const easySolved = isSynced ? stats?.easySolved ?? 0 : null;
    const mediumSolved = isSynced ? stats?.mediumSolved ?? 0 : null;
    const hardSolved = isSynced ? stats?.hardSolved ?? 0 : null;
    const contestRating = isSynced ? stats?.contestRating ?? null : null;

    const scoreBreakdown = isSynced
      ? computeStudentScoreBreakdown(easySolved ?? 0, mediumSolved ?? 0, hardSolved ?? 0, contestRating)
      : undefined;

    return {
      id: profile.id,
      collegeRank: profile.collegeRank,
      displayName: profile.displayName || 'Anonymous Student',
      leetcodeUsername: codingAccount?.username || profile.leetcodeUsername,
      avatarUrl: profile.avatarUrl,
      branch: profile.branch || null,
      admissionYear: profile.admissionYear || null,
      graduationYear: profile.graduationYear || null,
      gender: profile.gender,
      isSynced,
      isStale: isSynced ? isDataStale(codingAccount?.lastSyncAt ?? null) : false,
      lastSyncAt: codingAccount?.lastSyncAt ? codingAccount.lastSyncAt.toISOString() : null,
      totalSolved: isSynced ? stats?.totalSolved ?? 0 : null,
      easySolved,
      mediumSolved,
      hardSolved,
      contestRating,
      globalContestRank: isSynced ? stats?.globalContestRank ?? null : null,
      contestsAttended: isSynced ? stats?.contestsAttended ?? 0 : null,
      currentStreak: streak,
      achievementCount: isSynced ? 0 : null,
      lastSubmissionAt,
      isActive: active,
      weightedScore: isSynced ? (profile.weightedScore ?? scoreBreakdown?.totalWeightedScore ?? 0) : null,
      scoreBreakdown,
    };
  });

  // 3. Apply in-memory filters (FR-223 to FR-233)
  let filtered = mappedRows;

  // Search filter (name, handle, branch, batch) - FR-229
  if (params.search && params.search.trim() !== '') {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((row) => {
      const matchName = row.displayName.toLowerCase().includes(q);
      const matchHandle = row.leetcodeUsername.toLowerCase().includes(q);
      const matchBranch = row.branch ? row.branch.toLowerCase().includes(q) : false;
      const matchAdmission = row.admissionYear ? row.admissionYear.toString().includes(q) : false;
      const matchGraduation = row.graduationYear ? row.graduationYear.toString().includes(q) : false;
      return matchName || matchHandle || matchBranch || matchAdmission || matchGraduation;
    });
  }

  // Branch filter (case-insensitive) - FR-223
  if (params.branch && params.branch.trim() !== '' && params.branch !== 'ALL') {
    const branchTarget = params.branch.trim().toLowerCase();
    filtered = filtered.filter(
      (row) => row.branch && row.branch.toLowerCase() === branchTarget
    );
  }

  // Batch filter (admission or graduation year) - FR-223, FR-227
  if (params.batch && params.batch !== 'ALL') {
    const batchYear = Number(params.batch);
    if (!isNaN(batchYear)) {
      filtered = filtered.filter(
        (row) => row.admissionYear === batchYear || row.graduationYear === batchYear
      );
    }
  }

  // Gender filter (strictly uses explicit gender, excludes missing) - FR-224
  if (params.gender && (params.gender === 'MALE' || params.gender === 'FEMALE')) {
    filtered = filtered.filter((row) => row.gender === params.gender);
  }

  // Min Problems Solved filter - FR-223
  if (typeof params.minSolved === 'number' && params.minSolved > 0) {
    filtered = filtered.filter((row) => (row.totalSolved ?? 0) >= (params.minSolved ?? 0));
  }

  // Min Contest Rating filter - FR-223
  if (typeof params.minRating === 'number' && params.minRating > 0) {
    filtered = filtered.filter(
      (row) => row.contestRating !== null && row.contestRating >= (params.minRating ?? 0)
    );
  }

  // Activity Status filter - FR-228
  if (params.activityStatus && (params.activityStatus === 'ACTIVE' || params.activityStatus === 'INACTIVE')) {
    const targetActive = params.activityStatus === 'ACTIVE';
    filtered = filtered.filter((row) => row.isActive === targetActive);
  }

  // 4. Sort Dimension (FR-220, FR-221, FR-222)
  const sortBy = params.sortBy || 'RANK';
  const sortDir = params.sortDir || (sortBy === 'RANK' ? 'asc' : 'desc');
  const isAsc = sortDir === 'asc';

  filtered.sort((a, b) => {
    // Helper to push nulls to the bottom regardless of sort direction (FR-221)
    const handleNulls = (valA: number | null | undefined, valB: number | null | undefined) => {
      const hasA = valA !== null && valA !== undefined;
      const hasB = valB !== null && valB !== undefined;
      if (!hasA && !hasB) return 0;
      if (!hasA) return 1; // null always at bottom
      if (!hasB) return -1;
      return null;
    };

    let comparison = 0;

    switch (sortBy) {
      case 'RANK': {
        const nullCheck = handleNulls(a.collegeRank, b.collegeRank);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (a.collegeRank! - b.collegeRank!) : (b.collegeRank! - a.collegeRank!);
        break;
      }
      case 'TOTAL_SOLVED': {
        const nullCheck = handleNulls(a.totalSolved, b.totalSolved);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (a.totalSolved! - b.totalSolved!) : (b.totalSolved! - a.totalSolved!);
        break;
      }
      case 'HARD_SOLVED': {
        const nullCheck = handleNulls(a.hardSolved, b.hardSolved);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (a.hardSolved! - b.hardSolved!) : (b.hardSolved! - a.hardSolved!);
        break;
      }
      case 'CONTEST_RATING': {
        const nullCheck = handleNulls(a.contestRating, b.contestRating);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (a.contestRating! - b.contestRating!) : (b.contestRating! - a.contestRating!);
        break;
      }
      case 'STREAK': {
        const nullCheck = handleNulls(a.currentStreak, b.currentStreak);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (a.currentStreak! - b.currentStreak!) : (b.currentStreak! - a.currentStreak!);
        break;
      }
      case 'RECENT_ACTIVITY': {
        const timeA = a.lastSubmissionAt ? new Date(a.lastSubmissionAt).getTime() : null;
        const timeB = b.lastSubmissionAt ? new Date(b.lastSubmissionAt).getTime() : null;
        const nullCheck = handleNulls(timeA, timeB);
        if (nullCheck !== null) comparison = nullCheck;
        else comparison = isAsc ? (timeA! - timeB!) : (timeB! - timeA!);
        break;
      }
      default: {
        comparison = 0;
      }
    }

    // Deterministic fallback to college rank ASC (FR-222)
    if (comparison === 0) {
      const rankA = a.collegeRank ?? 999999;
      const rankB = b.collegeRank ?? 999999;
      return rankA - rankB;
    }

    return comparison;
  });

  // 5. Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedStudents = filtered.slice(startIndex, startIndex + limit);

  return {
    students: paginatedStudents,
    total,
    page,
    totalPages,
    lastPlatformSyncAt,
  };
}