import test from "node:test";
import assert from "node:assert/strict";
import {
  computeStateDiff,
  formatDiffValue,
} from "../src/lib/audit-diff.ts";

test("Audit State Diff — Detects modified fields between before and after states (SC-602)", () => {
  const before = {
    displayName: "Alice",
    role: "STUDENT",
    status: "ACTIVE",
  };

  const after = {
    displayName: "Alice Smith",
    role: "PLATFORM_ADMIN",
    status: "ACTIVE",
  };

  const result = computeStateDiff(before, after);

  assert.equal(result.hasChanges, true);
  assert.equal(result.totalChanges, 2);

  const roleDiff = result.diffs.find((d) => d.field === "role");
  assert.ok(roleDiff);
  assert.equal(roleDiff.type, "MODIFIED");
  assert.equal(roleDiff.before, "STUDENT");
  assert.equal(roleDiff.after, "PLATFORM_ADMIN");

  const nameDiff = result.diffs.find((d) => d.field === "displayName");
  assert.ok(nameDiff);
  assert.equal(nameDiff.type, "MODIFIED");

  const statusDiff = result.diffs.find((d) => d.field === "status");
  assert.ok(statusDiff);
  assert.equal(statusDiff.type, "UNCHANGED");
});

test("Audit State Diff — Handles new field additions (e.g. Creation mutations)", () => {
  const before = null;
  const after = {
    name: "Century Solver",
    points: 50,
    rarity: "RARE",
  };

  const result = computeStateDiff(before, after);
  assert.equal(result.hasChanges, true);
  assert.equal(result.totalChanges, 3);

  for (const diff of result.diffs) {
    assert.equal(diff.type, "ADDED");
    assert.equal(diff.before, null);
    assert.ok(diff.after !== null);
  }
});

test("Audit State Diff — Handles field removals (e.g. Unlinking or Deletion)", () => {
  const before = {
    username: "contest_coder",
    verifiedAt: "2026-09-01T00:00:00.000Z",
  };
  const after = null;

  const result = computeStateDiff(before, after);
  assert.equal(result.hasChanges, true);
  assert.equal(result.totalChanges, 2);

  for (const diff of result.diffs) {
    assert.equal(diff.type, "REMOVED");
    assert.ok(diff.before !== null);
    assert.equal(diff.after, null);
  }
});

test("Audit State Diff — Correctly identifies identical states without changes", () => {
  const before = { id: "123", status: "ACTIVE" };
  const after = { id: "123", status: "ACTIVE" };

  const result = computeStateDiff(before, after);
  assert.equal(result.hasChanges, false);
  assert.equal(result.totalChanges, 0);
});

test("Audit Diff Formatter — Formats values into human-readable representation", () => {
  assert.equal(formatDiffValue(null), "—");
  assert.equal(formatDiffValue(undefined), "—");
  assert.equal(formatDiffValue(true), "true");
  assert.equal(formatDiffValue(false), "false");
  assert.equal(formatDiffValue(123), "123");
  assert.equal(formatDiffValue("ACTIVE"), "ACTIVE");

  const formattedObj = formatDiffValue({ nested: "value" });
  assert.match(formattedObj, /"nested": "value"/);
});
