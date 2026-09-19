import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeUserMetadataInput } from "../src/lib/admin-user-validator.ts";

test("Admin User Service — Read-Only Stats Guard strictly blocks tampering (FR-603 / SC-603)", () => {
  const forbiddenAttempts = [
    { totalSolved: 500 },
    { easySolved: 200 },
    { mediumSolved: 200 },
    { hardSolved: 100 },
    { contestRating: 2500 },
    { currentStreak: 50 },
    { collegeRank: 1 },
    { weightedScore: 999.9 },
    { passwordHash: "hacked" },
    { email: "new@example.com" },
  ];

  for (const payload of forbiddenAttempts) {
    assert.throws(
      () => sanitizeUserMetadataInput(payload),
      /strictly prohibited/,
      `Should reject modification of stats: ${JSON.stringify(payload)}`
    );
  }
});

test("Admin User Service — Valid Metadata Update Sanitization (FR-602)", () => {
  const validPayload = {
    displayName: "  Alice Smith  ",
    gender: "FEMALE",
    branch: "Computer Science",
    admissionYear: 2023,
    graduationYear: 2027,
  };

  const sanitized = sanitizeUserMetadataInput(validPayload);
  assert.equal(sanitized.displayName, "Alice Smith");
  assert.equal(sanitized.gender, "FEMALE");
  assert.equal(sanitized.branch, "Computer Science");
  assert.equal(sanitized.admissionYear, 2023);
  assert.equal(sanitized.graduationYear, 2027);
});

test("Admin User Service — Gender Constraint Enforcement (FR-602, Constitution Principle 2)", () => {
  assert.throws(
    () => sanitizeUserMetadataInput({ gender: "OTHER" }),
    /explicitly 'MALE' or 'FEMALE'/
  );

  assert.throws(
    () => sanitizeUserMetadataInput({ gender: "NON_BINARY" }),
    /explicitly 'MALE' or 'FEMALE'/
  );

  assert.doesNotThrow(() => sanitizeUserMetadataInput({ gender: "MALE" }));
  assert.doesNotThrow(() => sanitizeUserMetadataInput({ gender: "FEMALE" }));
});

test("Admin User Service — Display Name Validation Bounds", () => {
  assert.throws(
    () => sanitizeUserMetadataInput({ displayName: "A" }),
    /between 2 and 50 characters/
  );

  assert.throws(
    () => sanitizeUserMetadataInput({ displayName: "A".repeat(51) }),
    /between 2 and 50 characters/
  );
});
