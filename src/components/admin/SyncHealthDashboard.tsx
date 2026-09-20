"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Zap,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";
import { StepUpConfirmModal } from "@/components/ui/StepUpConfirmModal";
import type { SyncHealthMetrics } from "@/server/services/admin-sync.service";
import type { SyncErrorCategory } from "@/lib/sync-circuit-breaker";

interface SyncHealthDashboardProps {
  initialMetrics: SyncHealthMetrics;
  isSuperAdmin: boolean;
}

const CATEGORY_CONFIG: Record<
  SyncErrorCategory,
  { label: string; color: string; bg: string; border: string }
> = {
  USERNAME_NOT_FOUND: {
    label: "Username Not Found",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  RATE_LIMITED: {
    label: "Rate Limited (429)",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  NETWORK_TIMEOUT: {
    label: "Network Timeout",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
  DATA_PARSING_ERROR: {
    label: "Parsing Error",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  OTHER: {
    label: "Other Errors",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
  },
};

export function SyncHealthDashboard({
  initialMetrics,
  isSuperAdmin,
}: SyncHealthDashboardProps) {
  const [metrics, setMetrics] = useState<SyncHealthMetrics>(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncingUserIds, setSyncingUserIds] = useState<Set<string>>(new Set());
  const [syncFeedback, setSyncFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Batch sync modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isBatchPending, setIsBatchPending] = useState(false);

  // Reset breaker state
  const [isResettingBreaker, setIsResettingBreaker] = useState(false);

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/sync/health");
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to refresh sync metrics:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualSync = async (userId: string, username: string) => {
    setSyncingUserIds((prev) => new Set(prev).add(userId));
    setSyncFeedback(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/sync`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize user.");
      }

      setSyncFeedback({
        type: "success",
        message: `Successfully synchronized ${username} with LeetCode.`,
      });
      await refreshMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Synchronization failed.";
      setSyncFeedback({
        type: "error",
        message: `Sync failed for ${username}: ${msg}`,
      });
    } finally {
      setSyncingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleResetBreaker = async () => {
    setIsResettingBreaker(true);
    try {
      const res = await fetch("/api/admin/sync/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_BREAKER" }),
      });
      if (res.ok) {
        await refreshMetrics();
        setSyncFeedback({
          type: "success",
          message: "Rate-limit circuit breaker has been reset to CLOSED.",
        });
      }
    } catch (err) {
      console.error("Failed to reset circuit breaker:", err);
    } finally {
      setIsResettingBreaker(false);
    }
  };

  const handleBatchSyncConfirm = async () => {
    setIsBatchPending(true);
    try {
      const res = await fetch("/api/admin/sync/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "CONFIRM" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Batch sync dispatch failed.");
      }

      setSyncFeedback({
        type: "success",
        message: data.message || "Batch platform sync dispatched successfully.",
      });
      setIsBatchModalOpen(false);
      await refreshMetrics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Batch sync failed.";
      setSyncFeedback({
        type: "error",
        message: msg,
      });
      setIsBatchModalOpen(false);
    } finally {
      setIsBatchPending(false);
    }
  };

  const isBreakerOpen = metrics.circuitBreaker.state === "OPEN";
  const isBreakerHalfOpen = metrics.circuitBreaker.state === "HALF_OPEN";

  return (
    <div className="space-y-6">
      {/* Alert banner if feedback present */}
      {syncFeedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border text-xs animate-in fade-in duration-150 ${
            syncFeedback.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/30 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {syncFeedback.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Circuit Breaker Warning Banner if OPEN */}
      {isBreakerOpen && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-red-200">
                Rate-Limit Circuit Breaker is OPEN
              </p>
              <p className="text-red-300/80 mt-0.5">
                External LeetCode API responded with repeated rate-limiting (429). Outgoing
                syncs are temporarily throttled to prevent IP bans.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetBreaker}
            disabled={isResettingBreaker}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Breaker</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Accounts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Total Accounts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{metrics.totalAccounts}</p>
          <span className="text-[11px] text-slate-500">Registered coders</span>
        </div>

        {/* Synced in 24h */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Synced (24h)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{metrics.syncedLast24h}</p>
          <span className="text-[11px] text-emerald-500/70">Fresh submissions loaded</span>
        </div>

        {/* Success Rate */}
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Success Rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-300">{metrics.successRate}%</p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                metrics.successRate >= 90
                  ? "bg-emerald-400"
                  : metrics.successRate >= 75
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
              style={{ width: `${metrics.successRate}%` }}
            />
          </div>
        </div>

        {/* Stale Accounts */}
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Stale (&gt;24h)</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-300">{metrics.staleCount}</p>
          <span className="text-[11px] text-amber-500/70">Due for sync cycle</span>
        </div>

        {/* Active Failures */}
        <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-4 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
            <XCircle className="w-4 h-4" />
            <span>Failed Jobs</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-300">{metrics.failedLast24h}</p>
          <span className="text-[11px] text-red-500/70">Requires inspection</span>
        </div>
      </div>

      {/* Control Actions & Circuit Breaker Status */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-4">
          {/* Circuit Breaker Status Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Circuit Breaker:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isBreakerOpen
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : isBreakerHalfOpen
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBreakerOpen
                    ? "bg-red-400 animate-pulse"
                    : isBreakerHalfOpen
                    ? "bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />
              {metrics.circuitBreaker.state}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Consecutive 429s:{" "}
            <span className="font-mono text-slate-300 font-semibold">
              {metrics.circuitBreaker.consecutiveRateLimits}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Refresh button */}
          <button
            type="button"
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Batch Sync Button (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Batch Platform Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Categorization & Distribution Panel (SC-607) */}
      <div className="border border-slate-800 rounded-xl p-5 bg-slate-900/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Error Categorization & Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live classification of failed synchronization jobs (SC-607).
            </p>
          </div>
        </div>

        {/* Category breakdown badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(CATEGORY_CONFIG) as SyncErrorCategory[]).map((cat) => {
            const count = metrics.errorDistribution[cat] || 0;
            const config = CATEGORY_CONFIG[cat];
            return (
              <div
                key={cat}
                className={`p-3 rounded-lg border ${config.bg} ${config.border} flex flex-col justify-between`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {config.label}
                </span>
                <p className={`text-xl font-bold mt-1 ${config.color}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Synchronization Errors Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Recent Sync Failures & Error Logs</h3>
            <p className="text-xs text-slate-400">
              Inspect failure reasons and trigger on-demand priority syncs for affected students.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {metrics.recentErrors.length} logged
          </span>
        </div>

        {metrics.recentErrors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-40" />
            <p className="text-slate-300 font-medium text-sm">All synchronization queues healthy</p>
            <p className="text-slate-500 mt-1">
              Zero active failure logs recorded in the current window.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User / Handle</th>
                  <th className="py-3 px-4">Error Category</th>
                  <th className="py-3 px-4">Failure Details</th>
                  <th className="py-3 px-4">Last Attempted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {metrics.recentErrors.map((err) => {
                  const isSyncing = syncingUserIds.has(err.userId);
                  const config = CATEGORY_CONFIG[err.category] || CATEGORY_CONFIG.OTHER;

                  return (
                    <tr key={err.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* User / Handle */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{err.displayName}</div>
                        <div className="text-[11px] font-mono text-amber-400/90">
                          @{err.username}
                        </div>
                        <div className="text-[10px] text-slate-500">{err.userEmail}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} ${config.border}`}
                        >
                          {config.label}
                        </span>
                      </td>

                      {/* Error Message Snippet */}
                      <td className="py-3.5 px-4">
                        <code className="bg-slate-950/70 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono text-red-300 max-w-md block truncate">
                          {err.error}
                        </code>
                      </td>

                      {/* Last Attempted */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(err.failedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleManualSync(err.userId, err.username)}
                          disabled={isSyncing || isBreakerOpen}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isSyncing ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Syncing...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" />
                              <span>Manual Sync</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Step-Up Confirmation Modal for Batch Platform Sync (SC-608) */}
      <StepUpConfirmModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleBatchSyncConfirm}
        title="Trigger Batch Platform Synchronization"
        description="This operation dispatches background synchronizations across all registered student accounts. Worker execution will be throttled to prevent remote LeetCode API rate-limiting."
        confirmWord="CONFIRM"
        isDestructive={false}
        isPending={isBatchPending}
      />
    </div>
  );
}
