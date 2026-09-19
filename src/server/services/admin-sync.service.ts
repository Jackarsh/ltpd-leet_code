import { db } from "@/lib/db";
import {
  globalSyncCircuitBreaker,
  categorizeSyncError,
  validateBatchConfirmation,
  SyncErrorCategory,
} from "@/lib/sync-circuit-breaker";
import { syncUserLeetCodeData, STALE_THRESHOLD_HOURS } from "./leetcode/sync.service";
import { recordAuditLog } from "./audit.service";

export interface SyncHealthMetrics {
  totalAccounts: number;
  syncedLast24h: number;
  successLast24h: number;
  failedLast24h: number;
  pendingCount: number;
  inProgressCount: number;
  staleCount: number;
  successRate: number;
  circuitBreaker: {
    state: string;
    consecutiveRateLimits: number;
    lastTrippedAt: string | null;
    cooldownMs: number;
  };
  errorDistribution: Record<SyncErrorCategory, number>;
  recentErrors: Array<{
    id: string;
    accountId: string;
    userId: string;
    username: string;
    displayName: string;
    userEmail: string;
    error: string;
    category: SyncErrorCategory;
    lastSyncAt: string | null;
    failedAt: string;
  }>;
}

/**
 * Aggregates live sync queue health metrics and categorized error logs (FR-611, SC-607).
 */
export async function getSyncHealthMetrics(): Promise<SyncHealthMetrics> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const staleCutoff = new Date(Date.now() - STALE_THRESHOLD_HOURS * 60 * 60 * 1000);

  const [
    totalAccounts,
    syncedLast24h,
    successLast24h,
    failedLast24h,
    pendingCount,
    inProgressCount,
    staleAccounts,
    recentFailedRecords,
  ] = await Promise.all([
    db.linkedCodingAccount.count(),
    db.linkedCodingAccount.count({
      where: { lastSyncAt: { gte: oneDayAgo } },
    }),
    db.linkedCodingAccount.count({
      where: {
        syncStatus: "SUCCESS",
        lastSyncAt: { gte: oneDayAgo },
      },
    }),
    db.linkedCodingAccount.count({
      where: { syncStatus: "FAILED" },
    }),
    db.linkedCodingAccount.count({
      where: { syncStatus: "PENDING" },
    }),
    db.linkedCodingAccount.count({
      where: { syncStatus: "IN_PROGRESS" },
    }),
    db.linkedCodingAccount.count({
      where: {
        OR: [
          { lastSyncAt: null },
          { lastSyncAt: { lt: staleCutoff } },
        ],
      },
    }),
    db.linkedCodingAccount.findMany({
      where: { syncStatus: "FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    }),
  ]);

  // Compute success rate percentage
  const totalRecentResolved = successLast24h + failedLast24h;
  const successRate =
    totalRecentResolved > 0
      ? Math.round((successLast24h / totalRecentResolved) * 100)
      : 100;

  // Categorize errors
  const errorDistribution: Record<SyncErrorCategory, number> = {
    USERNAME_NOT_FOUND: 0,
    RATE_LIMITED: 0,
    NETWORK_TIMEOUT: 0,
    DATA_PARSING_ERROR: 0,
    OTHER: 0,
  };

  const recentErrors = recentFailedRecords.map((acc) => {
    const category = categorizeSyncError(acc.lastSyncError);
    errorDistribution[category]++;

    return {
      id: acc.id,
      accountId: acc.id,
      userId: acc.userId,
      username: acc.username,
      displayName: acc.user.profile?.displayName || acc.username,
      userEmail: acc.user.email,
      error: acc.lastSyncError || "Unknown synchronization error",
      category,
      lastSyncAt: acc.lastSyncAt ? acc.lastSyncAt.toISOString() : null,
      failedAt: acc.updatedAt.toISOString(),
    };
  });

  return {
    totalAccounts,
    syncedLast24h,
    successLast24h,
    failedLast24h,
    pendingCount,
    inProgressCount,
    staleCount: staleAccounts,
    successRate,
    circuitBreaker: globalSyncCircuitBreaker.getMetrics(),
    errorDistribution,
    recentErrors,
  };
}

/**
 * Triggers an on-demand synchronization for a specific user (FR-612).
 */
export async function triggerUserManualSync(
  adminUserId: string,
  targetUserId: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  // 1. Circuit breaker guard
  const breakerCheck = globalSyncCircuitBreaker.canExecute();
  if (!breakerCheck.allowed) {
    throw new Error(breakerCheck.reason || "Sync temporarily throttled by circuit breaker.");
  }

  // 2. Fetch user's linked coding account
  const account = await db.linkedCodingAccount.findFirst({
    where: { userId: targetUserId },
  });

  if (!account) {
    throw new Error("Target user has no linked LeetCode account.");
  }

  // 3. Execute sync
  const result = await syncUserLeetCodeData(account.id);
  globalSyncCircuitBreaker.recordResult(result.success, result.error);

  // 4. Record immutable audit log
  await recordAuditLog({
    adminUserId,
    actionType: "SYNC_TRIGGER",
    targetType: "User",
    targetId: targetUserId,
    afterState: {
      accountId: account.id,
      username: account.username,
      success: result.success,
      error: result.error ?? null,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  if (!result.success) {
    throw new Error(result.error || "Manual sync failed.");
  }

  return {
    success: true,
    accountId: account.id,
    username: account.username,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * Initiates a throttled platform-wide batch sync (Super Admin only, FR-613, SC-608).
 */
export async function triggerPlatformBatchSync(
  adminUserId: string,
  confirmationText: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  // 1. Validate confirmation text
  if (!validateBatchConfirmation(confirmationText)) {
    throw new Error('Batch sync requires exact confirmation text: "CONFIRM"');
  }

  // 2. Check circuit breaker
  const breakerCheck = globalSyncCircuitBreaker.canExecute();
  if (!breakerCheck.allowed) {
    throw new Error(breakerCheck.reason || "Batch sync blocked: Circuit breaker is OPEN.");
  }

  // 3. Query all linked accounts needing refresh
  const accounts = await db.linkedCodingAccount.findMany({
    select: { id: true, username: true, userId: true },
    orderBy: { lastSyncAt: "asc" },
  });

  const totalTargeted = accounts.length;
  if (totalTargeted === 0) {
    return { success: true, message: "No linked accounts found to synchronize.", totalTargeted: 0 };
  }

  // 4. Record audit log before dispatching
  await recordAuditLog({
    adminUserId,
    actionType: "BATCH_SYNC_TRIGGER",
    targetType: "Platform",
    targetId: "ALL_LINKED_ACCOUNTS",
    afterState: {
      totalTargeted,
      status: "DISPATCHED",
      timestamp: new Date().toISOString(),
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  // 5. Throttled sequential execution in background/async
  // To avoid holding the HTTP request indefinitely on large batches,
  // we dispatch and process the batch asynchronously with throttling.
  const batchPromise = (async () => {
    let successCount = 0;
    let failedCount = 0;

    for (const acc of accounts) {
      // Check breaker before each attempt
      if (!globalSyncCircuitBreaker.canExecute().allowed) {
        console.warn("[BatchSync] Circuit breaker tripped during batch execution. Halting.");
        break;
      }

      try {
        const res = await syncUserLeetCodeData(acc.id);
        globalSyncCircuitBreaker.recordResult(res.success, res.error);
        if (res.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }

      // Throttle delay: 250ms between requests to respect remote rate limits
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    console.log(`[BatchSync] Completed: ${successCount} successful, ${failedCount} failed of ${totalTargeted}`);
  })();

  // Fire-and-forget background worker execution
  batchPromise.catch((err) => {
    console.error("[BatchSync] Unexpected error during batch processing:", err);
  });

  return {
    success: true,
    message: `Batch platform sync dispatched for ${totalTargeted} accounts with rate-limit throttling.`,
    totalTargeted,
    status: "DISPATCHED",
  };
}

/**
 * Resets the sync circuit breaker.
 */
export async function resetSyncCircuitBreaker(adminUserId: string) {
  globalSyncCircuitBreaker.reset();
  return { success: true, state: globalSyncCircuitBreaker.getState() };
}
