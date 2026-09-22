import { db } from "@/lib/db";
import { syncUserLeetCodeData } from "@/server/services/leetcode/sync.service";
import { recalculateAllCollegeRanks } from "@/server/services/ranking.service";
import { recomputeAllGenderWarAggregates } from "@/server/services/gender-war.service";

export async function runBatchLeetCodeSync(concurrency = 3): Promise<{
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

  // Process in bounded concurrent chunks (individual sync skips expensive platform-wide aggregations)
  for (let i = 0; i < accounts.length; i += concurrency) {
    const chunk = accounts.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      chunk.map((acc) => syncUserLeetCodeData(acc.id, { triggerAggregations: false }))
    );

    for (const res of results) {
      if (res.status === "fulfilled" && res.value.success) {
        succeeded++;
      } else {
        failed++;
      }
    }

    if (i + concurrency < accounts.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  // Decoupled: Run platform-wide rankings and Gender War recalculations ONCE post-batch
  if (succeeded > 0) {
    try {
      await recalculateAllCollegeRanks();
    } catch (err) {
      console.error("[SYNC BATCH] Failed to recalculate college ranks post-batch:", err);
    }
    try {
      await recomputeAllGenderWarAggregates();
    } catch (err) {
      console.error("[SYNC BATCH] Failed to recompute Gender War aggregates post-batch:", err);
    }
  }

  console.log(`[SYNC BATCH] Processed ${accounts.length} users. Succeeded: ${succeeded}, Failed: ${failed}`);
  return { total: accounts.length, succeeded, failed };
}