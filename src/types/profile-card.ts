/**
 * DTOs and type definitions for R6 — Shareable GitHub Developer Profile Card
 */

export type CardTheme =
  | 'github-dark'
  | 'modern-light'
  | 'cyberpunk-neon'
  | 'midnight-navy'
  | 'minimalist';

export type CardLayout = 'standard' | 'compact';

export interface BadgeDTO {
  id: string;
  name: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  description: string;
}

export interface CardMetricsDTO {
  displayName: string;
  leetcodeUsername: string;
  collegeRank: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  currentStreak: number;
  badges: BadgeDTO[];
  allUnlockedBadges?: BadgeDTO[];
  isSyncing: boolean;
  isDeactivated: boolean;
  avatarUrl: string | null;
}

export interface ProfileCardConfigDTO {
  id: string;
  userId: string;
  cardToken: string;
  theme: CardTheme;
  layout: CardLayout;
  showStreak: boolean;
  showRating: boolean;
  showAchievements: boolean;
  featuredBadgeIds: string[];
}

export interface UpdateCardConfigInput {
  theme?: CardTheme;
  layout?: CardLayout;
  showStreak?: boolean;
  showRating?: boolean;
  showAchievements?: boolean;
  featuredBadgeIds?: string[];
}

export interface ThemeColors {
  background: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  easyBadge: string;
  mediumBadge: string;
  hardBadge: string;
  rankBadgeBg: string;
  rankBadgeBorder: string;
  rankBadgeText: string;
  streakText: string;
  progressBg: string;
}
