"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, RotateCcw, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { LeaderboardFilterParams } from "@/types/leaderboard";

interface LeaderboardFiltersProps {
  currentFilters: LeaderboardFilterParams;
}

const COMMON_BRANCHES = [
  { value: "ALL", label: "All Engineering Branches" },
  { value: "CSE", label: "Computer Science (CSE)" },
  { value: "IT", label: "Information Tech (IT)" },
  { value: "ECE", label: "Electronics (ECE)" },
  { value: "MECH", label: "Mechanical (MECH)" },
  { value: "CIVIL", label: "Civil Engineering" },
  { value: "EE", label: "Electrical (EE)" },
];

const COMMON_BATCHES = [
  { value: "ALL", label: "All Batches" },
  { value: "2024", label: "Class of 2024" },
  { value: "2025", label: "Class of 2025" },
  { value: "2026", label: "Class of 2026" },
  { value: "2027", label: "Class of 2027" },
  { value: "2028", label: "Class of 2028" },
];

export function LeaderboardFilters({ currentFilters }: LeaderboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentFilters.search || "");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ search: search.trim() });
  };

  const handleReset = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const isBranchActive = Boolean(currentFilters.branch && currentFilters.branch !== "ALL");
  const isBatchActive = Boolean(currentFilters.batch && currentFilters.batch !== "ALL");
  const isGenderActive = Boolean(currentFilters.gender);
  const isMinSolvedActive = Boolean(currentFilters.minSolved);
  const isMinRatingActive = Boolean(currentFilters.minRating);
  const isActivityActive = Boolean(currentFilters.activityStatus);
  const isSearchActive = Boolean(currentFilters.search);

  const activeFilterCount = [
    isSearchActive,
    isBranchActive,
    isBatchActive,
    isGenderActive,
    isMinSolvedActive,
    isMinRatingActive,
    isActivityActive,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-slate-800 dark:text-slate-200 transition-colors">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Filter Coders</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-bold text-blue-800 dark:text-blue-300">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Mobile Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-colors"
          >
            <span>{isMobileOpen ? "Hide" : "Filter"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isMobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter Body */}
      <div className={`mt-4 space-y-4 ${isMobileOpen ? "block" : "hidden"} lg:block`}>
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Search
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Name, handle, branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 pl-9 pr-14 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none transition-all font-medium"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateUrl({ search: "" });
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear input"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Go
            </button>
          </form>
        </div>

        {/* Branch Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isBranchActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Engineering Branch {isBranchActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.branch || "ALL"}
              onChange={(e) => updateUrl({ branch: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isBranchActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {COMMON_BRANCHES.map((b) => (
                <option key={b.value} value={b.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Batch Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isBatchActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Graduation Batch {isBatchActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.batch?.toString() || "ALL"}
              onChange={(e) => updateUrl({ batch: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isBatchActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              {COMMON_BATCHES.map((b) => (
                <option key={b.value} value={b.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isGenderActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Gender {isGenderActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.gender || "ALL"}
              onChange={(e) => updateUrl({ gender: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isGenderActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Genders</option>
              <option value="MALE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Male</option>
              <option value="FEMALE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Female</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Min Solved Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isMinSolvedActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Min Problems Solved {isMinSolvedActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.minSolved?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minSolved: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isMinSolvedActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Any Count</option>
              <option value="50" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 50 problems</option>
              <option value="100" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 100 problems</option>
              <option value="250" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 250 problems</option>
              <option value="500" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 500 problems</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isMinRatingActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Min Contest Rating {isMinRatingActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.minRating?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minRating: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isMinRatingActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Any Rating</option>
              <option value="1400" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 1400</option>
              <option value="1600" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 1600</option>
              <option value="1800" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 1800</option>
              <option value="2000" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">&ge; 2000</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Activity Status Filter */}
        <div>
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isActivityActive ? "text-blue-700 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
            Activity Status {isActivityActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.activityStatus || "ALL"}
              onChange={(e) => updateUrl({ activityStatus: e.target.value })}
              className={`w-full appearance-none rounded-xl border bg-slate-50 dark:bg-slate-950/60 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:border-blue-500 focus:outline-none cursor-pointer pr-8 transition-all ${
                isActivityActive ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Students</option>
              <option value="ACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Active in last 30d</option>
              <option value="INACTIVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Reset All Button at bottom if filters active */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-800 transition-colors btn-press"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Pending state */}
        {isPending && (
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse flex items-center gap-1.5 pt-1">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
            <span>Updating rankings...</span>
          </div>
        )}
      </div>
    </div>
  );
}
