import { z } from "zod";

export const LeetCodeUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "LeetCode username must be at least 3 characters")
    .max(50, "LeetCode username must be 50 characters or fewer")
    .regex(/^[a-zA-Z0-9_.-]+$/, "LeetCode username contains invalid characters"),
});

export type LeetCodeUsernameInput = z.infer<typeof LeetCodeUsernameSchema>;