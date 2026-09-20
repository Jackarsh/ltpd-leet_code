import { db } from "@/lib/db";
import {
  validateAchievementInput,
  AchievementFormInput,
} from "@/lib/achievement-validator";
import { recordAuditLog } from "./audit.service";

export interface AchievementFilters {
  search?: string;
  category?: string;
  status?: string;
}

/**
 * Generates a clean URL/identifier slug from an achievement name.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetches all achievements with recipient counts and status metrics.
 */
export async function getAdminAchievements(filters: AchievementFilters = {}) {
  const whereClause: Record<string, unknown> = {};

  if (filters.status && filters.status !== "ALL") {
    whereClause.status = filters.status;
  }

  if (filters.category && filters.category !== "ALL") {
    whereClause.category = filters.category;
  }

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    whereClause.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ];
  }

  const achievements = await db.achievement.findMany({
    where: whereClause,
    orderBy: [{ status: "asc" }, { points: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { recipients: true },
      },
    },
  });

  return achievements.map((ach) => ({
    id: ach.id,
    name: ach.name,
    slug: ach.slug,
    description: ach.description,
    category: ach.category,
    iconKey: ach.iconKey,
    conditionExpression: ach.conditionExpression,
    rarityLevel: ach.rarityLevel,
    points: ach.points,
    status: ach.status,
    recipientCount: ach._count.recipients,
    createdAt: ach.createdAt.toISOString(),
    updatedAt: ach.updatedAt.toISOString(),
  }));
}

/**
 * Fetches single achievement details including recent recipients.
 */
export async function getAdminAchievementById(id: string) {
  const achievement = await db.achievement.findUnique({
    where: { id },
    include: {
      recipients: {
        take: 20,
        orderBy: { unlockedAt: "desc" },
        include: {
          user: {
            include: {
              profile: true,
              codingAccounts: true,
            },
          },
        },
      },
      _count: {
        select: { recipients: true },
      },
    },
  });

  if (!achievement) return null;

  return {
    ...achievement,
    recipientCount: achievement._count.recipients,
  };
}

/**
 * Creates a new achievement definition with input validation and audit logging.
 */
export async function createAchievement(
  adminUserId: string,
  input: Partial<AchievementFormInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const validation = validateAchievementInput(input);
  if (!validation.isValid || !validation.sanitized) {
    const errMessages = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${errMessages}`);
  }

  const sanitized = validation.sanitized;
  let baseSlug = slugify(sanitized.name);
  if (!baseSlug) baseSlug = "custom-badge";

  // Ensure unique slug
  let slug = baseSlug;
  let suffix = 1;
  while (await db.achievement.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  // Check unique name
  const existingName = await db.achievement.findUnique({ where: { name: sanitized.name } });
  if (existingName) {
    throw new Error(`An achievement with name "${sanitized.name}" already exists.`);
  }

  const achievement = await db.achievement.create({
    data: {
      name: sanitized.name,
      slug,
      description: sanitized.description,
      category: sanitized.category,
      iconKey: sanitized.iconKey,
      conditionExpression: sanitized.conditionExpression,
      rarityLevel: sanitized.rarityLevel,
      points: sanitized.points,
      status: sanitized.status,
    },
  });

  // Record immutable audit log
  await recordAuditLog({
    adminUserId,
    actionType: "ACHIEVEMENT_CREATE",
    targetType: "Achievement",
    targetId: achievement.id,
    afterState: {
      name: achievement.name,
      slug: achievement.slug,
      conditionExpression: achievement.conditionExpression,
      points: achievement.points,
      status: achievement.status,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return achievement;
}

/**
 * Updates an achievement definition with grandfathering preservation (FR-610, SC-606).
 * Existing recipients permanently retain unlocked badge when criteria is modified or archived.
 */
export async function updateAchievement(
  adminUserId: string,
  id: string,
  input: Partial<AchievementFormInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const existing = await db.achievement.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Achievement with id "${id}" not found.`);
  }

  const validation = validateAchievementInput({
    ...existing,
    ...input,
    points: input.points !== undefined ? input.points : existing.points,
    rarityLevel: (input.rarityLevel || existing.rarityLevel) as "COMMON" | "RARE" | "EPIC" | "LEGENDARY",
    status: (input.status || existing.status) as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  });

  if (!validation.isValid || !validation.sanitized) {
    const errMessages = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${errMessages}`);
  }

  const sanitized = validation.sanitized;

  // Check name uniqueness if changed
  if (sanitized.name !== existing.name) {
    const nameConflict = await db.achievement.findUnique({ where: { name: sanitized.name } });
    if (nameConflict && nameConflict.id !== id) {
      throw new Error(`An achievement with name "${sanitized.name}" already exists.`);
    }
  }

  // Grandfathering preservation (FR-610, SC-606)
  // If condition expression has changed OR if status is transitioning to ARCHIVED,
  // ensure all existing unrevoked user achievements are marked as legacy so that
  // future automatic evaluation passes will NEVER revoke their earned badges.
  const conditionChanged = sanitized.conditionExpression !== existing.conditionExpression;
  const beingArchived = sanitized.status === "ARCHIVED" && existing.status !== "ARCHIVED";

  if (conditionChanged || beingArchived) {
    await db.userAchievement.updateMany({
      where: {
        achievementId: id,
        isRevoked: false,
      },
      data: {
        isLegacy: true,
      },
    });
  }

  const updated = await db.achievement.update({
    where: { id },
    data: {
      name: sanitized.name,
      description: sanitized.description,
      category: sanitized.category,
      iconKey: sanitized.iconKey,
      conditionExpression: sanitized.conditionExpression,
      rarityLevel: sanitized.rarityLevel,
      points: sanitized.points,
      status: sanitized.status,
    },
  });

  // Record audit log
  await recordAuditLog({
    adminUserId,
    actionType: "ACHIEVEMENT_UPDATE",
    targetType: "Achievement",
    targetId: id,
    beforeState: {
      name: existing.name,
      conditionExpression: existing.conditionExpression,
      points: existing.points,
      status: existing.status,
    },
    afterState: {
      name: updated.name,
      conditionExpression: updated.conditionExpression,
      points: updated.points,
      status: updated.status,
      grandfatheredRecipients: conditionChanged || beingArchived,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return updated;
}

/**
 * Archives an achievement definition, preserving all historical recipients (FR-610).
 */
export async function archiveAchievement(
  adminUserId: string,
  id: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const existing = await db.achievement.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error(`Achievement with id "${id}" not found.`);
  }

  // Grandfather existing recipients: permanently mark as legacy
  await db.userAchievement.updateMany({
    where: {
      achievementId: id,
      isRevoked: false,
    },
    data: {
      isLegacy: true,
    },
  });

  const updated = await db.achievement.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "ACHIEVEMENT_ARCHIVE",
    targetType: "Achievement",
    targetId: id,
    beforeState: { status: existing.status },
    afterState: { status: "ARCHIVED", grandfathered: true },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return updated;
}
