"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Search,
  Plus,
  AlertTriangle,
  Check,
  AlertCircle,
  Loader2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StepUpConfirmModal } from "@/components/ui/StepUpConfirmModal";
import type { AdminGovernanceData, AdminUserRecord } from "@/server/services/admin-role.service";

interface AdminRoleManagerProps {
  initialData: AdminGovernanceData;
  currentUserId: string;
}

interface CandidateUser {
  id: string;
  email: string;
  displayName: string;
  branch: string;
  role: string;
}

export function AdminRoleManager({ initialData, currentUserId }: AdminRoleManagerProps) {
  const [data, setData] = useState<AdminGovernanceData>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState<CandidateUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected candidate for promotion
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateUser | null>(null);
  const [newAssignRole, setNewAssignRole] = useState<"PLATFORM_ADMIN" | "SUPER_ADMIN">(
    "PLATFORM_ADMIN"
  );

  // Pending action for StepUp modal
  const [pendingAction, setPendingAction] = useState<{
    targetUserId: string;
    targetUserName: string;
    newRole: "STUDENT" | "PLATFORM_ADMIN" | "SUPER_ADMIN";
    actionDescription: string;
  } | null>(null);

  const [isActionPending, setIsActionPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const refreshData = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const json = await res.json();
      if (json.success) {
        setData({
          superAdminCount: json.superAdminCount,
          platformAdminCount: json.platformAdminCount,
          totalAdminCount: json.totalAdminCount,
          admins: json.admins,
        });
      }
    } catch (err) {
      console.error("Failed to refresh governance data:", err);
    }
  };

  // Debounced search for candidate students
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setCandidates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/roles?search=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.candidates)) {
          setCandidates(json.candidates);
        }
      } catch (err) {
        console.error("Failed to search candidates:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAssignModal = () => {
    if (!selectedCandidate) return;
    setPendingAction({
      targetUserId: selectedCandidate.id,
      targetUserName: `${selectedCandidate.displayName} (${selectedCandidate.email})`,
      newRole: newAssignRole,
      actionDescription: `Granting administrative tier "${newAssignRole}" to ${selectedCandidate.displayName}.`,
    });
  };

  const handleOpenRoleChange = (
    user: AdminUserRecord,
    newRole: "STUDENT" | "PLATFORM_ADMIN" | "SUPER_ADMIN"
  ) => {
    const verb = newRole === "STUDENT" ? "Revoking admin privileges from" : `Changing role to ${newRole} for`;
    setPendingAction({
      targetUserId: user.id,
      targetUserName: `${user.displayName} (${user.email})`,
      newRole,
      actionDescription: `${verb} ${user.displayName}.`,
    });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsActionPending(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: pendingAction.targetUserId,
          newRole: pendingAction.newRole,
          confirmation: "CONFIRM",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update role.");
      }

      setFeedback({
        type: "success",
        message: `Role successfully updated for ${pendingAction.targetUserName}.`,
      });

      setPendingAction(null);
      setSelectedCandidate(null);
      setSearchQuery("");
      await refreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute role change.";
      setFeedback({ type: "error", message: msg });
      setPendingAction(null);
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border text-xs animate-in fade-in duration-150 ${
            feedback.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/30 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Super Admins */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Crown className="w-4 h-4" />
              <span>Super Administrators</span>
            </div>
            {data.superAdminCount <= 1 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300">
                <Lock className="w-3 h-3" />
                Lockout Guard
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{data.superAdminCount}</p>
          <span className="text-[11px] text-slate-500">
            {data.superAdminCount <= 1
              ? "Minimum threshold reached: Demotion locked"
              : "Full platform & access governance rights"}
          </span>
        </div>

        {/* Platform Admins */}
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Platform Administrators</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-300">{data.platformAdminCount}</p>
          <span className="text-[11px] text-slate-500">
            Operational privileges (Moderation & Sync)
          </span>
        </div>

        {/* Total Admin Accounts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <span>Total Privileged Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{data.totalAdminCount}</p>
          <span className="text-[11px] text-slate-500">Authorized administrative personnel</span>
        </div>
      </div>

      {/* Admin Role Assignment / Promotion Form */}
      <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Grant Administrative Role</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Search for an active student account to promote to Platform Administrator or Super
            Administrator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          {/* Search Input with Autocomplete */}
          <div className="relative md:col-span-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedCandidate(null);
                }}
                placeholder="Search student by name or email..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-amber-400" />
              )}
            </div>

            {/* Dropdown candidates */}
            {candidates.length > 0 && !selectedCandidate && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-lg bg-slate-900 border border-slate-700 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-800 text-xs">
                {candidates.map((cand) => (
                  <button
                    key={cand.id}
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setSearchQuery(`${cand.displayName} (${cand.email})`);
                      setCandidates([]);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{cand.displayName}</div>
                      <div className="text-[11px] text-slate-400">{cand.email}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                      {cand.branch}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Tier Selector */}
          <div className="md:col-span-4">
            <select
              value={newAssignRole}
              onChange={(e) => setNewAssignRole(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/80"
            >
              <option value="PLATFORM_ADMIN">Platform Administrator (Operational)</option>
              <option value="SUPER_ADMIN">Super Administrator (Full Privileges)</option>
            </select>
          </div>

          {/* Submit Grant Button */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleOpenAssignModal}
              disabled={!selectedCandidate}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <UserCheck className="w-4 h-4" />
              <span>Grant Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Administrators Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Authorized Administrators</h3>
            <p className="text-xs text-slate-400">
              Users possessing elevated privileges across moderation, sync, and system configuration.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {data.admins.length} active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Access Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Audit Actions</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4 text-right">Access Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.admins.map((u) => {
                const isCurrent = u.id === currentUserId;
                const isSuper = u.role === "SUPER_ADMIN";
                const isLastSuper = isSuper && data.superAdminCount <= 1;

                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{u.displayName}</span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Crown className="w-3 h-3" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          <Shield className="w-3 h-3" />
                          Platform Admin
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Audit count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                        {u.auditActionCount}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isSuper ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenRoleChange(u, "PLATFORM_ADMIN")}
                              disabled={isLastSuper}
                              title={
                                isLastSuper
                                  ? "Cannot demote the last remaining Super Administrator."
                                  : "Demote to Platform Admin"
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-amber-300 border border-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              <span>Demote to Platform</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRoleChange(u, "STUDENT")}
                              disabled={isLastSuper}
                              title={
                                isLastSuper
                                  ? "Cannot revoke the last remaining Super Administrator."
                                  : "Revoke admin privileges"
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenRoleChange(u, "SUPER_ADMIN")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Promote to Super</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRoleChange(u, "STUDENT")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-500/30 transition-colors"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-Up Confirmation Modal for Role Changes (SC-608) */}
      <StepUpConfirmModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title="Confirm Administrative Role Modification"
        description={`${pendingAction?.actionDescription || ""} This will immediately alter access permissions and will be permanently recorded in the immutable audit log.`}
        confirmWord="CONFIRM"
        isDestructive={pendingAction?.newRole === "STUDENT"}
        isPending={isActionPending}
      />
    </div>
  );
}
