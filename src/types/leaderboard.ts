export type LeaderboardSortDimension =
  | 'RANK'
  | 'TOTAL_SOLVED'
  | 'HARD_SOLVED'
  | 'CONTEST_RATING'
  | 'RECENT_ACTIVITY'
  | 'STREAK';

export type LeaderboardSortDirection = 'asc' | 'desc';

export interface LeaderboardFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  branch?: string;
  batch?: number | string;
  gender?: 'MALE' | 'FEMALE';
  minSolved?: number;
  minRating?: number;
  activityStatus?: 'ACTIVE' | 'INACTIVE';
  sortBy?: LeaderboardSortDimension;
  sortDir?: LeaderboardSortDirection;
}

export interface ScoreBreakdownDTO {
  easySolved: number;
  easyWeight: number;
  easyContribution: number;
  mediumSolved: number;
  mediumWeight: number;
  mediumContribution: number;
  hardSolved: number;
  hardWeight: number;
  hardContribution: number;
  contestRating: number | null;
  contestRatingWeight: number;
  contestRatingContribution: number;
  totalWeightedScore: number;
}

export interface LeaderboardRowDTO {
  id: string;
  collegeRank: number | null;
  displayName: string;
  leetcodeUsername: string;
  avatarUrl: string | null;
  branch: string | null;
  admissionYear: number | null;
  graduationYear: number | null;
  gender: 'MALE' | 'FEMALE';
  isSynced: boolean;
  isStale: boolean;
  lastSyncAt: string | null;
  totalSolved: number | null;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
  contestRating: number | null;
  globalContestRank: number | null;
  contestsAttended: number | null;
  currentStreak: number | null;
  achievementCount: number | null;
  lastSubmissionAt: string | null;
  isActive: boolean;
  weightedScore: number | null;
  scoreBreakdown?: ScoreBreakdownDTO;
}

export interface LeaderboardResponseDTO {
  students: LeaderboardRowDTO[];
  total: number;
  page: number;
  totalPages: number;
  lastPlatformSyncAt: string | null;
}

export interface RecognitionCardData {
  category: 'MOST_SOLVED' | 'TOP_RATING' | 'MOST_HARD';
  title: string;
  description: string;
  student: {
    displayName: string;
    leetcodeUsername: string;
    avatarUrl: string | null;
    collegeRank: number | null;
    value: string | number;
    sublabel: string;
  } | null;
  tieBreakerRule: string;
}

export interface RankingFormulaConfigDTO {
  easyWeight: number;
  mediumWeight: number;
  hardWeight: number;
  contestRatingWeight: number;
  inactivityThresholdDays: number;
  staleThresholdHours: number;
  tieBreakingSequence: string[];
}