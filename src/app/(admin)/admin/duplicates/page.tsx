import { assertAdmin } from "@/server/auth/rbac";
import { findDuplicateConflicts } from "@/server/services/duplicate.service";
import { DuplicateConflictsClient } from "@/components/admin/DuplicateConflictsClient";
import { Copy } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duplicate Accounts & Conflicts | CodeRank Admin",
  description: "Detect contested LeetCode usernames across multiple accounts and unlink handles safely.",
};

export default async function AdminDuplicatesPage() {
  await assertAdmin();

  const conflicts = await findDuplicateConflicts();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Copy className="h-4 w-4" />
          <span>Identity Verification & Conflict Resolution</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Duplicate Accounts Queue
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Identify contested LeetCode usernames, compare registration evidence, and resolve claims by unlinking handles or deactivating duplicates.
        </p>
      </div>

      <DuplicateConflictsClient initialConflicts={conflicts} />
    </div>
  );
}
