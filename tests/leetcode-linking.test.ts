import test from "node:test";
import assert from "node:assert/strict";
import { LeetCodeUsernameSchema } from "../src/lib/validations/leetcode.ts";
import { verifyLeetCodeUsername } from "../src/server/services/leetcode/verify.service.ts";
import { leetcodeProvider } from "../src/server/providers/leetcode.provider.ts";

test("LeetCode Linking — Username Format Validation (Zod Schema)", () => {
  // Valid formats: alphanumeric, dashes, underscores
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "neal_wu" }).success, true);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "tourist" }).success, true);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "john-doe" }).success, true);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "coder123" }).success, true);

  // Invalid formats: empty string, special characters, whitespace
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "" }).success, false);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "user@domain" }).success, false);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "user name with spaces" }).success, false);
  assert.equal(LeetCodeUsernameSchema.safeParse({ username: "user!#$" }).success, false);
});

test("LeetCode Linking — Remote Account Verification via GraphQL API", async () => {
  // Real known user on LeetCode should be verified
  const validCheck = await verifyLeetCodeUsername("neal_wu");
  assert.equal(validCheck.valid, true);
  assert.equal(validCheck.error, undefined);

  // Non-existent username should return a graceful error
  const invalidCheck = await verifyLeetCodeUsername("non_existent_fake_user_998877");
  assert.equal(invalidCheck.valid, false);
  assert.ok(invalidCheck.error?.includes("does not exist or is private"));
});

test("LeetCode Linking — Data Fetch & Schema Ingestion Parsing", async () => {
  const stats = await leetcodeProvider.fetchUserData("neal_wu");

  // Verify structure of fetched data matches what gets persisted to CodingStatistics
  assert.equal(typeof stats.totalSolved, "number");
  assert.equal(typeof stats.easySolved, "number");
  assert.equal(typeof stats.mediumSolved, "number");
  assert.equal(typeof stats.hardSolved, "number");
  assert.equal(stats.totalSolved, stats.easySolved + stats.mediumSolved + stats.hardSolved);

  assert.equal(typeof stats.acceptanceRate, "number");
  assert.ok(stats.acceptanceRate >= 0 && stats.acceptanceRate <= 100);

  if (stats.contestRating !== null) {
    assert.equal(typeof stats.contestRating, "number");
    assert.ok(stats.contestRating > 0);
  }

  assert.equal(typeof stats.submissionCalendar, "object");
  assert.ok(Array.isArray(stats.recentSubmissions));
});
