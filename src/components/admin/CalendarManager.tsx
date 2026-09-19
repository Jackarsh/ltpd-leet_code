"use client";

import React, { useState } from "react";
import {
  Calendar,
  Building2,
  Plus,
  Edit2,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  Check,
  Tag,
  Layers,
} from "lucide-react";
import { validateDateSequence } from "@/lib/calendar-validator";

export interface AcademicPeriodRecord {
  id: string;
  name: string;
  periodType: "SEMESTER" | "ACADEMIC_YEAR";
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicBranchRecord {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CalendarManagerProps {
  initialPeriods: AcademicPeriodRecord[];
  initialBranches: AcademicBranchRecord[];
  initialCurrentSemester: AcademicPeriodRecord | null;
  initialCurrentYear: AcademicPeriodRecord | null;
}

export function CalendarManager({
  initialPeriods,
  initialBranches,
  initialCurrentSemester,
  initialCurrentYear,
}: CalendarManagerProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "branches">("calendar");

  const [periods, setPeriods] = useState<AcademicPeriodRecord[]>(initialPeriods);
  const [branches, setBranches] = useState<AcademicBranchRecord[]>(initialBranches);
  const [currentSemester, setCurrentSemester] = useState<AcademicPeriodRecord | null>(
    initialCurrentSemester
  );
  const [currentYear, setCurrentYear] = useState<AcademicPeriodRecord | null>(initialCurrentYear);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Period Modal State
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriodRecord | null>(null);
  const [periodName, setPeriodName] = useState("");
  const [periodType, setPeriodType] = useState<"SEMESTER" | "ACADEMIC_YEAR">("SEMESTER");
  const [periodStartDate, setPeriodStartDate] = useState("");
  const [periodEndDate, setPeriodEndDate] = useState("");
  const [periodIsCurrent, setPeriodIsCurrent] = useState(false);
  const [isPeriodSubmitting, setIsPeriodSubmitting] = useState(false);

  // Branch Modal State
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<AcademicBranchRecord | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchDisplayOrder, setBranchDisplayOrder] = useState(0);
  const [branchIsActive, setBranchIsActive] = useState(true);
  const [isBranchSubmitting, setIsBranchSubmitting] = useState(false);

  const refreshCalendar = async () => {
    try {
      const res = await fetch("/api/admin/calendar");
      const json = await res.json();
      if (json.success) {
        setPeriods(json.periods);
        setCurrentSemester(json.currentSemester);
        setCurrentYear(json.currentYear);
      }
    } catch (err) {
      console.error("Failed to refresh calendar:", err);
    }
  };

  const refreshBranches = async () => {
    try {
      const res = await fetch("/api/admin/branches");
      const json = await res.json();
      if (json.success) {
        setBranches(json.branches);
      }
    } catch (err) {
      console.error("Failed to refresh branches:", err);
    }
  };

  // Open Period Modal
  const handleOpenCreatePeriod = () => {
    setEditingPeriod(null);
    setPeriodName("");
    setPeriodType("SEMESTER");
    setPeriodStartDate("");
    setPeriodEndDate("");
    setPeriodIsCurrent(false);
    setIsPeriodModalOpen(true);
  };

  const handleOpenEditPeriod = (p: AcademicPeriodRecord) => {
    setEditingPeriod(p);
    setPeriodName(p.name);
    setPeriodType(p.periodType);
    setPeriodStartDate(p.startDate.slice(0, 10));
    setPeriodEndDate(p.endDate.slice(0, 10));
    setPeriodIsCurrent(p.isCurrent);
    setIsPeriodModalOpen(true);
  };

  const handlePeriodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const dateCheck = validateDateSequence(periodStartDate, periodEndDate);
    if (!dateCheck.isValid) {
      setFeedback({ type: "error", message: dateCheck.error || "Invalid date range." });
      return;
    }

    setIsPeriodSubmitting(true);
    try {
      const payload = {
        id: editingPeriod?.id,
        name: periodName,
        periodType,
        startDate: periodStartDate,
        endDate: periodEndDate,
        isCurrent: periodIsCurrent,
      };

      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save period.");

      setFeedback({
        type: "success",
        message: `Academic period "${periodName}" saved successfully.`,
      });
      setIsPeriodModalOpen(false);
      await refreshCalendar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving academic period.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsPeriodSubmitting(false);
    }
  };

  // Open Branch Modal
  const handleOpenCreateBranch = () => {
    setEditingBranch(null);
    setBranchName("");
    setBranchCode("");
    setBranchDisplayOrder(branches.length + 1);
    setBranchIsActive(true);
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: AcademicBranchRecord) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code);
    setBranchDisplayOrder(b.displayOrder);
    setBranchIsActive(b.isActive);
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    setIsBranchSubmitting(true);
    try {
      const payload = {
        id: editingBranch?.id,
        name: branchName,
        code: branchCode,
        displayOrder: branchDisplayOrder,
        isActive: branchIsActive,
      };

      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save branch.");

      setFeedback({
        type: "success",
        message: `Branch "${branchName}" (${branchCode}) saved successfully.`,
      });
      setIsBranchModalOpen(false);
      await refreshBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving branch.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsBranchSubmitting(false);
    }
  };

  const handleArchiveBranch = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ARCHIVE", id }),
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          message: `Branch "${name}" archived (deactivated while preserving student records).`,
        });
        await refreshBranches();
      }
    } catch (err) {
      console.error("Failed to archive branch:", err);
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

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "calendar"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Academic Periods ({periods.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("branches")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "branches"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Academic Branches ({branches.length})</span>
          </button>
        </div>

        {activeTab === "calendar" ? (
          <button
            type="button"
            onClick={handleOpenCreatePeriod}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Period</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenCreateBranch}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch</span>
          </button>
        )}
      </div>

      {/* TAB 1: ACADEMIC CALENDAR & PERIODS */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Active Period Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Semester */}
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Current Active Semester
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Live
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-100">
                {currentSemester?.name || "No Active Semester Configured"}
              </p>
              <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {currentSemester
                    ? `${new Date(currentSemester.startDate).toLocaleDateString()} — ${new Date(
                        currentSemester.endDate
                      ).toLocaleDateString()}`
                    : "Configure a semester to drive time-filtered leaderboards"}
                </span>
              </div>
            </div>

            {/* Current Academic Year */}
            <div className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Current Academic Year
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Live
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-slate-100">
                {currentYear?.name || "No Academic Year Configured"}
              </p>
              <div className="mt-1 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {currentYear
                    ? `${new Date(currentYear.startDate).toLocaleDateString()} — ${new Date(
                        currentYear.endDate
                      ).toLocaleDateString()}`
                    : "Configure an academic year boundary"}
                </span>
              </div>
            </div>
          </div>

          {/* Periods Table */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Period Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {periods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{p.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                        {p.periodType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {new Date(p.startDate).toLocaleDateString()} &rarr;{" "}
                      {new Date(p.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Current
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPeriod(p)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMIC BRANCHES */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 text-center">Display Order</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{b.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                        {b.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {b.displayOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      {b.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBranch(b)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {b.isActive && (
                          <button
                            type="button"
                            onClick={() => handleArchiveBranch(b.id, b.name)}
                            title="Archive branch (preserves student metrics)"
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERIOD EDIT / CREATE MODAL */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handlePeriodSubmit}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>{editingPeriod ? "Edit Academic Period" : "Create Academic Period"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Period Name (e.g. Fall 2026, 2026-2027) *
                </label>
                <input
                  type="text"
                  required
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/80"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Period Type *</label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/80"
                >
                  <option value="SEMESTER">Semester</option>
                  <option value="ACADEMIC_YEAR">Academic Year</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/80"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/80"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={periodIsCurrent}
                  onChange={(e) => setPeriodIsCurrent(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">
                  Set as current active {periodType.toLowerCase().replace("_", " ")}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPeriodModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPeriodSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs disabled:opacity-50"
              >
                {isPeriodSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Period</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BRANCH EDIT / CREATE MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <form
            onSubmit={handleBranchSubmit}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{editingBranch ? "Edit Branch" : "Create Branch"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Branch Name (e.g. Computer Science & Engineering) *
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500/80"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Branch Code (e.g. CSE, IT, AI_DS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500/80"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={branchDisplayOrder}
                    onChange={(e) => setBranchDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500/80"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={branchIsActive}
                  onChange={(e) => setBranchIsActive(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Active (Visible for registration)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBranchSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs disabled:opacity-50"
              >
                {isBranchSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Branch</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
