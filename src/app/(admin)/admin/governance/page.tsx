import { assertSuperAdmin } from "@/server/auth/rbac";
import { getAdministrativeUsers } from "@/server/services/admin-role.service";
import { AdminRoleManager } from "@/components/admin/AdminRoleManager";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Access Governance & RBAC | CodeRank Admin",
  description: "Enforce two-tier administrative RBAC, prevent last Super Admin lockout, and govern role access.",
};

export default async function AdminGovernancePage() {
  const admin = await assertSuperAdmin();
  const governanceData = await getAdministrativeUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <ShieldAlert className="h-4 w-4" />
          <span>Role-Based Access Control & Governance</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Administrator Access Governance
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Enforce two-tier RBAC, assign or revoke administrative roles, and guarantee zero Super Administrator lockout defense.
        </p>
      </div>

      <AdminRoleManager
        initialData={governanceData}
        currentUserId={admin.id}
      />
    </div>
  );
}
