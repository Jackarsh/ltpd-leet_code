import type { UpdateUserMetadataInput } from "@/types/admin";

/**
 * Validates metadata update payload and strips/rejects any attempt to inject
 * or override synchronized coding statistics (FR-603, SC-603).
 */
export function sanitizeUserMetadataInput(
  rawInput: Record<string, unknown>
): UpdateUserMetadataInput {
  // Disallow modifying coding stats
  const forbiddenFields = [
    "totalSolved",
    "easySolved",
    "mediumSolved",
    "hardSolved",
    "contestRating",
    "currentStreak",
    "collegeRank",
    "weightedScore",
    "passwordHash",
    "email",
  ];

  for (const field of forbiddenFields) {
    if (field in rawInput && rawInput[field] !== undefined) {
      throw new Error(`Modification of field "${field}" is strictly prohibited.`);
    }
  }

  const sanitized: UpdateUserMetadataInput = {};

  if (typeof rawInput.displayName === "string") {
    const trimmed = rawInput.displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 50) {
      throw new Error("Display name must be between 2 and 50 characters.");
    }
    sanitized.displayName = trimmed;
  }

  if (rawInput.gender !== undefined) {
    if (rawInput.gender === "MALE" || rawInput.gender === "FEMALE") {
      sanitized.gender = rawInput.gender;
    } else {
      throw new Error("Gender must be explicitly 'MALE' or 'FEMALE'.");
    }
  }

  if (rawInput.branch !== undefined) {
    sanitized.branch = typeof rawInput.branch === "string" ? rawInput.branch.trim() : null;
  }

  if (rawInput.admissionYear !== undefined) {
    const year = Number(rawInput.admissionYear);
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new Error("Admission year must be a valid 4-digit year.");
    }
    sanitized.admissionYear = year;
  }

  if (rawInput.graduationYear !== undefined) {
    const year = Number(rawInput.graduationYear);
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new Error("Graduation year must be a valid 4-digit year.");
    }
    sanitized.graduationYear = year;
  }

  return sanitized;
}
