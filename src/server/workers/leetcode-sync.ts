import { db } from "@/lib/db";
import { syncUserLeetCodeData } from "@/server/services/leetcode/sync.service";

export async function runBatchLeetCodeSync(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
}> {
  const accounts = await db.linkedCodingAccount.findMany({
    where: { isVerified: true },
    select: { id: true, username: true },
  });

  let succeeded = 0;
  let failed = 0;

  for (const acc of accounts) {
    try {
      const res = await syncUserLeetCodeData(acc.id);
      if (res.success) succeeded++;
      else failed++;
    } catch {
      failed++;
    }

    // Pacing delay between user syncs
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`[SYNC BATCH] Processed ${accounts.length} users. Succeeded: ${succeeded}, Failed: ${failed}`);
  return { total: accounts.length, succeeded, failed };
}