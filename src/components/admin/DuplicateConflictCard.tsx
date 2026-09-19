"use client";

import { useState } from "react";
import type { DuplicateConflictGroup, DuplicateAccountInfo } from "@/server/services/duplicate.service";
import {
  AlertTriangle,
  Unlink,
  UserX,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { StepUpConfirmModal } from "@/components/ui/StepUpConfirmModal";

interface DuplicateConflictCardProps {
  conflict: DuplicateConflictGroup;
  onResolved: (handle: string, resolvedUserId: string) => void;
}

export function DuplicateConflictCard({
  conflict,
  onResolved,
}: DuplicateConflictCardProps) {
  const [selectedAccount, setSelectedAccount] = useState<DuplicateAccountInfo | null>(null);
  const [actionType, setActionType] = useState<"UNLINK" | "DISABLE">("UNLINK");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAction = (account: DuplicateAccountInfo, action: "UNLINK" | "DISABLE") => {
    setSelectedAccount(account);
    setActionType(action);
    setResolutionNote("");
    setIsModalOpen(true);
  };

  const handleExecuteResolution = async () => {
    if (!selectedAccount) return;
    if (!resolutionNote.trim() || resolutionNote.trim().length < 5) {
      alert("Please provide an administrative resolution note of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/duplicates/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: selectedAccount.userId,
          action: actionType,
          resolutionNote: resolutionNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve conflict.");
      }

      onResolved(conflict.leetcodeUsername, selectedAccount.userId);
      setIsModalOpen(false);
      setSelectedAccount(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error executing resolution.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-amber-900/40 bg-zinc-900/60 overflow-hidden backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 bg-amber-950/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Contested Handle:
              </span>
              <a
                href={`https://leetcode.com/u/${encodeURIComponent(conflict.leetcodeUsername)}/`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm font-bold text-zinc-100 hover:text-indigo-400 flex items-center gap-1"
              >
                @{conflict.leetcodeUsername}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400">
              Claimed by {conflict.accounts.length} registered student accounts.
            </p>
          </div>
        </div>

        <span className="rounded-full px-3 py-1 text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-300 self-start sm:self-auto">
          {conflict.accounts.length} Conflicting Accounts
        </span>
      </div>

      {/* Account Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/80 p-6 gap-6">
        {conflict.accounts.map((acc, idx) => {
          const isVerified = acc.hasVerifiedLink;
          return (
            <div key={acc.userId} className="flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Account Candidate #{idx + 1}
                  </span>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified Platform Link
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-100">{acc.displayName}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{acc.email}</p>
                </div>

                {/* Metadata List */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Registered
                    </span>
                    <p className="font-medium text-zinc-200 mt-0.5">
                      {new Date(acc.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Last Synced
                    </span>
                    <p className="font-medium text-zinc-200 mt-0.5">
                      {acc.lastSyncAt ? new Date(acc.lastSyncAt).toLocaleDateString() : "Never"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                    <span className="text-[10px] text-zinc-500">Problems Solved</span>
                    <p className="font-medium text-zinc-200 mt-0.5">{acc.totalSolved}</p>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
                    <span className="text-[10px] text-zinc-500">Contest Rating</span>
                    <p className="font-medium text-zinc-200 mt-0.5">
                      {acc.contestRating ? Math.round(acc.contestRating) : "Unrated"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => handleOpenAction(acc, "UNLINK")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 active:scale-[0.98] transition-all"
                >
                  <Unlink className="h-3.5 w-3.5 text-amber-400" />
                  <span>Unlink (Reset Stats)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAction(acc, "DISABLE")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 active:scale-[0.98] transition-all"
                >
                  <UserX className="h-3.5 w-3.5 text-rose-400" />
                  <span>Disable</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step-Up Resolution Modal */}
      {selectedAccount && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="flex flex-col w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">
                  {actionType === "UNLINK" ? "Unlink Contested Handle" : "Disable Duplicate Account"}
                </h3>
                <p className="text-xs text-zinc-400">{selectedAccount.displayName} ({selectedAccount.email})</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {actionType === "UNLINK"
                ? `Unlinking will disconnect @${conflict.leetcodeUsername}, reset synced statistics to 0, and transition this account to "Pending LeetCode Link" so the student can link their actual username.`
                : `Disabling will revoke active sessions and hide this duplicate account from leaderboards while preserving audit records.`}
            </p>

            {/* Mandatory Resolution Note (FR-606) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Mandatory Resolution Note <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain why this account was chosen for unlinking or deactivation..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-zinc-500">Minimum 5 characters required for administrative audit.</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting || resolutionNote.trim().length < 5}
                onClick={handleExecuteResolution}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {isSubmitting ? "Executing..." : "Confirm Resolution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
