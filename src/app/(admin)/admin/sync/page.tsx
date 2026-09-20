import { assertAdmin } from "@/server/auth/rbac";
import { getSyncHealthMetrics } from "@/server/services/admin-sync.service";
import { SyncHealthDashboard } from "@/components/admin/SyncHealthDashboard";
import { RefreshCw } from "lucide-react";
import { Role } from "@prisma/client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sync Operations & Health | CodeRank Admin",
  description: "Real-time visibility into queue health, error logs, and on-demand sync triggers.",
};

export default async function AdminSyncPage() {
  const admin = await assertAdmin();
  const isSuperAdmin = admin.role === Role.SUPER_ADMIN;

  const metrics = await getSyncHealthMetrics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <RefreshCw className="h-4 w-4" />
          <span>Background Workers & Data Integrity</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Sync Operations & Queue Health
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Monitor LeetCode synchronization performance, inspect rate-limiting and failure logs, and dispatch manual or batch sync cycles.
        </p>
      </div>

      <SyncHealthDashboard
        initialMetrics={metrics}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
