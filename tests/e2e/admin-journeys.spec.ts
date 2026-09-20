import test from "node:test";
import assert from "node:assert/strict";

import {
  sanitizeUserMetadataInput,
} from "../../src/lib/admin-user-validator.ts";
import {
  validateResolutionInput,
  computeUnlinkedProfileState,
  computeResetCodingStats,
} from "../../src/lib/duplicate-resolver.ts";
import {
  validateAchievementInput,
  validateAchievementCondition,
} from "../../src/lib/achievement-validator.ts";
import {
  SyncCircuitBreaker,
  categorizeSyncError,
  validateBatchConfirmation,
} from "../../src/lib/sync-circuit-breaker.ts";
import {
  evaluateLockoutRisk,
  canManageRoles,
} from "../../src/lib/rbac-rules.ts";
import {
  validateDateSequence,
} from "../../src/lib/calendar-validator.ts";
import {
  computeStateDiff,
} from "../../src/lib/audit-diff.ts";

/**
 * End-to-End Administrative Journeys Validation Suite (T051)
 *
 * Verifies all 7 core admin journeys across R7 specifications:
 * 1. User Account Moderation & Read-Only Stats Protection
 * 2. Duplicate Account Unlinking & Resolution
 * 3. Achievement Studio Authoring & Legacy Preservation
 * 4. Sync Health, Circuit Breaker, & Batch Step-Up
 * 5. Role Governance & Last Super Admin Lockout Defense
 * 6. Academic Calendar & Department Branch Configuration
 * 7. Immutable Audit Trail & Structured State Diffs
 */

test("E2E Journey 1: User Account Lifecycle & Read-Only Statistics Guard (FR-601, FR-602)", () => {
  // Step 1: Admin edits student profile metadata
  const validEdit = sanitizeUserMetadataInput({
    admissionYear: 2023,
    graduationYear: 2027,
    branch: "CSE",
  });
  assert.equal(validEdit.admissionYear, 2023);
  assert.equal(validEdit.graduationYear, 2027);
  assert.equal(validEdit.branch, "CSE");

  // Step 2: Malicious attempt to forge or tamper with LeetCode stats via admin form
  assert.throws(
    () =>
      sanitizeUserMetadataInput({
        totalSolved: 9999,
        hardSolved: 500,
        contestRating: 3200,
      }),
    /strictly prohibited/i,
    "Must reject any payload attempting to manually edit coding statistics"
  );

  // Step 3: Admin edits profile display name and gender
  const profileEdit = sanitizeUserMetadataInput({
    displayName: "Jane Doe",
    gender: "FEMALE",
  });
  assert.equal(profileEdit.displayName, "Jane Doe");
  assert.equal(profileEdit.gender, "FEMALE");
});

test("E2E Journey 2: Contested Username Duplicate Conflict Resolution (FR-606, FR-607)", () => {
  // Step 1: Attempt resolution with missing note or invalid parameters
  assert.throws(
    () =>
      validateResolutionInput({
        action: "UNLINK",
        targetUserId: "user-conflict-101",
      }),
    /resolution note/i
  );

  // Step 2: Perform valid UNLINK action
  const validUnlink = validateResolutionInput({
    action: "UNLINK",
    targetUserId: "user-conflict-101",
    resolutionNote: "Student verified ownership via institutional email challenge",
  });
  assert.equal(validUnlink.action, "UNLINK");
  assert.equal(validUnlink.targetUserId, "user-conflict-101");

  // Step 3: Verify unlinked profile reset state
  const unlinkedState = computeUnlinkedProfileState("contested_alice");
  assert.equal(unlinkedState.leetcodeUsername, "");
  assert.equal(unlinkedState.weightedScore, 0);
  assert.equal(unlinkedState.collegeRank, null);

  // Step 4: Verify coding statistics reset
  const resetStats = computeResetCodingStats();
  assert.equal(resetStats.totalSolved, 0);
  assert.equal(resetStats.contestRating, null);
});

test("E2E Journey 3: Dynamic Achievement Studio & Legacy Grandfathering (FR-610, FR-612)", () => {
  // Step 1: Lint condition expression with syntax error
  const malformedExpression = validateAchievementCondition("total_solved >= && hard_solved > 10");
  assert.equal(malformedExpression.isValid, false);
  assert.ok(malformedExpression.error?.length ?? 0 > 0);

  // Step 2: Lint condition expression with unauthorized variable
  const unauthorizedVar = validateAchievementCondition("userPasswordHash == 1 && hard_solved > 10");
  assert.equal(unauthorizedVar.isValid, false);
  assert.match(unauthorizedVar.error || "", /Disallowed variable/);

  // Step 3: Valid condition expression passes
  const validExpression = validateAchievementCondition("total_solved >= 100 && hard_solved >= 20");
  assert.equal(validExpression.isValid, true);
  assert.equal(validExpression.variables.length, 2);

  // Step 4: Full achievement creation payload validation
  const validAchievement = validateAchievementInput({
    name: "Centurion Coder",
    description: "Solved 100 problems with 20 hard on LeetCode platform",
    category: "MILESTONE",
    iconKey: "trophy",
    rarityLevel: "EPIC",
    points: 50,
    status: "PUBLISHED",
    conditionExpression: "total_solved >= 100 && hard_solved >= 20",
  });
  assert.equal(validAchievement.isValid, true);
  assert.equal(validAchievement.sanitized?.name, "Centurion Coder");

  // Step 5: Verify grandfathering diff calculation when criteria changes
  const beforeAchievement = {
    name: "Centurion Coder",
    points: 50,
    conditionExpression: "total_solved >= 100 && hard_solved >= 20",
  };
  const afterAchievement = {
    name: "Centurion Coder",
    points: 75,
    conditionExpression: "total_solved >= 150 && hard_solved >= 30",
  };
  const achievementDiff = computeStateDiff(beforeAchievement, afterAchievement);
  assert.equal(achievementDiff.hasChanges, true);
  assert.equal(achievementDiff.diffs.filter((d) => d.type === "MODIFIED").length, 2); // points & conditionExpression
});

test("E2E Journey 4: Sync Pipeline, Circuit Breaker & Batch Step-Up (FR-615, FR-616, FR-617)", () => {
  const breaker = new SyncCircuitBreaker({
    failureThreshold: 3,
    cooldownMs: 1000,
  });

  assert.equal(breaker.getState(), "CLOSED");
  assert.equal(breaker.canExecute().allowed, true);

  // Step 1: Record 3 rate-limit failures to trigger trip
  breaker.recordResult(false, "429 Too Many Requests");
  breaker.recordResult(false, "Rate limit reached");
  breaker.recordResult(false, "Throttled by LeetCode API");

  assert.equal(breaker.getState(), "OPEN");
  assert.equal(breaker.canExecute().allowed, false);

  // Step 2: Rate limit classification
  const category = categorizeSyncError("429 Too Many Requests: Rate limit exceeded");
  assert.equal(category, "RATE_LIMITED");

  // Step 3: Batch step-up authorization requirement
  assert.equal(validateBatchConfirmation("CONFIRM"), true);
  assert.equal(validateBatchConfirmation("yes"), false);
  assert.equal(validateBatchConfirmation(""), false);
  assert.equal(validateBatchConfirmation(null), false);
});

test("E2E Journey 5: Super Administrator RBAC & Lockout Safeguard (FR-619, FR-620, SC-604)", () => {
  // Step 1: Verify role capability boundaries
  const superAdminUser = { id: "sa-1", role: "SUPER_ADMIN" as const, status: "ACTIVE" as const };
  const platformAdminUser = { id: "pa-1", role: "PLATFORM_ADMIN" as const, status: "ACTIVE" as const };
  const studentUser = { id: "st-1", role: "STUDENT" as const, status: "ACTIVE" as const };

  assert.equal(canManageRoles(superAdminUser), true);
  assert.equal(canManageRoles(platformAdminUser), false);
  assert.equal(canManageRoles(studentUser), false);

  // Step 2: Sole Super Admin demotion/disable prevention
  const lastSuperAdmin = {
    id: "admin-root",
    role: "SUPER_ADMIN" as const,
    status: "ACTIVE" as const,
  };

  const demoteAttempt = evaluateLockoutRisk(lastSuperAdmin, 1, "PLATFORM_ADMIN");
  assert.equal(demoteAttempt.causesLockout, true);
  assert.match(demoteAttempt.error || "", /at least one active Super Administrator/);

  const disableAttempt = evaluateLockoutRisk(lastSuperAdmin, 1, undefined, "DISABLED");
  assert.equal(disableAttempt.causesLockout, true);

  // Step 3: Multiple Super Admins permit safe demotion
  const safeDemote = evaluateLockoutRisk(lastSuperAdmin, 2, "PLATFORM_ADMIN");
  assert.equal(safeDemote.causesLockout, false);
});

test("E2E Journey 6: Academic Calendar & Department Branch Configuration (FR-621, FR-622)", () => {
  // Step 1: Validate date ordering
  const invalidDates = validateDateSequence("2026-06-01", "2026-01-01");
  assert.equal(invalidDates.isValid, false);
  assert.match(invalidDates.error || "", /strictly before end date/);

  const equalDates = validateDateSequence("2026-05-15", "2026-05-15");
  assert.equal(equalDates.isValid, false);

  const validDates = validateDateSequence("2026-01-15", "2026-05-30");
  assert.equal(validDates.isValid, true);

  // Step 2: Branch status management
  const activeBranch = { id: "branch-cse", code: "CSE", name: "Computer Science", isActive: true };
  const archivedBranch = { ...activeBranch, isActive: false };
  const branchDiff = computeStateDiff(activeBranch, archivedBranch);
  assert.equal(branchDiff.hasChanges, true);
  const activeFieldDiff = branchDiff.diffs.find((d) => d.field === "isActive");
  assert.ok(activeFieldDiff);
  assert.equal(activeFieldDiff.before, true);
  assert.equal(activeFieldDiff.after, false);
  assert.equal(activeFieldDiff.type, "MODIFIED");
});

test("E2E Journey 7: Immutable Audit Explorer & Differential Logging (FR-623, SC-602)", () => {
  const beforeState = {
    id: "user-42",
    status: "ACTIVE",
    role: "STUDENT",
    graduationYear: 2026,
    tags: ["contestant"],
  };

  const afterState = {
    id: "user-42",
    status: "DISABLED",
    role: "STUDENT",
    graduationYear: 2027,
    notes: "Account suspended due to policy violation",
  };

  const diff = computeStateDiff(beforeState, afterState);
  assert.equal(diff.hasChanges, true);

  // Status and graduationYear modified
  assert.ok(diff.diffs.some((d) => d.field === "status" && d.type === "MODIFIED" && d.before === "ACTIVE" && d.after === "DISABLED"));
  assert.ok(diff.diffs.some((d) => d.field === "graduationYear" && d.type === "MODIFIED" && d.before === 2026 && d.after === 2027));

  // Notes added
  assert.ok(diff.diffs.some((d) => d.field === "notes" && d.type === "ADDED"));

  // Tags removed
  assert.ok(diff.diffs.some((d) => d.field === "tags" && d.type === "REMOVED"));

  // Unchanged fields
  assert.ok(diff.diffs.some((d) => d.field === "id" && d.type === "UNCHANGED"));
  assert.ok(diff.diffs.some((d) => d.field === "role" && d.type === "UNCHANGED"));
});
