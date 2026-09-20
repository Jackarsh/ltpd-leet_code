import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, AccountStatus } from "@prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Insufficient administrative privileges.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class LockoutProtectionError extends Error {
  constructor(message = "Operation rejected: Platform must retain at least one active Super Administrator.") {
    super(message);
    this.name = "LockoutProtectionError";
  }
}

/**
 * Returns the current authenticated session user and ensures role is authorized.
 */
export async function assertAdmin(allowedRoles: Role[] = [Role.PLATFORM_ADMIN, Role.SUPER_ADMIN]) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, status: true, profile: { select: { displayName: true } } },
  });

  if (!user || user.status !== AccountStatus.ACTIVE) {
    throw new UnauthorizedError("Account is inactive or not found.");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(`Access denied: User role "${user.role}" is not authorized.`);
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    displayName: user.profile?.displayName ?? user.email,
  };
}

/**
 * Ensures the authenticated user is a SUPER_ADMIN.
 */
export async function assertSuperAdmin() {
  return assertAdmin([Role.SUPER_ADMIN]);
}

/**
 * Protects against zero active Super Administrator lockout (FR-620 / SC-604).
 * If targetUserId is currently an active SUPER_ADMIN and is being demoted, disabled, or removed,
 * verifies that at least one other active SUPER_ADMIN exists.
 */
export async function assertWillNotCauseLockout(targetUserId: string) {
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, status: true },
  });

  if (!target || target.role !== Role.SUPER_ADMIN || target.status !== AccountStatus.ACTIVE) {
    return; // Not an active super admin, will not cause super admin depletion
  }

  const activeSuperAdminCount = await db.user.count({
    where: {
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
    },
  });

  if (activeSuperAdminCount <= 1) {
    throw new LockoutProtectionError();
  }
}
