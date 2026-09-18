import { z } from "zod";

// Gender Enum (FR-003, US6)
// Exactly two options: Male and Female. No other values permitted.
export const GenderEnum = z.enum(["MALE", "FEMALE"] as const);

// Registration Schema (FR-002, FR-003, FR-004, FR-031)
export const RegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name must be 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  leetcodeUsername: z
    .string()
    .trim()
    .min(1, "LeetCode username is required")
    .max(50, "LeetCode username must be 50 characters or fewer"),
  gender: GenderEnum,
  // Optional academic fields (FR-007)
  admissionYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  branch: z.string().trim().max(100).optional().nullable(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Login Schema
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Password Reset Request Schema
export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// New Password Schema (FR-031)
export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  token: z.string().min(1, "Token is required"),
});

export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;