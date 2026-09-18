// T017: 24-hour unverified account purge (FR-033)
// This can be run as a cron job or API route handler.
// Deletes unverified accounts older than 24 hours, freeing their email.

import { db } from "@/lib/db";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export async function purgeUnverifiedAccounts(): Promise<number> {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS);

  const result = await db.user.deleteMany({
    where: {
      emailVerified: null,
      status: "PENDING_VERIFICATION",
      createdAt: { lt: cutoff },
    },
  });

  console.log(`[PURGE] Deleted ${result.count} unverified accounts older than 24 hours.`);

  return result.count;
}