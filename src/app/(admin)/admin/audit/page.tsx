import { assertAdmin } from "@/server/auth/rbac";
import { searchAuditLogs } from "@/server/services/admin-audit.service";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { History } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log Explorer | CodeRank Admin",
  description: "Immutable forensic audit trail capturing administrative mutations and state diffs.",
};

export default async function AdminAuditPage() {
  await assertAdmin();

  const initialResult = await searchAuditLogs({ page: 1, pageSize: 20 });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <History className="h-4 w-4" />
          <span>Forensic Compliance & Transparency</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Audit Log Explorer
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inspect immutable records of administrative actions with full actor attribution, timestamps, and JSON before/after state diffs.
        </p>
      </div>

      <AuditLogViewer initialResult={initialResult} />
    </div>
  );
}
