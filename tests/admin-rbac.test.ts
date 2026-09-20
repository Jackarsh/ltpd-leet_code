import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateLockoutRisk,
  canManageRoles,
  validateRoleTransition,
} from "../src/lib/rbac-rules.ts";
import type { UserAccessInfo } from "../src/lib/rbac-rules.ts";

test("Lockout Prevention — Blocks demoting or disabling the last active Super Admin (FR-620 / SC-604)", () => {
  const lastSuperAdmin: UserAccessInfo = {
    id: "admin-1",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  };

  // Case 1: Demoting the ONLY active Super Admin to PLATFORM_ADMIN
  const demoteCheck = evaluateLockoutRisk(lastSuperAdmin, 1, "PLATFORM_ADMIN");
  assert.equal(demoteCheck.causesLockout, true);
  assert.match(demoteCheck.error || "", /Platform must retain at least one active Super Administrator/);

  // Case 2: Demoting the ONLY active Super Admin to STUDENT
  const studentCheck = evaluateLockoutRisk(lastSuperAdmin, 1, "STUDENT");
  assert.equal(studentCheck.causesLockout, true);

  // Case 3: Disabling the ONLY active Super Admin
  const disableCheck = evaluateLockoutRisk(lastSuperAdmin, 1, undefined, "DISABLED");
  assert.equal(disableCheck.causesLockout, true);

  // Case 4: Keeping role as SUPER_ADMIN and status as ACTIVE does NOT cause lockout
  const retainCheck = evaluateLockoutRisk(lastSuperAdmin, 1, "SUPER_ADMIN", "ACTIVE");
  assert.equal(retainCheck.causesLockout, false);
});

test("Lockout Prevention — Allows demotion when multiple active Super Admins exist (SC-604)", () => {
  const oneOfMultipleSuperAdmins: UserAccessInfo = {
    id: "admin-1",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
  };

  // 2 active super admins exist -> Safe to demote one
  const safeDemote = evaluateLockoutRisk(oneOfMultipleSuperAdmins, 2, "PLATFORM_ADMIN");
  assert.equal(safeDemote.causesLockout, false);

  // Safe to disable one
  const safeDisable = evaluateLockoutRisk(oneOfMultipleSuperAdmins, 2, undefined, "DISABLED");
  assert.equal(safeDisable.causesLockout, false);
});

test("Lockout Prevention — Non-Super Admin role changes never trigger lockout", () => {
  const platformAdmin: UserAccessInfo = {
    id: "admin-2",
    role: "PLATFORM_ADMIN",
    status: "ACTIVE",
  };

  const student: UserAccessInfo = {
    id: "student-1",
    role: "STUDENT",
    status: "ACTIVE",
  };

  assert.equal(evaluateLockoutRisk(platformAdmin, 1, "STUDENT").causesLockout, false);
  assert.equal(evaluateLockoutRisk(student, 1, "PLATFORM_ADMIN").causesLockout, false);
});

test("RBAC Privilege Defense — Only active Super Admin can manage administrative roles (SC-609)", () => {
  assert.equal(
    canManageRoles({ id: "1", role: "SUPER_ADMIN", status: "ACTIVE" }),
    true
  );

  assert.equal(
    canManageRoles({ id: "2", role: "PLATFORM_ADMIN", status: "ACTIVE" }),
    false
  );

  assert.equal(
    canManageRoles({ id: "3", role: "STUDENT", status: "ACTIVE" }),
    false
  );

  // Disabled super admin cannot manage roles
  assert.equal(
    canManageRoles({ id: "4", role: "SUPER_ADMIN", status: "DISABLED" }),
    false
  );
});

test("Role Transition Validator — Enforces strict role whitelist (FR-617)", () => {
  assert.equal(validateRoleTransition("STUDENT").isValid, true);
  assert.equal(validateRoleTransition("PLATFORM_ADMIN").isValid, true);
  assert.equal(validateRoleTransition("SUPER_ADMIN").isValid, true);
  assert.equal(validateRoleTransition("platform_admin").isValid, true);

  const badAttempt = validateRoleTransition("ROOT");
  assert.equal(badAttempt.isValid, false);
  assert.match(badAttempt.error || "", /Invalid role/);

  assert.equal(validateRoleTransition("").isValid, false);
  assert.equal(validateRoleTransition("ADMIN").isValid, false);
});
