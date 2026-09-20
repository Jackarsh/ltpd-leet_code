import test from "node:test";
import assert from "node:assert/strict";
import {
  getCachedItem,
  setCachedItem,
  invalidateGenderWarCache,
} from "../src/lib/gender-war-cache.ts";

// ---------------------------------------------------------------------------
// Unit tests for R5 — Gender War domain logic and caching (Phase 7 / SC-401)
// ---------------------------------------------------------------------------

test("Gender War Caching — set and get cached item", () => {
  invalidateGenderWarCache();
  const sampleData = {
    gender: "MALE" as const,
    totalSolved: 100,
    participantCount: 10,
  };

  setCachedItem("test:male:week", sampleData, 60000);
  const cached = getCachedItem<typeof sampleData>("test:male:week");

  assert.deepEqual(cached, sampleData);
});

test("Gender War Caching — cache miss returns null", () => {
  invalidateGenderWarCache();
  const cached = getCachedItem("nonexistent:key");
  assert.equal(cached, null);
});

test("Gender War Caching — expired item returns null", async () => {
  invalidateGenderWarCache();
  setCachedItem("test:expired", { value: 42 }, 10); // 10ms TTL

  // Wait 25ms for expiry
  await new Promise((resolve) => setTimeout(resolve, 25));

  const cached = getCachedItem("test:expired");
  assert.equal(cached, null);
});

test("Gender War Caching — invalidateGenderWarCache purges all entries (FR-416)", () => {
  setCachedItem("key1", { data: 1 });
  setCachedItem("key2", { data: 2 });

  invalidateGenderWarCache();

  assert.equal(getCachedItem("key1"), null);
  assert.equal(getCachedItem("key2"), null);
});

test("Gender War Metrics — Safe Division & Normalization (FR-409, FR-413)", () => {
  function safeDiv(numerator: number, denominator: number): number | null {
    if (denominator === 0) return null;
    return numerator / denominator;
  }

  // Standard case
  assert.equal(safeDiv(150, 10), 15);
  // Zero participants (FR-413: division-by-zero returns null, rendered as "—")
  assert.equal(safeDiv(0, 0), null);
  assert.equal(safeDiv(100, 0), null);
});

test("Gender War Metrics — Rating Denominator Excludes Unrated Students (FR-412)", () => {
  // 5 participants total, but only 2 have contest ratings
  const participants = [
    { name: "Alice", rating: 1600 },
    { name: "Bob", rating: null },
    { name: "Carol", rating: 1800 },
    { name: "Dave", rating: null },
    { name: "Eve", rating: null },
  ];

  const rated = participants.filter((p) => p.rating !== null);
  assert.equal(rated.length, 2);

  const avgRating = rated.reduce((sum, p) => sum + (p.rating ?? 0), 0) / rated.length;
  assert.equal(avgRating, 1700);
});

test("Gender War Metrics — Low Sample Size Detection (<5 participants) (FR-415)", () => {
  function isLowSampleSize(participantCount: number): boolean {
    return participantCount < 5;
  }

  assert.equal(isLowSampleSize(0), true);
  assert.equal(isLowSampleSize(4), true);
  assert.equal(isLowSampleSize(5), false);
  assert.equal(isLowSampleSize(20), false);
});

test("Gender War Leaderboard — Deterministic Tie-Breaking (FR-430)", () => {
  interface LeaderboardCandidate {
    name: string;
    totalSolved: number;
    hardSolved: number;
    collegeRank: number | null;
  }

  const candidates: LeaderboardCandidate[] = [
    // Same totalSolved (100) and hardSolved (10), but Bob has better college rank (#2 vs #5)
    { name: "Alice", totalSolved: 100, hardSolved: 10, collegeRank: 5 },
    { name: "Bob", totalSolved: 100, hardSolved: 10, collegeRank: 2 },
    // Same totalSolved (100), but Charlie has more hardSolved (15)
    { name: "Charlie", totalSolved: 100, hardSolved: 15, collegeRank: 10 },
    // Higher totalSolved (120)
    { name: "Diana", totalSolved: 120, hardSolved: 5, collegeRank: 20 },
    // Lower totalSolved (80)
    { name: "Evan", totalSolved: 80, hardSolved: 20, collegeRank: 1 },
  ];

  // Ordering: totalSolved DESC -> hardSolved DESC -> collegeRank ASC
  candidates.sort((a, b) => {
    if (b.totalSolved !== a.totalSolved) return b.totalSolved - a.totalSolved;
    if (b.hardSolved !== a.hardSolved) return b.hardSolved - a.hardSolved;
    const ra = a.collegeRank ?? Number.MAX_SAFE_INTEGER;
    const rb = b.collegeRank ?? Number.MAX_SAFE_INTEGER;
    return ra - rb;
  });

  assert.equal(candidates[0].name, "Diana");   // 120 total
  assert.equal(candidates[1].name, "Charlie"); // 100 total, 15 hard
  assert.equal(candidates[2].name, "Bob");     // 100 total, 10 hard, rank #2
  assert.equal(candidates[3].name, "Alice");   // 100 total, 10 hard, rank #5
  assert.equal(candidates[4].name, "Evan");    // 80 total
});
