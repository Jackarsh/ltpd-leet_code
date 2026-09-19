import { db } from "@/lib/db";
import { recordAuditLog } from "./audit.service";
import { toggleUserAccountStatus } from "./admin-user.service";
import {
  validateResolutionInput,
  computeResetCodingStats,
  type ConflictResolutionAction,
} from "@/lib/duplicate-resolver";
import { AccountStatus } from "@prisma/client";

export interface DuplicateAccountInfo {
  userId: string;
  email: string;
  displayName: string;
  status: AccountStatus;
  createdAt: Date;
  lastSyncAt: Date | null;
  totalSolved: number;
  contestRating: number | null;
  hasVerifiedLink: boolean;
}

export interface DuplicateConflictGroup {
  leetcodeUsername: string;
  accounts: DuplicateAccountInfo[];
}

/**
 * Scans for duplicate LeetCode handle claims and contested accounts (FR-605).
 */
export async function findDuplicateConflicts(): Promise<DuplicateConflictGroup[]> {
  // 1. Find all profiles with non-empty leetcodeUsername
  const allProfiles = await db.userProfile.findMany({
    where: {
      leetcodeUsername: {
        not: "",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          codingAccounts: {
            where: { platform: "LEETCODE" },
            include: { statistics: true },
          },
        },
      },
    },
  });

  // Group by lowercased handle
  const handleMap = new Map<string, typeof allProfiles>();

  for (const p of allProfiles) {
    const handle = p.leetcodeUsername.trim().toLowerCase();
    if (!handle) continue;
    const list = handleMap.get(handle) ?? [];
    list.push(p);
    handleMap.set(handle, list);
  }

  // Also check LinkedCodingAccount records where username might be claimed by multiple
  const linkedAccounts = await db.linkedCodingAccount.findMany({
    where: { platform: "LEETCODE" },
    include: {
      statistics: true,
      user: {
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
          profile: true,
        },
      },
    },
  });

  for (const la of linkedAccounts) {
    const handle = la.username.trim().toLowerCase();
    if (!handle) continue;
    const existingGroup = handleMap.get(handle) ?? [];
    const alreadyPresent = existingGroup.some((p) => p.userId === la.userId);
    if (!alreadyPresent && la.user.profile) {
      existingGroup.push({
        ...la.user.profile,
        user: {
          id: la.user.id,
          email: la.user.email,
          status: la.user.status,
          createdAt: la.user.createdAt,
          codingAccounts: [la],
        },
      });
      handleMap.set(handle, existingGroup);
    }
  }

  const conflicts: DuplicateConflictGroup[] = [];

  for (const [handle, profiles] of handleMap.entries()) {
    if (profiles.length > 1) {
      conflicts.push({
        leetcodeUsername: handle,
        accounts: profiles.map((p) => {
          const codingAcc = p.user.codingAccounts[0];
          const stats = codingAcc?.statistics;

          return {
            userId: p.userId,
            email: p.user.email,
            displayName: p.displayName,
            status: p.user.status,
            createdAt: p.user.createdAt,
            lastSyncAt: codingAcc?.lastSyncAt ?? null,
            totalSolved: stats?.totalSolved ?? 0,
            contestRating: stats?.contestRating ? Math.round(stats.contestRating) : null,
            hasVerifiedLink: codingAcc?.isVerified ?? false,
          };
        }),
      });
    }
  }

  return conflicts;
}

/**
 * Resolves a contested handle conflict (FR-606).
 * Unlinks the handle, clears synced metrics to 0, and retains the account in "Pending LeetCode Link" state,
 * OR disables the duplicate profile with a mandatory resolution note.
 */
export async function resolveConflict(
  adminUserId: string,
  targetUserId: string,
  action: ConflictResolutionAction,
  resolutionNote: string,
  context?: { ipAddress?: string; userAgent?: string }
) {
  const validated = validateResolutionInput({
    targetUserId,
    action,
    resolutionNote,
  });

  const profile = await db.userProfile.findUnique({
    where: { userId: validated.targetUserId },
    include: {
      user: {
        include: {
          codingAccounts: {
            where: { platform: "LEETCODE" },
            include: { statistics: true },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Target user profile not found.");
  }

  const codingAccount = profile.user.codingAccounts[0];
  const beforeState = {
    userId: profile.userId,
    email: profile.user.email,
    leetcodeUsername: profile.leetcodeUsername,
    status: profile.user.status,
    totalSolved: codingAccount?.statistics?.totalSolved ?? 0,
  };

  if (validated.action === "UNLINK") {
    // 1. Reset user profile to empty handle and 0 score
    await db.$transaction(async (tx) => {
      await tx.userProfile.update({
        where: { userId: validated.targetUserId },
        data: {
          leetcodeUsername: "",
          collegeRank: null,
          weightedScore: 0,
        },
      });

      // 2. Delete or reset linked coding account
      if (codingAccount) {
        if (codingAccount.statistics) {
          const resetStats = computeResetCodingStats();
          await tx.codingStatistics.update({
            where: { id: codingAccount.statistics.id },
            data: resetStats,
          });
        }
        await tx.linkedCodingAccount.delete({
          where: { id: codingAccount.id },
        });
      }
    });

    const afterState = {
      action: "UNLINK",
      statusNotice: "Pending LeetCode Link",
      leetcodeUsername: "",
      totalSolved: 0,
      resolutionNote: validated.resolutionNote,
    };

    await recordAuditLog({
      adminUserId,
      actionType: "DUPLICATE_RESOLVE",
      targetType: "USER",
      targetId: validated.targetUserId,
      beforeState,
      afterState,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return { success: true, action: "UNLINK", targetUserId: validated.targetUserId };
  }

  if (validated.action === "DISABLE") {
    // 1. Disable account and revoke sessions
    await toggleUserAccountStatus(
      adminUserId,
      validated.targetUserId,
      AccountStatus.DISABLED,
      validated.resolutionNote,
      context
    );

    // 2. Clear contested handle so rightful owner can use it
    await db.userProfile.update({
      where: { userId: validated.targetUserId },
      data: {
        leetcodeUsername: "",
        collegeRank: null,
        weightedScore: 0,
      },
    });

    if (codingAccount) {
      await db.linkedCodingAccount.delete({
        where: { id: codingAccount.id },
      });
    }

    const afterState = {
      action: "DISABLE",
      status: "DISABLED",
      leetcodeUsername: "",
      resolutionNote: validated.resolutionNote,
    };

    await recordAuditLog({
      adminUserId,
      actionType: "DUPLICATE_RESOLVE",
      targetType: "USER",
      targetId: validated.targetUserId,
      beforeState,
      afterState,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    });

    return { success: true, action: "DISABLE", targetUserId: validated.targetUserId };
  }

  throw new Error("Unsupported resolution action.");
}
