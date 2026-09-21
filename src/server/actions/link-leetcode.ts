"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LeetCodeUsernameSchema } from "@/lib/validations/leetcode";
import { verifyLeetCodeUsername } from "@/server/services/leetcode/verify.service";
import { syncUserLeetCodeData } from "@/server/services/leetcode/sync.service";
import { revalidatePath } from "next/cache";

export async function linkLeetCodeAccount(values: { username: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to link your LeetCode account." };
  }

  const parsed = LeetCodeUsernameSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid LeetCode username." };
  }

  const username = parsed.data.username;

  // Verify username actually exists on LeetCode (US6)
  const verification = await verifyLeetCodeUsername(username);
  if (!verification.valid) {
    return { error: verification.error || "LeetCode account not found." };
  }

  // Check if this username is already claimed by another user
  const existingAccount = await db.linkedCodingAccount.findFirst({
    where: {
      platform: "LEETCODE",
      username: { equals: username, mode: "insensitive" },
      userId: { not: session.user.id },
    },
  });

  if (existingAccount) {
    return { error: "This LeetCode username is already linked to another student account." };
  }

  // Create or update linked account
  const linked = await db.linkedCodingAccount.upsert({
    where: {
      userId_platform: {
        userId: session.user.id,
        platform: "LEETCODE",
      },
    },
    create: {
      userId: session.user.id,
      platform: "LEETCODE",
      username,
      isVerified: true,
      syncStatus: "PENDING",
    },
    update: {
      username,
      isVerified: true,
      syncStatus: "PENDING",
      lastSyncError: null,
    },
  });

  // Also update user profile handle
  await db.userProfile.update({
    where: { userId: session.user.id },
    data: { leetcodeUsername: username },
  });

  // Await initial sync so stats are populated immediately
  try {
    await syncUserLeetCodeData(linked.id);
  } catch (err) {
    console.error("Initial sync error:", err);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings/profile");
  revalidatePath("/");

  return { success: `Successfully linked LeetCode account @${username}!` };
}
