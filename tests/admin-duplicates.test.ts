import test from "node:test";
import assert from "node:assert/strict";
import {
  validateResolutionInput,
  computeUnlinkedProfileState,
  computeResetCodingStats,
} from "../src/lib/duplicate-resolver.ts";

test("Duplicate Resolution — Input validation requires mandatory note (FR-606)", () => {
  // Missing note
  assert.throws(
    () =>
      validateResolutionInput({
        action: "UNLINK",
        targetUserId: "user-123",
      }),
    /resolution note/i
  );

  // Note too short
  assert.throws(
    () =>
      validateResolutionInput({
        action: "UNLINK",
        targetUserId: "user-123",
        resolutionNote: "ok",
      }),
    /at least 5 characters/i
  );

  // Missing targetUserId
  assert.throws(
    () =>
      validateResolutionInput({
        action: "UNLINK",
        targetUserId: "",
        resolutionNote: "Resolved duplicate claim.",
      }),
    /Target user ID is required/i
  );

  // Valid resolution input
  const valid = validateResolutionInput({
    action: "UNLINK",
    targetUserId: "user-123",
    resolutionNote: "Verified student proved ownership via email challenge.",
  });
  assert.equal(valid.action, "UNLINK");
  assert.equal(valid.targetUserId, "user-123");
  assert.equal(valid.resolutionNote, "Verified student proved ownership via email challenge.");
});

test("Duplicate Resolution — Unlinked Profile State Transition (US2 / Acceptance 3)", () => {
  const unlinkedState = computeUnlinkedProfileState("contested_user");
  assert.equal(unlinkedState.leetcodeUsername, "");
  assert.equal(unlinkedState.statusNotice, "Pending LeetCode Link");
  assert.equal(unlinkedState.weightedScore, 0);
  assert.equal(unlinkedState.collegeRank, null);
  assert.equal(unlinkedState.previousUsername, "contested_user");
});

test("Duplicate Resolution — Statistics Reset to Zero (FR-606)", () => {
  const stats = computeResetCodingStats();
  assert.equal(stats.totalSolved, 0);
  assert.equal(stats.easySolved, 0);
  assert.equal(stats.mediumSolved, 0);
  assert.equal(stats.hardSolved, 0);
  assert.equal(stats.contestRating, null);
  assert.equal(stats.longestStreak, 0);
  assert.equal(stats.submissionCalendarJson, null);
});
