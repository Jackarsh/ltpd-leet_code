import { leetcodeProvider } from "@/server/providers/leetcode.provider";
import { UserNotFoundError } from "@/server/providers/base.provider";

export async function verifyLeetCodeUsername(username: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const exists = await leetcodeProvider.validateUser(username);
    if (!exists) {
      return {
        valid: false,
        error: `LeetCode account '${username}' does not exist or is private.`,
      };
    }
    return { valid: true };
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return {
        valid: false,
        error: `LeetCode account '${username}' was not found.`,
      };
    }
    const message = err instanceof Error ? err.message : "Failed to verify account";
    return {
      valid: false,
      error: `Could not verify with LeetCode: ${message}`,
    };
  }
}