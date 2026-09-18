export type LeetCodeDifficulty = "Easy" | "Medium" | "Hard" | "All";

export interface LeetCodeSubmitStat {
  difficulty: LeetCodeDifficulty;
  count: number;
  submissions: number;
}

export interface LeetCodeSubmissionItem {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface LeetCodeContestRanking {
  attendedContestsCount: number;
  rating: number;
  globalRanking: number;
  totalParticipants: number;
  topPercentage: number;
}

export interface LeetCodeUserProfile {
  username: string;
  realName?: string;
  userAvatar?: string;
  ranking?: number;
}

export interface ParsedLeetCodeData {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  contestRating: number | null;
  globalContestRank: number | null;
  contestsAttended: number;
  submissionCalendar: Record<string, number>; // epoch seconds -> count
  recentSubmissions: {
    title: string;
    titleSlug: string;
    timestamp: Date;
    status: string;
    lang: string;
  }[];
}