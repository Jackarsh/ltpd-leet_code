import test from "node:test";
import assert from "node:assert/strict";
import {
  validateDateSequence,
  validateAcademicPeriodInput,
  validateBranchInput,
} from "../src/lib/calendar-validator.ts";

test("Date Sequence Validator — Validates chronological sequence (FR-615, Edge Case 5)", () => {
  // Valid case
  const valid = validateDateSequence("2026-08-01", "2026-12-15");
  assert.equal(valid.isValid, true);
  assert.ok(valid.startDate && valid.endDate);
  assert.ok(valid.startDate < valid.endDate);

  // Inverted dates (End date before start date)
  const inverted = validateDateSequence("2026-12-15", "2026-08-01");
  assert.equal(inverted.isValid, false);
  assert.match(inverted.error || "", /strictly before/);

  // Equal dates
  const equal = validateDateSequence("2026-08-01", "2026-08-01");
  assert.equal(equal.isValid, false);
  assert.match(equal.error || "", /strictly before/);

  // Malformed date
  const malformed = validateDateSequence("invalid-date", "2026-12-15");
  assert.equal(malformed.isValid, false);
  assert.match(malformed.error || "", /valid date format/);

  // Missing values
  assert.equal(validateDateSequence("", "2026-12-15").isValid, false);
  assert.equal(validateDateSequence("2026-08-01", "").isValid, false);
});

test("Academic Period Input Validator — Validates Period Attributes & Types (FR-615)", () => {
  const validSemester = {
    name: "Fall 2026",
    periodType: "SEMESTER" as const,
    startDate: "2026-08-01",
    endDate: "2026-12-15",
    isCurrent: true,
  };

  const validResult = validateAcademicPeriodInput(validSemester);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.sanitized?.name, "Fall 2026");
  assert.equal(validResult.sanitized?.periodType, "SEMESTER");
  assert.equal(validResult.sanitized?.isCurrent, true);

  // Invalid period name length
  const shortName = validateAcademicPeriodInput({ ...validSemester, name: "F" });
  assert.equal(shortName.isValid, false);
  assert.ok(shortName.errors.name);

  // Invalid period type
  const badType = validateAcademicPeriodInput({ ...validSemester, periodType: "QUARTER" as any });
  assert.equal(badType.isValid, false);
  assert.ok(badType.errors.periodType);

  // Inverted dates
  const badDates = validateAcademicPeriodInput({
    ...validSemester,
    startDate: "2026-12-31",
    endDate: "2026-01-01",
  });
  assert.equal(badDates.isValid, false);
  assert.ok(badDates.errors.dates);
});

test("Branch Input Validator — Enforces Name & Code Formats (FR-614)", () => {
  const validBranch = {
    name: "Computer Science & Engineering",
    code: "CSE",
    isActive: true,
    displayOrder: 1,
  };

  const res = validateBranchInput(validBranch);
  assert.equal(res.isValid, true);
  assert.equal(res.sanitized?.name, "Computer Science & Engineering");
  assert.equal(res.sanitized?.code, "CSE");

  // Invalid code with special characters
  const badCode = validateBranchInput({ ...validBranch, code: "CS@E" });
  assert.equal(badCode.isValid, false);
  assert.ok(badCode.errors.code);

  // Code too short
  const shortCode = validateBranchInput({ ...validBranch, code: "C" });
  assert.equal(shortCode.isValid, false);
  assert.ok(shortCode.errors.code);

  // Name too short
  const shortName = validateBranchInput({ ...validBranch, name: "A" });
  assert.equal(shortName.isValid, false);
  assert.ok(shortName.errors.name);
});
