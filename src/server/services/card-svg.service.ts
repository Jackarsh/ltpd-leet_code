/**
 * R6 — GitHub Developer Profile Card SVG Rendering Engine
 *
 * Generates valid standalone SVG cards with rich theme support,
 * strict privacy filtering (Constitution Principle 3), and layout density options.
 */

import { db } from '@/lib/db';
import { getTheme } from '@/lib/card-themes';
import { calculateCurrentStreak } from '@/lib/activity-utils';
import type {
  CardMetricsDTO,
  ProfileCardConfigDTO,
  BadgeDTO,
  CardLayout,
  CardTheme,
  UpdateCardConfigInput,
} from '@/types/profile-card';

import {
  xmlEscape,
  truncate,
  generateUnavailableCardSvg,
  generateSyncingCardSvg,
  generateStandardCardSvg,
  generateCompactCardSvg,
  renderCardSvg,
} from '@/lib/card-svg-renderer';

export {
  xmlEscape,
  truncate,
  generateUnavailableCardSvg,
  generateSyncingCardSvg,
  generateStandardCardSvg,
  generateCompactCardSvg,
  renderCardSvg,
};

/**
 * Resolves or creates the user's ProfileCardConfig.
 */
export async function getOrCreateCardConfig(userId: string): Promise<ProfileCardConfigDTO> {
  const existing = await db.profileCardConfig.findUnique({
    where: { userId },
  });

  if (existing) {
    return {
      id: existing.id,
      userId: existing.userId,
      cardToken: existing.cardToken,
      theme: existing.theme as CardTheme,
      layout: existing.layout as CardLayout,
      showStreak: existing.showStreak,
      showRating: existing.showRating,
      showAchievements: existing.showAchievements,
      featuredBadgeIds: existing.featuredBadgeIds,
    };
  }

  const created = await db.profileCardConfig.create({
    data: {
      userId,
      theme: 'github-dark',
      layout: 'standard',
      showStreak: true,
      showRating: true,
      showAchievements: true,
      featuredBadgeIds: [],
    },
  });

  return {
    id: created.id,
    userId: created.userId,
    cardToken: created.cardToken,
    theme: created.theme as CardTheme,
    layout: created.layout as CardLayout,
    showStreak: created.showStreak,
    showRating: created.showRating,
    showAchievements: created.showAchievements,
    featuredBadgeIds: created.featuredBadgeIds,
  };
}

/**
 * Updates an authenticated student's card preferences.
 */
export async function updateCardConfig(
  userId: string,
  input: UpdateCardConfigInput
): Promise<ProfileCardConfigDTO> {
  const updated = await db.profileCardConfig.upsert({
    where: { userId },
    update: {
      ...(input.theme && { theme: input.theme }),
      ...(input.layout && { layout: input.layout }),
      ...(input.showStreak !== undefined && { showStreak: input.showStreak }),
      ...(input.showRating !== undefined && { showRating: input.showRating }),
      ...(input.showAchievements !== undefined && { showAchievements: input.showAchievements }),
      ...(input.featuredBadgeIds && { featuredBadgeIds: input.featuredBadgeIds.slice(0, 3) }),
    },
    create: {
      userId,
      theme: input.theme ?? 'github-dark',
      layout: input.layout ?? 'standard',
      showStreak: input.showStreak ?? true,
      showRating: input.showRating ?? true,
      showAchievements: input.showAchievements ?? true,
      featuredBadgeIds: (input.featuredBadgeIds ?? []).slice(0, 3),
    },
  });

  return {
    id: updated.id,
    userId: updated.userId,
    cardToken: updated.cardToken,
    theme: updated.theme as CardTheme,
    layout: updated.layout as CardLayout,
    showStreak: updated.showStreak,
    showRating: updated.showRating,
    showAchievements: updated.showAchievements,
    featuredBadgeIds: updated.featuredBadgeIds,
  };
}

/**
 * Fetches card data and metrics by public username OR opaque cardToken.
 * Strips all private fields (email, roll number, phone) per Constitution Principle 3.
 */
export async function getCardDataByIdentifier(
  identifier: string
): Promise<{ metrics: CardMetricsDTO; config: ProfileCardConfigDTO } | null> {
  // First attempt: match by opaque cardToken
  const configRow = await db.profileCardConfig.findUnique({
    where: { cardToken: identifier },
    include: {
      user: {
        include: {
          profile: true,
          codingAccounts: {
            where: { platform: 'LEETCODE' },
            include: { statistics: true },
          },
          achievements: {
            where: { isRevoked: false },
            include: { achievement: true },
          },
        },
      },
    },
  });

  let user = configRow?.user ?? null;
  let cardConfig: ProfileCardConfigDTO | null = configRow
    ? {
        id: configRow.id,
        userId: configRow.userId,
        cardToken: configRow.cardToken,
        theme: configRow.theme as CardTheme,
        layout: configRow.layout as CardLayout,
        showStreak: configRow.showStreak,
        showRating: configRow.showRating,
        showAchievements: configRow.showAchievements,
        featuredBadgeIds: configRow.featuredBadgeIds,
      }
    : null;

  // Second attempt: match by username (leetcodeUsername or profile username)
  if (!user) {
    const foundUser = await db.user.findFirst({
      where: {
        OR: [
          { profile: { leetcodeUsername: identifier } },
          { codingAccounts: { some: { platform: 'LEETCODE', username: identifier } } },
        ],
      },
      include: {
        profile: true,
        codingAccounts: {
          where: { platform: 'LEETCODE' },
          include: { statistics: true },
        },
        achievements: {
          where: { isRevoked: false },
          include: { achievement: true },
        },
        cardConfig: true,
      },
    });

    if (foundUser) {
      user = foundUser;
      if (foundUser.cardConfig) {
        cardConfig = {
          id: foundUser.cardConfig.id,
          userId: foundUser.cardConfig.userId,
          cardToken: foundUser.cardConfig.cardToken,
          theme: foundUser.cardConfig.theme as CardTheme,
          layout: foundUser.cardConfig.layout as CardLayout,
          showStreak: foundUser.cardConfig.showStreak,
          showRating: foundUser.cardConfig.showRating,
          showAchievements: foundUser.cardConfig.showAchievements,
          featuredBadgeIds: foundUser.cardConfig.featuredBadgeIds,
        };
      }
    }
  }

  if (!user || !user.profile) {
    return null;
  }

  const isDeactivated = user.status === 'DISABLED';
  const leetcodeAccount = user.codingAccounts[0];
  const isSyncing = !leetcodeAccount || leetcodeAccount.syncStatus === 'PENDING' || leetcodeAccount.syncStatus === 'IN_PROGRESS';
  const stats = leetcodeAccount?.statistics;

  // Calculate streak from calendar json
  const currentStreak = stats?.submissionCalendarJson
    ? calculateCurrentStreak(stats.submissionCalendarJson)
    : 0;

  // Rank unlocked achievements by rarity: LEGENDARY > EPIC > RARE > COMMON
  const rarityWeight: Record<string, number> = {
    LEGENDARY: 4,
    EPIC: 3,
    RARE: 2,
    COMMON: 1,
  };

  const unlockedBadges: BadgeDTO[] = user.achievements
    .map((ua) => ({
      id: ua.achievementId ?? ua.id,
      name: ua.name,
      icon: ua.iconKey ?? ua.achievement?.iconKey ?? 'trophy',
      rarity: (ua.achievement?.rarityLevel as BadgeDTO['rarity']) ?? 'COMMON',
      description: ua.description ?? ua.achievement?.description ?? '',
    }))
    .sort((a, b) => (rarityWeight[b.rarity] ?? 0) - (rarityWeight[a.rarity] ?? 0));

  const config: ProfileCardConfigDTO = cardConfig ?? {
    id: 'default',
    userId: user.id,
    cardToken: identifier,
    theme: 'github-dark' as CardTheme,
    layout: 'standard' as CardLayout,
    showStreak: true,
    showRating: true,
    showAchievements: true,
    featuredBadgeIds: [],
  };

  let featuredBadges: BadgeDTO[] = [];
  if (config.featuredBadgeIds.length > 0) {
    featuredBadges = config.featuredBadgeIds
      .map((id) => unlockedBadges.find((b) => b.id === id))
      .filter((b): b is BadgeDTO => b !== undefined);
  }
  if (featuredBadges.length === 0) {
    featuredBadges = unlockedBadges.slice(0, 3);
  }

  const metrics: CardMetricsDTO = {
    displayName: user.profile.displayName,
    leetcodeUsername: user.profile.leetcodeUsername,
    collegeRank: user.profile.collegeRank,
    totalSolved: stats?.totalSolved ?? 0,
    easySolved: stats?.easySolved ?? 0,
    mediumSolved: stats?.mediumSolved ?? 0,
    hardSolved: stats?.hardSolved ?? 0,
    contestRating: stats?.contestRating ?? null,
    currentStreak,
    badges: featuredBadges,
    allUnlockedBadges: unlockedBadges,
    isSyncing,
    isDeactivated,
    avatarUrl: user.profile.avatarUrl,
  };

  return { metrics, config };
}
