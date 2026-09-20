import { assertAdmin } from "@/server/auth/rbac";
import { listUsersForAdmin } from "@/server/services/admin-user.service";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import type { AccountStatus, Gender, Role } from "@prisma/client";
import { Users } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "User Management | CodeRank Admin",
  description: "Search, filter, edit profile metadata, and manage account statuses.",
};

interface AdminUsersPageProps {
  searchParams: Promise<{
    search?: string;
    branch?: string;
    batch?: string;
    gender?: string;
    status?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await assertAdmin();

  const resolved = await searchParams;
  const page = parseInt(resolved.page || "1", 10);
  const batch = resolved.batch ? parseInt(resolved.batch, 10) : undefined;
  const gender = (resolved.gender as Gender) || undefined;
  const status = (resolved.status as AccountStatus) || undefined;
  const role = (resolved.role as Role) || undefined;

  const { users, total, totalPages, pageSize } = await listUsersForAdmin({
    search: resolved.search,
    branch: resolved.branch,
    batch,
    gender,
    status,
    role,
    page,
    pageSize: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
          <Users className="h-4 w-4" />
          <span>Account Moderation</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          User Account Management
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Inspect student profiles, correct academic department details, and moderate accounts.
        </p>
      </div>

      <UserManagementTable
        initialUsers={users}
        initialTotal={total}
        initialPage={page}
        initialPageSize={pageSize}
        totalPages={totalPages}
      />
    </div>
  );
}
