import { db } from "@/lib/db";
import { DEFAULT_ACHIEVEMENTS } from "@/lib/default-achievements";
import { evaluateCondition, RuleVariables } from "./achievement-rule.service";
import { calculateCurrentStreak } from "@/lib/activity-utils";
import { UserBadgeDTO } from "@/types/profile";
// In-memory memoization flag to prevent 15 redundant DB upserts per sync
let defaultAchievementsSeeded = false;

/**
 * Ensures default collegiate achievements exist in the database.
 * Memoized in-memory to prevent redundant database upserts on every evaluation.
 */
export async function ensureDefaultAchievementsExist(force = false) {
  if (defaultAchievementsSeeded && !force) {
    return;
  }

  for (const def of DEFAULT_ACHIEVEMENTS) {
    await db.achievement.upsert({
      where: { slug: def.slug },
      create: {
        name: def.name,
        slug: def.slug,
        description: def.description,
        category: def.category,
        iconKey: def.iconKey,
        conditionExpression: def.conditionExpression,
        rarityLevel: def.rarityLevel,
        points: def.points,
        status: "PUBLISHED",
      },
      update: {
        description: def.description,
        conditionExpression: def.conditionExpression,
        points: def.points,
      },
    });
  }

  defaultAchievementsSeeded = true;
}

/**
 * Evaluates all published achievements for a user and awards or revokes accordingly.
 * Runs post-sync atomically (FR-328, FR-329, FR-335, FR-336).
 */
export async function evaluateAndAwardAchievements(userId: string, accountId: string) {
  // Ensure default achievements are seeded
  await ensureDefaultAchievementsExist();

  // 1. Fetch user stats and account
  const account = await db.linkedCodingAccount.findUnique({
    where: { id: accountId },
    include: { statistics: true },
  });

  if (!account || !account.statistics) {
    return { newlyAwarded: 0, reAwarded: 0, revoked: 0 };
  }

  const stats = account.statistics;
  const currentStreak = calculateCurrentStreak(stats.submissionCalendarJson);
  const longestStreak = Math.max(stats.longestStreak, currentStreak);

  // Update longest streak if current is higher
  if (longestStreak > stats.longestStreak) {
    await db.codingStatistics.update({
      where: { id: stats.id },
      data: { longestStreak },
    });
  }

  const vars: RuleVariables = {
    total_solved: stats.totalSolved,
    easy_solved: stats.easySolved,
    medium_solved: stats.mediumSolved,
    hard_solved: stats.hardSolved,
    contest_rating: stats.contestRating ?? 0,
    contests_attended: stats.contestsAttended,
    current_streak: currentStreak,
    longest_streak: longestStreak,
  };

  // 2. Fetch all published achievements and user's existing records
  const [publishedAchievements, existingUserAchievements] = await Promise.all([
    db.achievement.findMany({ where: { status: "PUBLISHED" } }),
    db.userAchievement.findMany({ where: { userId } }),
  ]);

  const existingMap = new Map(
    existingUserAchievements
      .filter((ua) => ua.achievementId !== null)
      .map((ua) => [ua.achievementId!, ua])
  );

  let newlyAwarded = 0;
  let reAwarded = 0;
  let revoked = 0;

  for (const ach of publishedAchievements) {
    const isMet = evaluateCondition(ach.conditionExpression, vars);
    const existing = existingMap.get(ach.id);

    if (isMet) {
      if (!existing) {
        // Award new achievement (FR-329)
        await db.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
            name: ach.name,
            description: ach.description,
            iconKey: ach.iconKey,
            category: ach.category,
            unlockedAt: new Date(),
            isRevoked: false,
          },
        });
        newlyAwarded++;
      } else if (existing.isRevoked) {
        // Re-award previously revoked achievement (FR-336)
        await db.userAchievement.update({
          where: { id: existing.id },
          data: {
            isRevoked: false,
            revokedAt: null,
            unlockedAt: new Date(),
          },
        });
        reAwarded++;
      }
      // If already awarded and not revoked, preserve original date (FR-330)
    } else {
      // Condition NOT met
      if (existing && !existing.isRevoked && !existing.isLegacy) {
        // Revoke due to stat decrease (FR-335)
        await db.userAchievement.update({
          where: { id: existing.id },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
          },
        });
        revoked++;
      }
    }
  }

  return { newlyAwarded, reAwarded, revoked };
}

/**
 * Clears all achievement records for a user upon LeetCode username change (FR-338).
 */
export async function clearAchievementsForUser(userId: string): Promise<void> {
  await db.userAchievement.deleteMany({
    where: { userId },
  });
}

/**
 * Returns badge list for display on public or private profile.
 * When isOwner is true, appends locked badges with requirements (FR-333, FR-334).
 */
export async function getUserBadges(
  userId: string,
  isOwner: boolean = false
): Promise<{ earned: UserBadgeDTO[]; locked?: UserBadgeDTO[] }> {
  const userAchievements = await db.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
    include: { achievement: true },
  });

  const earned: UserBadgeDTO[] = userAchievements.map((ua) => ({
    id: ua.id,
    achievementId: ua.achievementId,
    name: ua.name,
    description: ua.description,
    category: ua.category || "GENERAL",
    iconKey: ua.iconKey || "trophy",
    unlockedAt: ua.unlockedAt.toISOString(),
    isRevoked: ua.isRevoked,
    isLegacy: ua.isLegacy,
    isLocked: false,
    rarityLevel: ua.achievement?.rarityLevel || "COMMON",
    points: ua.achievement?.points || 10,
  }));

  if (!isOwner) {
    // Other visitors only see non-revoked earned achievements (FR-334)
    return { earned: earned.filter((b) => !b.isRevoked) };
  }

  // For profile owner: compute locked achievements (FR-333)
  const earnedIds = new Set(
    userAchievements
      .filter((ua) => !ua.isRevoked && ua.achievementId !== null)
      .map((ua) => ua.achievementId!)
  );

  const allPublished = await db.achievement.findMany({
    where: { status: "PUBLISHED" },
  });

  const defaultDefMap = new Map(DEFAULT_ACHIEVEMENTS.map((d) => [d.slug, d]));

  const locked: UserBadgeDTO[] = allPublished
    .filter((ach) => !earnedIds.has(ach.id))
    .map((ach) => {
      const def = defaultDefMap.get(ach.slug);
      return {
        id: ach.id,
        achievementId: ach.id,
        name: ach.name,
        description: ach.description,
        category: ach.category,
        iconKey: ach.iconKey,
        unlockedAt: "",
        isRevoked: false,
        isLegacy: false,
        isLocked: true,
        conditionText: def?.conditionText || `Requirement: ${ach.conditionExpression}`,
        rarityLevel: ach.rarityLevel,
        points: ach.points,
      };
    });

  return { earned, locked };
}