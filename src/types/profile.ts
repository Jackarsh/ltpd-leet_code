export interface DifficultyBreakdownDTO {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  easyPercentage: number | null;
  mediumPercentage: number | null;
  hardPercentage: number | null;
}

export interface ContestStatsDTO {
  currentRating: number | null;
  highestRating: number | null;
  globalRank: number | null;
  contestsAttended: number;
}

export interface HeatmapDayDTO {
  date: string; // YYYY-MM-DD
  count: number;
  hasData: boolean;
}

export interface ActivityMetricsDTO {
  dailyActivity: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  totalActivity: number;
  averageActivityOnActiveDays: number | null;
}

export interface ActivityFeedItemDTO {
  id: string;
  type: 'PROBLEM_SOLVED' | 'HARD_SOLVED' | 'ACHIEVEMENT_EARNED' | 'MILESTONE_REACHED';
  title: string;
  subtitle: string;
  timestamp: string;
  iconKey?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface UserBadgeDTO {
  id: string;
  achievementId: string | null;
  name: string;
  description: string | null;
  category: string;
  iconKey: string;
  unlockedAt: string;
  isRevoked: boolean;
  isLegacy: boolean;
  isLocked?: boolean;
  conditionText?: string;
  rarityLevel?: string;
  points?: number;
}

export interface PublicStudentProfileDTO {
  displayName: string;
  leetcodeUsername: string;
  avatarUrl: string | null;
  gender: 'MALE' | 'FEMALE';
  branch: string | null;
  admissionYear: number | null;
  graduationYear: number | null;
  collegeRank: number | null;
  weightedScore: number | null;
  isSynced: boolean;
  isStale: boolean;
  lastSyncAt: string | null;
  stats: DifficultyBreakdownDTO | null;
  contest: ContestStatsDTO | null;
  heatmap: {
    days: HeatmapDayDTO[];
    metrics: ActivityMetricsDTO;
  };
  feed: ActivityFeedItemDTO[];
  achievements: UserBadgeDTO[];
  lockedAchievements?: UserBadgeDTO[];
}