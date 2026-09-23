"use client";

import { useState } from "react";
import type { AdminUserListItemDTO } from "@/types/admin";
import { EditUserModal } from "./EditUserModal";
import { StepUpConfirmModal } from "@/components/ui/StepUpConfirmModal";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface UserManagementTableProps {
  initialUsers: AdminUserListItemDTO[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
  totalPages: number;
}

export function UserManagementTable({
  initialUsers,
  initialTotal,
  initialPage,
  initialPageSize,
  totalPages,
}: UserManagementTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<AdminUserListItemDTO[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<AdminUserListItemDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status toggle confirmation state
  const [statusTargetUser, setStatusTargetUser] = useState<AdminUserListItemDTO | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusActionPending, setStatusActionPending] = useState(false);

  // Delete confirmation state
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUserListItemDTO | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteActionPending, setDeleteActionPending] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [genderFilter, setGenderFilter] = useState(searchParams.get("gender") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");

    if (statusFilter) params.set("status", statusFilter);
    else params.delete("status");

    if (genderFilter) params.set("gender", genderFilter);
    else params.delete("gender");

    if (roleFilter) params.set("role", roleFilter);
    else params.delete("role");

    params.set("page", "1");
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleUserUpdated = (updatedData: Partial<AdminUserListItemDTO>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedData.id ? { ...u, ...updatedData } : u))
    );
  };

  const handleStatusToggleConfirm = async () => {
    if (!statusTargetUser) return;
    setStatusActionPending(true);

    const newStatus = statusTargetUser.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    try {
      const res = await fetch(`/api/admin/users/${statusTargetUser.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === statusTargetUser.id ? { ...u, status: newStatus } : u))
      );
      setIsStatusModalOpen(false);
      setStatusTargetUser(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to toggle account status.");
    } finally {
      setStatusActionPending(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetUser) return;
    setDeleteActionPending(true);

    try {
      const res = await fetch(`/api/admin/users/${deleteTargetUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      setIsDeleteModalOpen(false);
      setDeleteTargetUser(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete account.");
    } finally {
      setDeleteActionPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Filter Header Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-md"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, or LeetCode username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="PLATFORM_ADMIN">Platform Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {/* Users Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-400">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-5 py-3.5">Student / User</th>
                <th className="px-5 py-3.5">LeetCode Handle</th>
                <th className="px-5 py-3.5">Academic</th>
                <th className="px-5 py-3.5">Coding Stats</th>
                <th className="px-5 py-3.5">Status & Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = u.status === "ACTIVE";
                  const isSuperAdmin = u.role === "SUPER_ADMIN";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-zinc-100">{u.displayName}</span>
                          <span className="text-[11px] text-zinc-500">{u.email}</span>
                        </div>
                      </td>

                      {/* LeetCode */}
                      <td className="px-5 py-4">
                        {u.leetcodeUsername ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-zinc-200">@{u.leetcodeUsername}</span>
                            <a
                              href={`https://leetcode.com/u/${encodeURIComponent(u.leetcodeUsername)}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-indigo-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Unlinked</span>
                        )}
                      </td>

                      {/* Academic */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5 text-[11px]">
                          <span className="text-zinc-300">{u.branch ?? "Branch unset"}</span>
                          <span className="text-zinc-500">
                            {u.admissionYear ? `Class of ${u.graduationYear ?? u.admissionYear + 4}` : "Batch unset"}
                            {u.gender && ` • ${u.gender}`}
                          </span>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase">Solved</span>
                            <p className="font-semibold text-zinc-200">{u.totalSolved}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase">Rating</span>
                            <p className="font-semibold text-zinc-200">
                              {u.contestRating ? Math.round(u.contestRating) : "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status & Role */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              isActive
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {u.status}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                              isSuperAdmin
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                : u.role === "PLATFORM_ADMIN"
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                                : "border-zinc-800 bg-zinc-800/50 text-zinc-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit Profile"
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStatusTargetUser(u);
                              setIsStatusModalOpen(true);
                            }}
                            title={isActive ? "Disable Account" : "Activate Account"}
                            className={`rounded-lg p-1.5 transition-colors ${
                              isActive
                                ? "text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-300"
                                : "text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-300"
                            }`}
                          >
                            {isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetUser(u);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete Account"
                            className="rounded-lg p-1.5 text-red-400/80 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3.5 text-xs text-zinc-400">
          <span>
            Showing <span className="font-semibold text-zinc-200">{users.length}</span> of{" "}
            <span className="font-semibold text-zinc-200">{initialTotal}</span> users
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={initialPage <= 1}
              onClick={() => handlePageChange(initialPage - 1)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-xs text-zinc-400">
              Page {initialPage} of {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={initialPage >= totalPages}
              onClick={() => handlePageChange(initialPage + 1)}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleUserUpdated}
      />

      {/* Status Toggle Step-Up Modal (if disabling account) */}
      <StepUpConfirmModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTargetUser(null);
        }}
        onConfirm={handleStatusToggleConfirm}
        title={
          statusTargetUser?.status === "ACTIVE"
            ? `Disable User: ${statusTargetUser?.displayName}`
            : `Re-activate User: ${statusTargetUser?.displayName}`
        }
        description={
          statusTargetUser?.status === "ACTIVE"
            ? `Disabling this account will immediately revoke all active sessions, block future logins, and remove the student from collegiate leaderboards and Gender War calculations.`
            : `Re-activating this account will restore student access and re-include the user in college rankings.`
        }
        confirmWord="CONFIRM"
        isDestructive={statusTargetUser?.status === "ACTIVE"}
        isPending={statusActionPending}
      />

      {/* Delete User Step-Up Modal */}
      <StepUpConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Permanently Delete User: ${deleteTargetUser?.displayName}`}
        description="Deleting this account is permanent and irreversible. All associated coding accounts, stats, and achievements will be destroyed. This action cannot be undone."
        confirmWord="DELETE"
        isDestructive={true}
        isPending={deleteActionPending}
      />
    </div>
  );
}
