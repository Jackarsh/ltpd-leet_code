"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncUserLeetCodeData } from "@/server/services/leetcode/sync.service";
import { revalidatePath } from "next/cache";

const MIN_SYNC_INTERVAL_MINUTES = 5;

export async function syncNow() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to synchronize stats." };
  }

  const account = await db.linkedCodingAccount.findFirst({
    where: {
      userId: session.user.id,
      platform: "LEETCODE",
    },
  });

  if (!account) {
    return { error: "No LeetCode account linked. Please link your account first." };
  }

  // Rate-limit on-demand syncs
  if (account.lastSyncAt) {
    const elapsedMinutes = (Date.now() - account.lastSyncAt.getTime()) / (1000 * 60);
    if (elapsedMinutes < MIN_SYNC_INTERVAL_MINUTES) {
      const waitRemaining = Math.ceil(MIN_SYNC_INTERVAL_MINUTES - elapsedMinutes);
      return {
        error: `Please wait ${waitRemaining} minute(s) before requesting another sync.`,
      };
    }
  }

  const result = await syncUserLeetCodeData(account.id);

  revalidatePath("/dashboard");
  revalidatePath(`/profiles/${account.username}`);

  if (!result.success) {
    return { error: result.error || "Sync failed. Your existing stats have been preserved." };
  }

  return { success: "LeetCode statistics refreshed successfully!" };
}