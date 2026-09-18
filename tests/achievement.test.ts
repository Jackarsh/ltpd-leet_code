import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCondition } from "../src/server/services/achievement-rule.service.ts";
import type { RuleVariables } from "../src/server/services/achievement-rule.service.ts";
import { generate12MonthHeatmap } from "../src/server/services/activity.service.ts";

test("Achievement Rule Parser — Simple Conditions", () => {
  const vars: RuleVariables = {
    total_solved: 120,
    easy_solved: 50,
    medium_solved: 55,
    hard_solved: 15,
    contest_rating: 1650,
    contests_attended: 8,
    current_streak: 10,
    longest_streak: 25,
  };

  assert.equal(evaluateCondition("total_solved >= 100", vars), true);
  assert.equal(evaluateCondition("total_solved >= 200", vars), false);
  assert.equal(evaluateCondition("hard_solved >= 10", vars), true);
  assert.equal(evaluateCondition("hard_solved >= 50", vars), false);
  assert.equal(evaluateCondition("contest_rating >= 1600", vars), true);
  assert.equal(evaluateCondition("contest_rating >= 1900", vars), false);
  assert.equal(evaluateCondition("current_streak >= 7", vars), true);
  assert.equal(evaluateCondition("longest_streak >= 50", vars), false);
});

test("Achievement Rule Parser — Compound Boolean AND & OR", () => {
  const vars: RuleVariables = {
    total_solved: 150,
    easy_solved: 80,
    medium_solved: 55,
    hard_solved: 15,
    contest_rating: 1550,
    contests_attended: 12,
    current_streak: 14,
    longest_streak: 30,
  };

  // AND conditions
  assert.equal(evaluateCondition("total_solved >= 100 AND hard_solved >= 10", vars), true);
  assert.equal(evaluateCondition("total_solved >= 100 AND hard_solved >= 20", vars), false);

  // OR conditions
  assert.equal(evaluateCondition("contest_rating >= 1600 OR contests_attended >= 10", vars), true);
  assert.equal(evaluateCondition("contest_rating >= 1800 OR contests_attended >= 20", vars), false);
});

test("12-Month Activity Heatmap Generator — 6 Metrics Calculation (FR-317)", () => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  // 5 days of activity:
  // Today: 4 solves
  // Yesterday: 2 solves
  // 2 days ago: 6 solves
  // 10 days ago: 1 solve
  // 11 days ago: 3 solves
  const calendar: Record<string, number> = {};
  calendar[Math.floor(now.getTime() / 1000).toString()] = 4;
  calendar[Math.floor((now.getTime() - dayMs) / 1000).toString()] = 2;
  calendar[Math.floor((now.getTime() - 2 * dayMs) / 1000).toString()] = 6;
  calendar[Math.floor((now.getTime() - 10 * dayMs) / 1000).toString()] = 1;
  calendar[Math.floor((now.getTime() - 11 * dayMs) / 1000).toString()] = 3;

  const result = generate12MonthHeatmap(JSON.stringify(calendar));

  // Exactly 365 calendar days generated
  assert.equal(result.days.length, 365);

  // Total solves: 4 + 2 + 6 + 1 + 3 = 16
  assert.equal(result.metrics.totalActivity, 16);

  // Active days count: 5 days
  assert.equal(result.metrics.activeDays, 5);

  // Daily activity on most recent day: 4
  assert.equal(result.metrics.dailyActivity, 4);

  // Current streak (consecutive ending today): 3 days (today, yesterday, 2 days ago)
  assert.equal(result.metrics.currentStreak, 3);

  // Longest streak: at least 3
  assert.equal(result.metrics.longestStreak >= 3, true);

  // Average activity on active days: 16 / 5 = 3.2
  assert.equal(result.metrics.averageActivityOnActiveDays, 3.2);
});

test("12-Month Activity Heatmap Generator — Empty Calendar Handling (FR-317)", () => {
  const result = generate12MonthHeatmap(null);
  assert.equal(result.days.length, 365);
  assert.equal(result.metrics.totalActivity, 0);
  assert.equal(result.metrics.activeDays, 0);
  assert.equal(result.metrics.currentStreak, 0);
  assert.equal(result.metrics.longestStreak, 0);
  assert.equal(result.metrics.averageActivityOnActiveDays, null);
});