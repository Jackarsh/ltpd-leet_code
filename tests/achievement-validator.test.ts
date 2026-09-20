import test from "node:test";
import assert from "node:assert/strict";
import {
  validateAchievementCondition,
  validateAchievementInput,
  WHITELIST_VARIABLES,
} from "../src/lib/achievement-validator.ts";

test("Achievement Condition Validator — Validates Whitelisted Variables and Operators (FR-609, SC-606)", () => {
  // Test every whitelisted variable
  for (const varName of WHITELIST_VARIABLES) {
    const res = validateAchievementCondition(`${varName} >= 10`);
    assert.equal(res.isValid, true, `Expected ${varName} to be valid`);
    assert.deepEqual(res.variables, [varName]);
  }

  // Test standard operators
  const operators = [">=", "<=", ">", "<", "==", "!=", "="];
  for (const op of operators) {
    const res = validateAchievementCondition(`total_solved ${op} 100`);
    assert.equal(res.isValid, true, `Operator ${op} should be valid`);
  }
});

test("Achievement Condition Validator — Compound Boolean Expressions with Conjunctions (FR-609)", () => {
  const compoundCases = [
    "total_solved >= 100 AND hard_solved >= 10",
    "contest_rating >= 1600 OR contests_attended >= 10",
    "total_solved >= 50 && medium_solved >= 25",
    "current_streak >= 7 || longest_streak >= 30",
    "(contest_rating >= 1800 OR contests_attended >= 15) AND hard_solved >= 20",
    "easy_solved >= 50 AND (medium_solved >= 30 OR hard_solved >= 10)",
  ];

  for (const expr of compoundCases) {
    const res = validateAchievementCondition(expr);
    assert.equal(res.isValid, true, `Failed on valid expression: ${expr}`);
    assert.ok(res.ast, "AST should be generated");
  }
});

test("Achievement Condition Validator — Rejects Disallowed Variables (Security / Anti-Tamper)", () => {
  const forbiddenVariables = [
    "roll_number",
    "enrollment_no",
    "section",
    "college_email",
    "user_password",
    "hack_stats",
    "submission_count",
    "qotw_streak",
    "first_blood_count",
    "batch_wars_rank",
  ];

  for (const varName of forbiddenVariables) {
    const res = validateAchievementCondition(`${varName} >= 10`);
    assert.equal(res.isValid, false, `Variable ${varName} should be rejected`);
    assert.match(res.error || "", /Disallowed variable/);
  }
});

test("Achievement Condition Validator — Rejects Malformed Syntax and Unbalanced Parentheses", () => {
  const malformedCases = [
    { expr: "", errorPattern: /cannot be empty/ },
    { expr: "   ", errorPattern: /cannot be empty/ },
    { expr: "total_solved >=", errorPattern: /Expected numeric value/ },
    { expr: "total_solved", errorPattern: /Expected comparison operator/ },
    { expr: "total_solved >= abc", errorPattern: /Expected numeric value/ },
    { expr: "total_solved @ 100", errorPattern: /Unexpected character "@"/ },
    { expr: "total_solved === 100", errorPattern: /Invalid operator/ },
    { expr: "total_solved >= 100 AND", errorPattern: /Unexpected end of expression/ },
    { expr: "(total_solved >= 100", errorPattern: /Missing closing parenthesis/ },
    { expr: "total_solved >= 100)", errorPattern: /Unexpected token/ },
    { expr: "()", errorPattern: /Empty parenthesis group/ },
    { expr: "total_solved >= 100 AND AND hard_solved >= 10", errorPattern: /Expected variable name/ },
    { expr: "total_solved >= -5", errorPattern: /Negative numbers are not allowed/ },
  ];

  for (const { expr, errorPattern } of malformedCases) {
    const res = validateAchievementCondition(expr);
    assert.equal(res.isValid, false, `Expression "${expr}" should be invalid`);
    assert.match(res.error || "", errorPattern);
  }
});

test("Achievement Input Validator — Validates Metadata Bounds & Constraints (FR-608)", () => {
  const validPayload = {
    name: "Century Solver",
    description: "Successfully solved 100 or more LeetCode algorithmic problems.",
    category: "PROBLEM_SOLVING",
    iconKey: "trophy",
    conditionExpression: "total_solved >= 100",
    rarityLevel: "RARE" as const,
    points: 50,
    status: "PUBLISHED" as const,
  };

  const validRes = validateAchievementInput(validPayload);
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.sanitized?.name, "Century Solver");
  assert.equal(validRes.sanitized?.points, 50);

  // Rejection of invalid name (too short/long)
  const shortNameRes = validateAchievementInput({ ...validPayload, name: "AB" });
  assert.equal(shortNameRes.isValid, false);
  assert.ok(shortNameRes.errors.name);

  // Rejection of invalid description (<10 chars)
  const shortDescRes = validateAchievementInput({ ...validPayload, description: "Too short" });
  assert.equal(shortDescRes.isValid, false);
  assert.ok(shortDescRes.errors.description);

  // Rejection of invalid rarity
  const badRarityRes = validateAchievementInput({ ...validPayload, rarityLevel: "MYTHIC" as any });
  assert.equal(badRarityRes.isValid, false);
  assert.ok(badRarityRes.errors.rarityLevel);

  // Rejection of invalid points
  const badPointsRes = validateAchievementInput({ ...validPayload, points: 0 });
  assert.equal(badPointsRes.isValid, false);
  assert.ok(badPointsRes.errors.points);

  // Rejection of malformed condition expression in full form
  const badCondRes = validateAchievementInput({ ...validPayload, conditionExpression: "total_solved >=" });
  assert.equal(badCondRes.isValid, false);
  assert.ok(badCondRes.errors.conditionExpression);
});
