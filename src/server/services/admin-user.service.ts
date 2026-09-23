import { db } from "@/lib/db";
import { recordAuditLog } from "./audit.service";
import { assertWillNotCauseLockout } from "@/server/auth/rbac";
import { sanitizeUserMetadataInput } from "@/lib/admin-user-validator";
import { calculateCurrentStreak } from "@/lib/activity-utils";
import { AccountStatus, Role, Prisma } from "@prisma/client";
import type {
  AdminUserListItemDTO,
  AdminUserQueryFilter,
} from "@/types/admin";

export { sanitizeUserMetadataInput };

/**
 * Lists and filters registered users with full profile, stats, and sync metadata (FR-601).
 */
export async function listUsersForAdmin(
  filter: AdminUserQueryFilter = {}
): Promise<{ users: AdminUserListItemDTO[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.UserWhereInput = {
    ...(filter.status && { status: filter.status }),
    ...(filter.role && { role: filter.role }),
    ...(filter.gender && { profile: { gender: filter.gender } }),
    ...(filter.branch && { profile: { branch: filter.branch } }),
    ...(filter.batch && { profile: { admissionYear: filter.batch } }),
    ...(filter.search && {
      OR: [
        { email: { contains: filter.search, mode: "insensitive" } },
        { profile: { displayName: { contains: filter.search, mode: "insensitive" } } },
        { profile: { leetcodeUsername: { contains: filter.search, mode: "insensitive" } } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        codingAccounts: {
          where: { platform: "LEETCODE" },
          include: { statistics: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const items: AdminUserListItemDTO[] = users.map((u) => {
    const leetcodeAcc = u.codingAccounts[0];
    const stats = leetcodeAcc?.statistics;

    return {
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      displayName: u.profile?.displayName ?? u.email,
      gender: u.profile?.gender ?? null,
      branch: u.profile?.branch ?? null,
      admissionYear: u.profile?.admissionYear ?? null,
      graduationYear: u.profile?.graduationYear ?? null,
      leetcodeUsername: u.profile?.leetcodeUsername ?? leetcodeAcc?.username ?? null,
      totalSolved: stats?.totalSolved ?? 0,
      contestRating: stats?.contestRating ? Math.round(stats.contestRating) : null,
      currentStreak: stats?.submissionCalendarJson ? calculateCurrentStreak(stats.submissionCalendarJson) : 0,
      lastSyncAt: leetcodeAcc?.lastSyncAt ?? null,
      syncStatus: leetcodeAcc?.syncStatus ?? null,
      createdAt: u.createdAt,
    };
  });

  return {
    users: items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Updates a user's editable profile metadata and writes an audit log record (FR-602, FR-622).
 */
export async function updateUserMetadata(
  adminUserId: string,
  targetUserId: string,
  rawInput: Record<string, unknown>,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const sanitized = sanitizeUserMetadataInput(rawInput);

  const existingProfile = await db.userProfile.findUnique({
    where: { userId: targetUserId },
  });

  if (!existingProfile) {
    throw new Error("Student profile not found.");
  }

  const beforeState: Record<string, unknown> = {
    displayName: existingProfile.displayName,
    gender: existingProfile.gender,
    branch: existingProfile.branch,
    admissionYear: existingProfile.admissionYear,
    graduationYear: existingProfile.graduationYear,
  };

  const updatedProfile = await db.userProfile.update({
    where: { userId: targetUserId },
    data: {
      ...(sanitized.displayName && { displayName: sanitized.displayName }),
      ...(sanitized.gender && { gender: sanitized.gender }),
      ...(sanitized.branch !== undefined && { branch: sanitized.branch }),
      ...(sanitized.admissionYear !== undefined && { admissionYear: sanitized.admissionYear }),
      ...(sanitized.graduationYear !== undefined && { graduationYear: sanitized.graduationYear }),
    },
  });

  const afterState: Record<string, unknown> = {
    displayName: updatedProfile.displayName,
    gender: updatedProfile.gender,
    branch: updatedProfile.branch,
    admissionYear: updatedProfile.admissionYear,
    graduationYear: updatedProfile.graduationYear,
  };

  await recordAuditLog({
    adminUserId,
    actionType: "USER_UPDATE",
    targetType: "USER",
    targetId: targetUserId,
    beforeState,
    afterState,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return updatedProfile;
}

/**
 * Modifies an account's status (ACTIVE <-> DISABLED) (FR-604, SC-607).
 * Prevents deactivating the final Super Admin (FR-620).
 * Revokes active sessions on disable.
 */
export async function toggleUserAccountStatus(
  adminUserId: string,
  targetUserId: string,
  newStatus: AccountStatus,
  reason?: string,
  context?: { ipAddress?: string; userAgent?: string }
) {
  if (newStatus === AccountStatus.DISABLED) {
    await assertWillNotCauseLockout(targetUserId);
  }

  const existingUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, status: true, email: true },
  });

  if (!existingUser) {
    throw new Error("User account not found.");
  }

  if (existingUser.status === newStatus) {
    return existingUser;
  }

  const beforeState = { status: existingUser.status };

  const updated = await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: targetUserId },
      data: { status: newStatus },
    });

    // If disabled, immediately revoke sessions (terminate active logins)
    if (newStatus === AccountStatus.DISABLED) {
      await tx.session.deleteMany({
        where: { userId: targetUserId },
      });
    }

    return user;
  });

  const afterState = { status: updated.status, reason: reason ?? null };

  await recordAuditLog({
    adminUserId,
    actionType: "USER_STATUS_CHANGE",
    targetType: "USER",
    targetId: targetUserId,
    beforeState,
    afterState,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return updated;
}

/**
 * Permanently deletes a user account and writes an audit log record.
 * Prevents deleting the final Super Admin.
 */
export async function deleteUserAsAdmin(
  adminUserId: string,
  targetUserId: string,
  context?: { ipAddress?: string; userAgent?: string }
) {
  await assertWillNotCauseLockout(targetUserId);

  const existingUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true },
  });

  if (!existingUser) {
    throw new Error("User account not found.");
  }

  const beforeState = { id: existingUser.id, email: existingUser.email };

  await db.user.delete({
    where: { id: targetUserId },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "USER_DELETE",
    targetType: "USER",
    targetId: targetUserId,
    beforeState,
    afterState: null,
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
  });

  return { success: true };
}
