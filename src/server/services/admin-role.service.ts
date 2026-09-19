import { db } from "@/lib/db";
import { Role, AccountStatus } from "@prisma/client";
import { assertSuperAdmin, assertWillNotCauseLockout } from "@/server/auth/rbac";
import { recordAuditLog } from "./audit.service";
import { validateBatchConfirmation } from "@/lib/sync-circuit-breaker";
import { validateRoleTransition } from "@/lib/rbac-rules";

export interface AdminUserRecord {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: AccountStatus;
  auditActionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGovernanceData {
  superAdminCount: number;
  platformAdminCount: number;
  totalAdminCount: number;
  admins: AdminUserRecord[];
}

/**
 * Fetches all administrative users and aggregate tier counts (FR-617).
 */
export async function getAdministrativeUsers(): Promise<AdminGovernanceData> {
  const adminUsers = await db.user.findMany({
    where: {
      role: {
        in: [Role.PLATFORM_ADMIN, Role.SUPER_ADMIN],
      },
    },
    orderBy: [{ role: "desc" }, { createdAt: "asc" }],
    include: {
      profile: {
        select: {
          displayName: true,
        },
      },
      _count: {
        select: {
          auditLogs: true,
        },
      },
    },
  });

  let superAdminCount = 0;
  let platformAdminCount = 0;

  const admins: AdminUserRecord[] = adminUsers.map((u) => {
    if (u.role === Role.SUPER_ADMIN && u.status === AccountStatus.ACTIVE) {
      superAdminCount++;
    } else if (u.role === Role.PLATFORM_ADMIN && u.status === AccountStatus.ACTIVE) {
      platformAdminCount++;
    }

    return {
      id: u.id,
      email: u.email,
      displayName: u.profile?.displayName || u.email,
      role: u.role,
      status: u.status,
      auditActionCount: u._count.auditLogs,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
  });

  return {
    superAdminCount,
    platformAdminCount,
    totalAdminCount: admins.length,
    admins,
  };
}

/**
 * Searches students eligible for promotion to administrative roles.
 */
export async function searchEligibleUsers(query: string) {
  if (!query || query.trim().length < 2) return [];

  const term = query.trim();
  const users = await db.user.findMany({
    where: {
      role: Role.STUDENT,
      status: AccountStatus.ACTIVE,
      OR: [
        { email: { contains: term, mode: "insensitive" } },
        { profile: { displayName: { contains: term, mode: "insensitive" } } },
      ],
    },
    take: 10,
    select: {
      id: true,
      email: true,
      role: true,
      profile: {
        select: {
          displayName: true,
          branch: true,
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    displayName: u.profile?.displayName || u.email,
    branch: u.profile?.branch || "Undeclared",
    role: u.role,
  }));
}

/**
 * Grants or revokes an administrative role with lockout protection and step-up confirmation (FR-617, FR-620, SC-608).
 */
export async function changeUserRole(
  actorId: string,
  targetUserId: string,
  newRoleStr: string,
  confirmationText?: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  // 1. Role transition validity check
  const roleCheck = validateRoleTransition(newRoleStr);
  if (!roleCheck.isValid || !roleCheck.role) {
    throw new Error(roleCheck.error || "Invalid role requested.");
  }
  const newRole = roleCheck.role as Role;

  // 2. Fetch target user
  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    include: { profile: true },
  });

  if (!targetUser) {
    throw new Error("Target user account not found.");
  }

  const previousRole = targetUser.role;
  if (previousRole === newRole) {
    return targetUser; // No change needed
  }

  // 3. Step-up confirmation enforcement (SC-608)
  // Changing administrative roles (granting or revoking) requires explicit "CONFIRM"
  if (!validateBatchConfirmation(confirmationText)) {
    throw new Error('Administrative role changes require explicit confirmation text: "CONFIRM"');
  }

  // 4. Lockout Prevention Guard (FR-620 / SC-604)
  // If target is currently an active SUPER_ADMIN and is being demoted, ensure at least one other active SUPER_ADMIN remains.
  if (previousRole === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) {
    await assertWillNotCauseLockout(targetUserId);
  }

  // 5. Update user role in database
  const updatedUser = await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  // 6. Record immutable audit log (FR-622)
  const isRevocation =
    (previousRole === Role.SUPER_ADMIN && newRole !== Role.SUPER_ADMIN) ||
    (previousRole === Role.PLATFORM_ADMIN && newRole === Role.STUDENT);

  const actionType = isRevocation ? "ROLE_REVOKE" : "ROLE_GRANT";

  await recordAuditLog({
    adminUserId: actorId,
    actionType,
    targetType: "User",
    targetId: targetUserId,
    beforeState: {
      email: targetUser.email,
      role: previousRole,
    },
    afterState: {
      email: updatedUser.email,
      role: newRole,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    displayName: targetUser.profile?.displayName || updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.status,
  };
}
