import { z } from "zod";
import { GenderEnum } from "./auth";

// ─── Profile Update Schema (FR-019, FR-020, FR-006) ─────────────────────────
// FR-019: Editable: name, avatar, leetcode username, gender, admission year,
//         graduation year, branch.
// FR-020: NOT editable: stats, rating, rank, score.
// FR-006: NEVER collect: enrollment number, roll number, section.
export const ProfileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(100, "Name must be 100 characters or fewer")
    .optional(),
  gender: GenderEnum.optional(),
  leetcodeUsername: z
    .string()
    .trim()
    .min(1, "LeetCode username cannot be empty")
    .max(50, "LeetCode username must be 50 characters or fewer")
    .optional(),
  admissionYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  branch: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(300).optional().nullable(),
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// ─── Email Change Schema (FR-021) ──────────────────────────────────────────
export const EmailChangeSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type EmailChangeInput = z.infer<typeof EmailChangeSchema>;
