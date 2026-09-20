/**
 * RBAC Rules & Lockout Defense Logic (FR-617, FR-620, SC-604, SC-609)
 *
 * Core business rules for administrative role hierarchies, lockout prevention,
 * and privilege escalation defenses.
 */

export type UserRole = "STUDENT" | "PLATFORM_ADMIN" | "SUPER_ADMIN";
export type AccountStatus = "ACTIVE" | "DISABLED" | "PENDING_VERIFICATION";

export interface UserAccessInfo {
  id: string;
  role: UserRole;
  status: AccountStatus;
}

export const VALID_ROLES: UserRole[] = ["STUDENT", "PLATFORM_ADMIN", "SUPER_ADMIN"];

/**
 * Checks whether an administrative action would cause a total Super Admin lockout (SC-604).
 * If the target user is currently an active SUPER_ADMIN and is transitioning to
 * a non-SUPER_ADMIN role or a non-ACTIVE status, at least one other active SUPER_ADMIN must remain.
 */
export function evaluateLockoutRisk(
  targetUser: UserAccessInfo,
  activeSuperAdminCount: number,
  newRole?: UserRole,
  newStatus?: AccountStatus
): { causesLockout: boolean; error?: string } {
  const isCurrentlyActiveSuperAdmin =
    targetUser.role === "SUPER_ADMIN" && targetUser.status === "ACTIVE";

  if (!isCurrentlyActiveSuperAdmin) {
    return { causesLockout: false };
  }

  const roleWillChange = newRole !== undefined && newRole !== "SUPER_ADMIN";
  const statusWillDeactivate = newStatus !== undefined && newStatus !== "ACTIVE";

  if (roleWillChange || statusWillDeactivate) {
    if (activeSuperAdminCount <= 1) {
      return {
        causesLockout: true,
        error: "Operation rejected: Platform must retain at least one active Super Administrator.",
      };
    }
  }

  return { causesLockout: false };
}

/**
 * Checks whether an admin is authorized to modify administrative roles (SC-609).
 * Only active SUPER_ADMIN can grant or revoke administrative roles.
 */
export function canManageRoles(actor: UserAccessInfo): boolean {
  return actor.status === "ACTIVE" && actor.role === "SUPER_ADMIN";
}

/**
 * Validates a target role transition.
 */
export function validateRoleTransition(role: string): { isValid: boolean; role?: UserRole; error?: string } {
  const upper = (role || "").trim().toUpperCase() as UserRole;
  if (!VALID_ROLES.includes(upper)) {
    return {
      isValid: false,
      error: `Invalid role "${role}". Permitted roles: ${VALID_ROLES.join(", ")}`,
    };
  }
  return { isValid: true, role: upper };
}
