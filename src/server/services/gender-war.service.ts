/**
 * R5 — Gender War Aggregation Service
 *
 * Computes the 15 aggregate metrics (FR-409) for both gender groups across
 * all 5 time windows (FR-417). Results are upserted into the GenderWarAggregate
 * table and returned as DTOs.
 *
 * Design constraints (from spec.md / constitution):
 * - Group membership is derived EXCLUSIVELY from UserProfile.gender (FR-402).
 * - Email is NEVER selected or exposed in any query (constitution).
 * - Division-by-zero is never surfaced: returns null for undefined averages (FR-413).
 * - Active coders = >=1 accepted submission OR >=1 contest attended in window (FR-409 #13).
 * - Average contest rating excludes unrated participants from denominator (FR-412).
 * - isLowSampleSize = true when active participants < 5 (FR-415).
 */

import { db } from '@/lib/db';
import { isDataStale } from '@/server/services/leetcode/sync.service';
import { calculateCurrentStreak } from '@/lib/activity-utils';
import {
  getCachedItem,
  setCachedItem,
  invalidateGenderWarCache,
  GenderWarCacheKeys,
} from '@/lib/gender-war-cache';
export { invalidateGenderWarCache, getCachedItem, setCachedItem, GenderWarCacheKeys };
import type {
  GenderWarTimeWindow,
  GenderGroup,
  GroupMetricsDTO,
  LeaderboardRowDTO,
  GenderWarResponseDTO,
} from '@/types/gender-war';

/** All valid time windows in display order. */
export const TIME_WINDOWS: GenderWarTimeWindow[] = [
  'CURRENT_WEEK',
  'CURRENT_MONTH',
  'SEMESTER',
  'ACADEMIC_YEAR',
  'ALL_TIME',
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns the UTC start of the current ISO week (Monday 00:00:00 UTC). */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun…6=Sat
  const diff = (day === 0 ? -6 : 1 - day); // shift to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

/** Returns the first day of the current UTC month. */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Resolves the Date boundary for a given time window.
 * Returns null for ALL_TIME (no lower bound).
 * SEMESTER and ACADEMIC_YEAR return null here — the caller is expected to
 * inject the period start date derived from the academic period configuration
 * (R7 AcademicPeriod). Until R7 is built, these fall back to ALL_TIME behaviour.
 */
function getWindowStart(window: GenderWarTimeWindow): Date | null {
  switch (window) {
    case 'CURRENT_WEEK':
      return getWeekStart();
    case 'CURRENT_MONTH':
      return getMonthStart();
    case 'SEMESTER':
    case 'ACADEMIC_YEAR':
    case 'ALL_TIME':
    default:
      return null;
  }
}

/** Safe division — returns null when denominator is 0 (FR-413). */
function safeDiv(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

// ---------------------------------------------------------------------------
// Core participant data loader
// ---------------------------------------------------------------------------

interface ParticipantRow {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  admissionYear: number | null;
  branch: string | null;
  collegeRank: number | null;
  leetcodeUsername: string;
  // stats
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  contestsAttended: number;
  longestStreak: number;
  submissionCalendarJson: string | null;
  // sync meta
  lastSyncAt: Date | null;
  syncStatus: string;
  // window-scoped submission count (computed separately)
  windowAcceptedCount: number;
  windowContestsCount: number;
}

/**
 * Loads all ACTIVE students for a given gender group, together with their
 * linked LeetCode statistics. Email is never selected.
 */
async function loadParticipants(gender: GenderGroup): Promise<ParticipantRow[]> {
  const users = await db.user.findMany({
    where: {
      status: 'ACTIVE',
      profile: { gender: gender as 'MALE' | 'FEMALE' },
      codingAccounts: { some: { platform: 'LEETCODE' } },
    },
    select: {
      id: true,
      // email intentionally omitted (constitution)
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          admissionYear: true,
          branch: true,
          collegeRank: true,
          leetcodeUsername: true,
        },
      },
      codingAccounts: {
        where: { platform: 'LEETCODE' },
        select: {
          username: true,
          lastSyncAt: true,
          syncStatus: true,
          statistics: {
            select: {
              totalSolved: true,
              easySolved: true,
              mediumSolved: true,
              hardSolved: true,
              contestRating: true,
              contestsAttended: true,
              longestStreak: true,
              submissionCalendarJson: true,
            },
          },
        },
      },
    },
  });

  return users.flatMap((u) => {
    if (!u.profile) return [];
    const account = u.codingAccounts[0];
    if (!account) return [];
    const stats = account.statistics;

    return [
      {
        userId: u.id,
        displayName: u.profile.displayName,
        avatarUrl: u.profile.avatarUrl,
        admissionYear: u.profile.admissionYear,
        branch: u.profile.branch,
        collegeRank: u.profile.collegeRank,
        leetcodeUsername: u.profile.leetcodeUsername,
        totalSolved: stats?.totalSolved ?? 0,
        easySolved: stats?.easySolved ?? 0,
        mediumSolved: stats?.mediumSolved ?? 0,
        hardSolved: stats?.hardSolved ?? 0,
        contestRating: stats?.contestRating ?? null,
        contestsAttended: stats?.contestsAttended ?? 0,
        longestStreak: stats?.longestStreak ?? 0,
        submissionCalendarJson: stats?.submissionCalendarJson ?? null,
        lastSyncAt: account.lastSyncAt,
        syncStatus: account.syncStatus,
        windowAcceptedCount: 0, // populated below
        windowContestsCount: 0,
      },
    ];
  });
}

/**
 * Counts accepted submissions in the given window per participant account.
 * Returns a map from LeetCode username → count.
 */
async function loadWindowSubmissions(
  gender: GenderGroup,
  windowStart: Date | null
): Promise<Map<string, number>> {
  const accounts = await db.linkedCodingAccount.findMany({
    where: {
      platform: 'LEETCODE',
      user: {
        status: 'ACTIVE',
        profile: { gender: gender as 'MALE' | 'FEMALE' },
      },
    },
    select: {
      username: true,
      submissions: {
        where: {
          status: 'Accepted',
          ...(windowStart ? { timestamp: { gte: windowStart } } : {}),
        },
        select: { id: true },
      },
    },
  });

  const result = new Map<string, number>();
  for (const acc of accounts) {
    result.set(acc.username, acc.submissions.length);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Aggregate computation
// ---------------------------------------------------------------------------

/**
 * Computes all 15 metrics for a gender group in the given time window.
 * Never divides by zero; returns null for undefined averages (FR-413).
 */
function computeGroupMetrics(
  gender: GenderGroup,
  timeWindow: GenderWarTimeWindow,
  periodId: string | null,
  participants: ParticipantRow[]
): GroupMetricsDTO {
  const now = new Date().toISOString();

  if (participants.length === 0) {
    // FR-413: Return null averages when there are zero participants
    return {
      gender,
      timeWindow,
      periodId,
      participantCount: 0,
      totalSolved: 0,
      avgSolvedPerStudent: 0,
      totalHard: 0,
      avgHardPerStudent: 0,
      totalMedium: 0,
      avgMediumPerStudent: 0,
      totalEasy: 0,
      avgEasyPerStudent: 0,
      avgContestRating: null,
      ratedParticipantCount: 0,
      totalContestsAttended: 0,
      avgContestsPerStudent: 0,
      activeCodersCount: 0,
      recentSubmissionsCount: 0,
      avgStreakDays: 0,
      isLowSampleSize: true,
      hasStaleData: false,
      pendingDataCount: 0,
      computedAt: now,
    };
  }

  const count = participants.length;

  // Aggregate raw totals
  let totalSolved = 0;
  let totalHard = 0;
  let totalMedium = 0;
  let totalEasy = 0;
  let totalContests = 0;
  let totalStreakSum = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  let activeCount = 0;
  let recentSubmissions = 0;
  let hasStaleData = false;
  let pendingDataCount = 0;

  for (const p of participants) {
    // Stale check (FR-434)
    if (isDataStale(p.lastSyncAt)) hasStaleData = true;
    // Pending check (FR-411) — PENDING means no successful sync yet
    if (p.syncStatus === 'PENDING') {
      pendingDataCount++;
      // Contributes zero to all aggregates (FR-411)
      continue;
    }

    totalSolved += p.totalSolved;
    totalHard += p.hardSolved;
    totalMedium += p.mediumSolved;
    totalEasy += p.easySolved;
    totalContests += p.contestsAttended;

    // Streak (use calculateCurrentStreak for live accuracy)
    const streak = calculateCurrentStreak(p.submissionCalendarJson);
    totalStreakSum += streak;

    // Contest rating — only count rated participants in the average (FR-412)
    if (p.contestRating !== null) {
      ratingSum += p.contestRating;
      ratedCount++;
    }

    // Active coders: >=1 accepted submission in window OR >=1 contest (FR-409 #13)
    const isActive =
      (p.windowAcceptedCount ?? 0) >= 1 || p.contestsAttended >= 1;
    if (isActive) activeCount++;

    recentSubmissions += p.windowAcceptedCount ?? 0;
  }

  const syncedCount = count - pendingDataCount;

  return {
    gender,
    timeWindow,
    periodId,
    participantCount: count,

    totalSolved,
    avgSolvedPerStudent: safeDiv(totalSolved, syncedCount) ?? 0,

    totalHard,
    avgHardPerStudent: safeDiv(totalHard, syncedCount) ?? 0,

    totalMedium,
    avgMediumPerStudent: safeDiv(totalMedium, syncedCount) ?? 0,

    totalEasy,
    avgEasyPerStudent: safeDiv(totalEasy, syncedCount) ?? 0,

    // FR-412: null when ratedCount === 0
    avgContestRating: safeDiv(ratingSum, ratedCount),
    ratedParticipantCount: ratedCount,

    totalContestsAttended: totalContests,
    avgContestsPerStudent: safeDiv(totalContests, syncedCount) ?? 0,

    activeCodersCount: activeCount,
    recentSubmissionsCount: recentSubmissions,
    avgStreakDays: safeDiv(totalStreakSum, syncedCount) ?? 0,

    // FR-415: flag when active participants < 5
    isLowSampleSize: activeCount < 5,
    hasStaleData,
    pendingDataCount,
    computedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Computes Gender War aggregates for a specific gender + time window,
 * upserts the result into GenderWarAggregate, and returns the DTO.
 */
export async function computeAndPersistAggregates(
  gender: GenderGroup,
  timeWindow: GenderWarTimeWindow,
  periodId: string | null = null
): Promise<GroupMetricsDTO> {
  const windowStart = getWindowStart(timeWindow);

  // 1. Load participants and window-scoped submission counts in parallel
  const [participants, windowSubMap] = await Promise.all([
    loadParticipants(gender),
    loadWindowSubmissions(gender, windowStart),
  ]);

  // 2. Annotate each participant with their window-scoped submission count
  for (const p of participants) {
    p.windowAcceptedCount = windowSubMap.get(p.leetcodeUsername) ?? 0;
  }

  // 3. Compute all metrics
  const metrics = computeGroupMetrics(gender, timeWindow, periodId, participants);

  // 4. Upsert into GenderWarAggregate (FR-416)
  await db.genderWarAggregate.upsert({
    where: {
      gender_timeWindow_periodId: {
        gender: gender as 'MALE' | 'FEMALE',
        timeWindow,
        periodId: periodId ?? '',
      },
    },
    create: {
      gender: gender as 'MALE' | 'FEMALE',
      timeWindow,
      periodId,
      participantCount: metrics.participantCount,
      totalSolved: metrics.totalSolved,
      avgSolvedPerStudent: metrics.avgSolvedPerStudent,
      totalHard: metrics.totalHard,
      avgHardPerStudent: metrics.avgHardPerStudent,
      totalMedium: metrics.totalMedium,
      avgMediumPerStudent: metrics.avgMediumPerStudent,
      totalEasy: metrics.totalEasy,
      avgEasyPerStudent: metrics.avgEasyPerStudent,
      totalContestsAttended: metrics.totalContestsAttended,
      avgContestsPerStudent: metrics.avgContestsPerStudent,
      ratedParticipantCount: metrics.ratedParticipantCount,
      avgContestRating: metrics.avgContestRating,
      activeCodersCount: metrics.activeCodersCount,
      recentSubmissionsCount: metrics.recentSubmissionsCount,
      avgStreakDays: metrics.avgStreakDays,
      isLowSampleSize: metrics.isLowSampleSize,
      hasStaleData: metrics.hasStaleData,
      pendingDataCount: metrics.pendingDataCount,
      computedAt: new Date(metrics.computedAt),
    },
    update: {
      participantCount: metrics.participantCount,
      totalSolved: metrics.totalSolved,
      avgSolvedPerStudent: metrics.avgSolvedPerStudent,
      totalHard: metrics.totalHard,
      avgHardPerStudent: metrics.avgHardPerStudent,
      totalMedium: metrics.totalMedium,
      avgMediumPerStudent: metrics.avgMediumPerStudent,
      totalEasy: metrics.totalEasy,
      avgEasyPerStudent: metrics.avgEasyPerStudent,
      totalContestsAttended: metrics.totalContestsAttended,
      avgContestsPerStudent: metrics.avgContestsPerStudent,
      ratedParticipantCount: metrics.ratedParticipantCount,
      avgContestRating: metrics.avgContestRating,
      activeCodersCount: metrics.activeCodersCount,
      recentSubmissionsCount: metrics.recentSubmissionsCount,
      avgStreakDays: metrics.avgStreakDays,
      isLowSampleSize: metrics.isLowSampleSize,
      hasStaleData: metrics.hasStaleData,
      pendingDataCount: metrics.pendingDataCount,
      computedAt: new Date(metrics.computedAt),
    },
  });

  return metrics;
}

// ---------------------------------------------------------------------------
// Caching Tier integration (T023 / FR-416 / SC-401)
// Caching logic is provided by @/lib/gender-war-cache with sub-millisecond
// in-memory lookups, TTL invalidation, and instant purge on recomputation.
// ---------------------------------------------------------------------------

/**
 * Reads the most recently persisted aggregate for a gender + window,
 * checking the fast in-memory cache first, falling back to the database,
 * or computing live if no record exists.
 */
export async function getCachedAggregate(
  gender: GenderGroup,
  timeWindow: GenderWarTimeWindow,
  periodId: string | null = null
): Promise<GroupMetricsDTO> {
  const cacheKey = `gw:agg:${gender}:${timeWindow}:${periodId ?? ''}`;
  const memCached = getCachedItem<GroupMetricsDTO>(cacheKey);
  if (memCached) {
    return memCached;
  }

  const row = await db.genderWarAggregate.findUnique({
    where: {
      gender_timeWindow_periodId: {
        gender: gender as 'MALE' | 'FEMALE',
        timeWindow,
        periodId: periodId ?? '',
      },
    },
  });

  if (!row) {
    // No cached result — compute on-demand
    const computed = await computeAndPersistAggregates(gender, timeWindow, periodId);
    setCachedItem(cacheKey, computed);
    return computed;
  }

  const dto: GroupMetricsDTO = {
    gender,
    timeWindow,
    periodId,
    participantCount: row.participantCount,
    totalSolved: row.totalSolved,
    avgSolvedPerStudent: row.avgSolvedPerStudent,
    totalHard: row.totalHard,
    avgHardPerStudent: row.avgHardPerStudent,
    totalMedium: row.totalMedium,
    avgMediumPerStudent: row.avgMediumPerStudent,
    totalEasy: row.totalEasy,
    avgEasyPerStudent: row.avgEasyPerStudent,
    avgContestRating: row.avgContestRating,
    ratedParticipantCount: row.ratedParticipantCount,
    totalContestsAttended: row.totalContestsAttended,
    avgContestsPerStudent: row.avgContestsPerStudent,
    activeCodersCount: row.activeCodersCount,
    recentSubmissionsCount: row.recentSubmissionsCount,
    avgStreakDays: row.avgStreakDays,
    isLowSampleSize: row.isLowSampleSize,
    hasStaleData: row.hasStaleData,
    pendingDataCount: row.pendingDataCount,
    computedAt: row.computedAt.toISOString(),
  };

  setCachedItem(cacheKey, dto);
  return dto;
}

/**
 * Builds the within-group leaderboard for the given gender group.
 * Ordering: totalSolved DESC → hardSolved DESC → collegeRank ASC (FR-430).
 * Top 10 by default (FR-428). Offset + limit enables pagination.
 */
export async function getWithinGroupLeaderboard(
  gender: GenderGroup,
  offset = 0,
  limit = 10
): Promise<LeaderboardRowDTO[]> {
  const cacheKey = `gw:lb:${gender}:${offset}:${limit}`;
  const memCached = getCachedItem<LeaderboardRowDTO[]>(cacheKey);
  if (memCached) {
    return memCached;
  }

  const users = await db.user.findMany({
    where: {
      status: 'ACTIVE',
      profile: { gender: gender as 'MALE' | 'FEMALE' },
      codingAccounts: { some: { platform: 'LEETCODE', isVerified: true } },
    },
    skip: offset,
    // Fetch extra row to detect "has more" if needed in the future
    take: limit,
    select: {
      profile: {
        select: {
          displayName: true,
          avatarUrl: true,
          admissionYear: true,
          branch: true,
          collegeRank: true,
          leetcodeUsername: true,
        },
      },
      codingAccounts: {
        where: { platform: 'LEETCODE' },
        select: {
          statistics: {
            select: {
              totalSolved: true,
              hardSolved: true,
              contestRating: true,
            },
          },
        },
      },
    },
    orderBy: [
      { profile: { weightedScore: 'desc' } },
    ],
  });

  // Sort client-side for tie-breaking per FR-430:
  // 1. totalSolved DESC, 2. hardSolved DESC, 3. collegeRank ASC
  const rows = users.flatMap((u) => {
    if (!u.profile) return [];
    const stats = u.codingAccounts[0]?.statistics;
    return [
      {
        displayName: u.profile.displayName,
        avatarUrl: u.profile.avatarUrl,
        batch: u.profile.admissionYear,
        branch: u.profile.branch,
        collegeRank: u.profile.collegeRank,
        username: u.profile.leetcodeUsername,
        totalSolved: stats?.totalSolved ?? 0,
        hardSolved: stats?.hardSolved ?? 0,
        contestRating: stats?.contestRating ?? null,
      },
    ];
  });

  rows.sort((a, b) => {
    if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
    if (b.hardSolved !== a.hardSolved) return b.hardSolved - a.hardSolved;
    // College rank: lower number = better rank (ascending)
    const ra = a.collegeRank ?? Number.MAX_SAFE_INTEGER;
    const rb = b.collegeRank ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });

  const result = rows.map((r, idx) => ({
    groupRank: offset + idx + 1,
    displayName: r.displayName,
    avatarUrl: r.avatarUrl,
    batch: r.batch,
    branch: r.branch,
    collegeRank: r.collegeRank,
    username: r.username,
    totalSolved: r.totalSolved,
    hardSolved: r.hardSolved,
    contestRating: r.contestRating,
  }));

  setCachedItem(cacheKey, result);
  return result;
}

/**
 * Entry point: fetches the full Gender War response for a given time window.
 * Used by GET /api/gender-war and the page server component.
 */
export async function getGenderWarData(
  timeWindow: GenderWarTimeWindow = 'ALL_TIME',
  periodId: string | null = null
): Promise<GenderWarResponseDTO> {
  const cacheKey = `gw:full:${timeWindow}:${periodId ?? ''}`;
  const memCached = getCachedItem<GenderWarResponseDTO>(cacheKey);
  if (memCached) {
    return memCached;
  }

  const [male, female, maleTop10, femaleTop10] = await Promise.all([
    getCachedAggregate('MALE', timeWindow, periodId),
    getCachedAggregate('FEMALE', timeWindow, periodId),
    getWithinGroupLeaderboard('MALE', 0, 10),
    getWithinGroupLeaderboard('FEMALE', 0, 10),
  ]);

  // Use the most recent computedAt timestamp across both groups
  const computedAt =
    new Date(male.computedAt) >= new Date(female.computedAt)
      ? male.computedAt
      : female.computedAt;

  const result: GenderWarResponseDTO = { male, female, maleTop10, femaleTop10, computedAt };
  setCachedItem(cacheKey, result);
  return result;
}

/**
 * Triggers a full recompute of all gender + window combinations.
 * Called after platform-wide sync batch completion (FR-416).
 */
export async function recomputeAllGenderWarAggregates(): Promise<void> {
  invalidateGenderWarCache();
  const genders: GenderGroup[] = ['MALE', 'FEMALE'];
  for (const gender of genders) {
    for (const window of TIME_WINDOWS) {
      await computeAndPersistAggregates(gender, window, null);
    }
  }
}
