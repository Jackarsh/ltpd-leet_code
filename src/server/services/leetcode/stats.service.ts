import { db } from "@/lib/db";
import { isDataStale } from "./sync.service";

export async function getUserCodingStats(userId: string) {
  const account = await db.linkedCodingAccount.findFirst({
    where: {
      userId,
      platform: "LEETCODE",
    },
    include: {
      statistics: true,
      submissions: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
  });

  if (!account) return null;

  return {
    id: account.id,
    username: account.username,
    isVerified: account.isVerified,
    syncStatus: account.syncStatus,
    lastSyncAt: account.lastSyncAt,
    lastSyncError: account.lastSyncError,
    isStale: isDataStale(account.lastSyncAt),
    statistics: account.statistics,
    recentSubmissions: account.submissions,
  };
}

export async function getPublicCodingStats(leetcodeUsername: string) {
  const account = await db.linkedCodingAccount.findFirst({
    where: {
      username: { equals: leetcodeUsername, mode: "insensitive" },
      platform: "LEETCODE",
    },
    include: {
      statistics: true,
      submissions: {
        orderBy: { timestamp: "desc" },
        take: 5,
      },
    },
  });

  if (!account || !account.statistics) return null;

  return {
    username: account.username,
    syncStatus: account.syncStatus,
    lastSyncAt: account.lastSyncAt,
    isStale: isDataStale(account.lastSyncAt),
    statistics: account.statistics,
    recentSubmissions: account.submissions,
  };
}