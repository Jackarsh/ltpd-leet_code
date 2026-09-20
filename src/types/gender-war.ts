/**
 * R5 — Gender War
 * TypeScript DTO interfaces and type definitions.
 */

/** The five supported comparison time windows (FR-417). */
export type GenderWarTimeWindow =
  | 'CURRENT_WEEK'
  | 'CURRENT_MONTH'
  | 'SEMESTER'
  | 'ACADEMIC_YEAR'
  | 'ALL_TIME';

/** The two gender groups (FR-401). Only Male and Female are valid. */
export type GenderGroup = 'MALE' | 'FEMALE';

/**
 * All 15 aggregate metrics required by FR-409 for a single gender group
 * in a given time window.
 *
 * - Averages are per-participant (normalized).
 * - avgContestRating is null when ratedParticipantCount === 0 (FR-412 / FR-413).
 * - Division-by-zero is never surfaced; the service layer returns null instead (FR-413).
 */
export interface GroupMetricsDTO {
  gender: GenderGroup;
  timeWindow: GenderWarTimeWindow;
  /** Optional academic period ID when timeWindow is SEMESTER or ACADEMIC_YEAR. */
  periodId: string | null;

  // --- FR-409 metrics ---
  /** 1. Participant count — all students in this gender group. */
  participantCount: number;

  /** 2. Total problems solved (cumulative). */
  totalSolved: number;
  /** 3. Average problems solved per participant. */
  avgSolvedPerStudent: number;

  /** 4. Total Hard problems solved. */
  totalHard: number;
  /** 5. Average Hard problems solved per participant. */
  avgHardPerStudent: number;

  /** 6. Total Medium problems solved. */
  totalMedium: number;
  /** 7. Average Medium problems solved per participant. */
  avgMediumPerStudent: number;

  /** 8. Total Easy problems solved. */
  totalEasy: number;
  /** 9. Average Easy problems solved per participant. */
  avgEasyPerStudent: number;

  /**
   * 10. Average contest rating — computed only over rated participants (FR-412).
   * Null when ratedParticipantCount === 0 (FR-413).
   */
  avgContestRating: number | null;
  /** How many participants have a confirmed contest rating (FR-412). */
  ratedParticipantCount: number;

  /** 11. Total contests attended. */
  totalContestsAttended: number;
  /** 12. Average contests attended per participant. */
  avgContestsPerStudent: number;

  /**
   * 13. Active coders — participants with >=1 accepted submission
   * OR >=1 contest attended in the selected period window (FR-409 #13).
   */
  activeCodersCount: number;

  /** 14. Recent submissions — total accepted submissions in the selected period. */
  recentSubmissionsCount: number;

  /** 15. Average current streak across all participants (in days). */
  avgStreakDays: number;

  // --- Status / quality signals ---
  /** True when active participant count < 5 (FR-415). */
  isLowSampleSize: boolean;
  /** True when any participant's sync data is stale (>24 h old) (FR-434). */
  hasStaleData: boolean;
  /** Count of participants with no successful sync yet (FR-411). */
  pendingDataCount: number;

  /** When these metrics were last computed. */
  computedAt: string; // ISO-8601
}

/**
 * A single row in the within-group leaderboard (FR-429).
 * Optional fields (batch, branch) are only populated when the student provided them.
 */
export interface LeaderboardRowDTO {
  /** Group rank within this gender leaderboard. */
  groupRank: number;
  /** Public display name of the student. */
  displayName: string;
  /** Avatar URL; null when the student has no avatar set. */
  avatarUrl: string | null;
  /** Admission year shown as batch label when provided by the student. */
  batch: number | null;
  /** Academic branch when provided by the student. */
  branch: string | null;
  /** Total problems solved. */
  totalSolved: number;
  /** Hard problems solved (used for tie-breaking per FR-430). */
  hardSolved: number;
  /**
   * Current contest rating.
   * Null when the student has no confirmed contest rating (FR-429).
   */
  contestRating: number | null;
  /** College-wide rank (from UserProfile.collegeRank). */
  collegeRank: number | null;
  /** Public profile URL slug (username). */
  username: string;
}

/**
 * Full API response shape for GET /api/gender-war (per plan.md §4).
 * Contains aggregate metrics and top-10 leaderboards for both groups.
 */
export interface GenderWarResponseDTO {
  male: GroupMetricsDTO;
  female: GroupMetricsDTO;
  maleTop10: LeaderboardRowDTO[];
  femaleTop10: LeaderboardRowDTO[];
  computedAt: string; // ISO-8601 — reflects the most recent computation timestamp
}

/**
 * Query parameters accepted by GET /api/gender-war.
 */
export interface GenderWarQueryParams {
  period?: GenderWarTimeWindow;
  /** Optional academic period ID for SEMESTER / ACADEMIC_YEAR windows. */
  periodId?: string;
}
