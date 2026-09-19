"use client";

import React, { useState, useEffect } from "react";
import {
  History,
  Shield,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  ArrowRight,
  Code,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type {
  AuditLogSearchResult,
  EnrichedAuditLogRecord,
} from "@/server/services/admin-audit.service";
import { formatDiffValue } from "@/lib/audit-diff";

interface AuditLogViewerProps {
  initialResult: AuditLogSearchResult;
}

const ACTION_COLORS: Record<string, { badge: string; text: string }> = {
  USER_UPDATE: { badge: "bg-blue-500/15 border-blue-500/30 text-blue-400", text: "User Edit" },
  USER_STATUS_CHANGE: {
    badge: "bg-red-500/15 border-red-500/30 text-red-400",
    text: "Status Change",
  },
  DUPLICATE_RESOLVE: {
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    text: "Duplicate Resolve",
  },
  ACHIEVEMENT_CREATE: {
    badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    text: "Badge Create",
  },
  ACHIEVEMENT_UPDATE: {
    badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    text: "Badge Update",
  },
  ACHIEVEMENT_ARCHIVE: {
    badge: "bg-slate-700/50 border-slate-600 text-slate-300",
    text: "Badge Archive",
  },
  SYNC_TRIGGER: { badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400", text: "Manual Sync" },
  BATCH_SYNC_TRIGGER: {
    badge: "bg-purple-500/15 border-purple-500/30 text-purple-400",
    text: "Batch Sync",
  },
  ROLE_GRANT: {
    badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    text: "Role Grant",
  },
  ROLE_REVOKE: { badge: "bg-red-500/15 border-red-500/30 text-red-400", text: "Role Revoke" },
};

const ACTION_TYPES = [
  "ALL",
  "USER_UPDATE",
  "USER_STATUS_CHANGE",
  "DUPLICATE_RESOLVE",
  "ACHIEVEMENT_CREATE",
  "ACHIEVEMENT_UPDATE",
  "ACHIEVEMENT_ARCHIVE",
  "SYNC_TRIGGER",
  "BATCH_SYNC_TRIGGER",
  "ROLE_GRANT",
  "ROLE_REVOKE",
];

export function AuditLogViewer({ initialResult }: AuditLogViewerProps) {
  const [result, setResult] = useState<AuditLogSearchResult>(initialResult);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedTarget, setSelectedTarget] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Selected log for detailed state diff modal
  const [inspectingLog, setInspectingLog] = useState<EnrichedAuditLogRecord | null>(null);
  const [diffViewMode, setDiffViewMode] = useState<"visual" | "raw">("visual");

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedAction !== "ALL") params.set("actionType", selectedAction);
      if (selectedTarget !== "ALL") params.set("targetType", selectedTarget);
      params.set("page", page.toString());
      params.set("pageSize", "20");

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setResult(json);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Failed to query audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Total Records */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <History className="w-4 h-4 text-amber-400" />
            <span>Audit Trail Depth</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {result.summary.totalRecords}
          </p>
          <span className="text-[11px] text-slate-500">Immutable forensic events recorded</span>
        </div>

        {/* Security & Immutability */}
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Append-Only Integrity</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">Guaranteed</p>
          <span className="text-[11px] text-emerald-500/70">
            Zero UPDATE / DELETE operations allowed
          </span>
        </div>

        {/* Audit Coverage */}
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Audit Coverage</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-300">100%</p>
          <span className="text-[11px] text-slate-500">
            Captures all admin mutations with JSON diffs
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 border border-slate-800 p-3 rounded-xl"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search target ID, admin name, or IP..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
            />
          </div>

          {/* Action Type Filter */}
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/80"
          >
            {ACTION_TYPES.map((action) => (
              <option key={action} value={action}>
                {action === "ALL" ? "All Action Types" : action.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Target Type Filter */}
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/80"
          >
            <option value="ALL">All Target Entities</option>
            <option value="User">User</option>
            <option value="Achievement">Achievement</option>
            <option value="Platform">Platform</option>
            <option value="DuplicateConflict">Duplicate Conflict</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Filter className="w-3.5 h-3.5" />
            )}
            <span>Apply Filters</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedAction("ALL");
              setSelectedTarget("ALL");
              fetchLogs(1);
            }}
            title="Reset Filters"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Audit Logs Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
        {result.logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <History className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-30" />
            <p className="text-slate-300 font-medium text-sm">No audit records found</p>
            <p className="text-slate-500 mt-1">
              No administrative mutations match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4 text-center">State Diffs</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.logs.map((log) => {
                  const actionStyle =
                    ACTION_COLORS[log.actionType] || {
                      badge: "bg-slate-800 border-slate-700 text-slate-300",
                      text: log.actionType,
                    };

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                      </td>

                      {/* Administrator */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{log.adminDisplayName}</div>
                        <div className="text-[10px] text-slate-500">{log.adminEmail}</div>
                      </td>

                      {/* Action Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${actionStyle.badge}`}
                        >
                          {actionStyle.text}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-300">{log.targetType}</div>
                        <code className="text-[10px] font-mono text-slate-500 truncate max-w-[140px] block">
                          {log.targetId}
                        </code>
                      </td>

                      {/* State Changes Pill */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            log.diff.totalChanges > 0
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {log.diff.totalChanges} {log.diff.totalChanges === 1 ? "field" : "fields"}
                        </span>
                      </td>

                      {/* Client IP */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {log.ipAddress || "127.0.0.1"}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectingLog(log)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 font-medium text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Diff</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {result.pagination.totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {result.pagination.page} of {result.pagination.totalPages} ({result.pagination.total} total logs)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage >= result.pagination.totalPages || isLoading}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* State Diff Inspector Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Audit Trail State Diff</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Action: <span className="font-semibold text-slate-200">{inspectingLog.actionType}</span> on{" "}
                  <span className="font-semibold text-slate-200">{inspectingLog.targetType}</span> ({inspectingLog.targetId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attribution Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-500 block">Administrator</span>
                <span className="text-slate-200 font-semibold">{inspectingLog.adminDisplayName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Role</span>
                <span className="text-slate-200">{inspectingLog.adminRole}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Timestamp</span>
                <span className="font-mono text-slate-300">
                  {new Date(inspectingLog.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Client IP</span>
                <span className="font-mono text-slate-300">{inspectingLog.ipAddress || "127.0.0.1"}</span>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                State Alterations ({inspectingLog.diff.totalChanges} fields)
              </span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDiffViewMode("visual")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    diffViewMode === "visual"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Visual Diff
                </button>
                <button
                  type="button"
                  onClick={() => setDiffViewMode("raw")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    diffViewMode === "raw"
                      ? "bg-amber-500/20 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  JSON Inspector
                </button>
              </div>
            </div>

            {/* Visual Diff View */}
            {diffViewMode === "visual" && (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {inspectingLog.diff.diffs.filter((d) => d.type !== "UNCHANGED").length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                    No differential changes recorded (action payload stored without mutations).
                  </div>
                ) : (
                  inspectingLog.diff.diffs
                    .filter((d) => d.type !== "UNCHANGED")
                    .map((d) => (
                      <div
                        key={d.field}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-slate-200">{d.field}</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              d.type === "ADDED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : d.type === "REMOVED"
                                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            }`}
                          >
                            {d.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          {/* Before State */}
                          <div className="p-2 rounded bg-red-950/20 border border-red-500/20 text-red-300/90 break-all">
                            <span className="text-[10px] text-red-400/60 block mb-1 uppercase font-sans font-semibold">
                              Before
                            </span>
                            {formatDiffValue(d.before)}
                          </div>

                          {/* After State */}
                          <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300/90 break-all">
                            <span className="text-[10px] text-emerald-400/60 block mb-1 uppercase font-sans font-semibold">
                              After
                            </span>
                            {formatDiffValue(d.after)}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Raw JSON View */}
            {diffViewMode === "raw" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono max-h-96 overflow-y-auto">
                <div>
                  <span className="text-slate-400 font-sans font-semibold block mb-1">
                    Before State (JSON)
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(inspectingLog.beforeState, null, 2) || "null"}
                  </pre>
                </div>
                <div>
                  <span className="text-slate-400 font-sans font-semibold block mb-1">
                    After State (JSON)
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(inspectingLog.afterState, null, 2) || "null"}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
