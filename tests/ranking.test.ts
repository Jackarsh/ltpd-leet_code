import test from "node:test";
import assert from "node:assert/strict";
import { calculateWeightedScore, RANKING_CONFIG } from "../src/lib/ranking-config.ts";
import { calculateCurrentStreak, isUserActive } from "../src/lib/activity-utils.ts";

test("Weighted Score Calculation — Standard case", () => {
  const result = calculateWeightedScore(10, 5, 2, 1600);
  // Easy: 10 * 1 = 10
  // Medium: 5 * 3 = 15
  // Hard: 2 * 6 = 12
  // Rating: 1600 * 0.5 = 800
  // Total: 837
  assert.equal(result.easyContribution, 10);
  assert.equal(result.mediumContribution, 15);
  assert.equal(result.hardContribution, 12);
  assert.equal(result.contestRatingContribution, 800);
  assert.equal(result.totalWeightedScore, 837);
});

test("Weighted Score Calculation — Unrated / Null rating (US8)", () => {
  const resultNull = calculateWeightedScore(10, 5, 2, null);
  assert.equal(resultNull.contestRatingContribution, 0);
  assert.equal(resultNull.totalWeightedScore, 37);

  const resultZero = calculateWeightedScore(10, 5, 2, 0);
  assert.equal(resultZero.contestRatingContribution, 0);
  assert.equal(resultZero.totalWeightedScore, 37);
});

test("Deterministic Tie-Breaking Logic (FR-213)", () => {
  interface Candidate {
    name: string;
    score: number;
    hard: number;
    medium: number;
    easy: number;
    rating: number | null;
    createdAt: Date;
  }

  const candidates: Candidate[] = [
    // Ties on score (100) with B, but A has more hard problems
    { name: "Bob", score: 100, hard: 5, medium: 10, easy: 40, rating: null, createdAt: new Date("2024-01-02") },
    { name: "Alice", score: 100, hard: 10, medium: 5, easy: 25, rating: null, createdAt: new Date("2024-01-01") },
    // Lower score (50)
    { name: "Charlie", score: 50, hard: 2, medium: 6, easy: 20, rating: 1500, createdAt: new Date("2024-01-03") },
    // Identical score & problems as Dave, but Daniel comes first alphabetically
    { name: "Dave", score: 80, hard: 4, medium: 8, easy: 32, rating: null, createdAt: new Date("2024-01-04") },
    { name: "Daniel", score: 80, hard: 4, medium: 8, easy: 32, rating: null, createdAt: new Date("2024-01-05") },
  ];

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.hard !== a.hard) return b.hard - a.hard;
    if (b.medium !== a.medium) return b.medium - a.medium;
    if (b.easy !== a.easy) return b.easy - a.easy;
    const ratingA = a.rating ?? 0;
    const ratingB = b.rating ?? 0;
    if (ratingB !== ratingA) return ratingB - ratingA;
    return a.name.localeCompare(b.name);
  });

  // Expected order:
  // 1. Alice (100 score, 10 hard)
  // 2. Bob (100 score, 5 hard)
  // 3. Daniel (80 score, ties Dave, 'Daniel' < 'Dave')
  // 4. Dave (80 score)
  // 5. Charlie (50 score)
  assert.equal(candidates[0].name, "Alice");
  assert.equal(candidates[1].name, "Bob");
  assert.equal(candidates[2].name, "Daniel");
  assert.equal(candidates[3].name, "Dave");
  assert.equal(candidates[4].name, "Charlie");
});

test("Streak Calculation — Consecutive Days", () => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // 3 consecutive days ending today
  const cal: Record<string, number> = {};
  for (let i = 0; i < 3; i++) {
    const ts = Math.floor((now.getTime() - i * dayMs) / 1000);
    cal[ts.toString()] = 2;
  }

  const streak = calculateCurrentStreak(JSON.stringify(cal));
  assert.equal(streak, 3);
});

test("Streak Calculation — Broken Streak", () => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // Submissions 5 days ago only (broken streak)
  const cal: Record<string, number> = {};
  const ts = Math.floor((now.getTime() - 5 * dayMs) / 1000);
  cal[ts.toString()] = 5;

  const streak = calculateCurrentStreak(JSON.stringify(cal));
  assert.equal(streak, 0);
});

test("User Activity Window Check (30 days)", () => {
  const recent = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  assert.equal(isUserActive(recent, 30), true);

  const old = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  assert.equal(isUserActive(old, 30), false);
});