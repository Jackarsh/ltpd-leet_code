"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Filter, RotateCcw, ChevronDown } from "lucide-react";
import { LeaderboardFilterParams } from "@/types/leaderboard";

interface LeaderboardFiltersProps {
  currentFilters: LeaderboardFilterParams;
}

const COMMON_BRANCHES = [
  { value: "ALL", label: "All Branches" },
  { value: "CSE", label: "Computer Science (CSE)" },
  { value: "IT", label: "Information Technology (IT)" },
  { value: "ECE", label: "Electronics & Comm (ECE)" },
  { value: "EE", label: "Electrical Engineering (EE)" },
  { value: "ME", label: "Mechanical Engineering (ME)" },
  { value: "CE", label: "Civil Engineering (CE)" },
  { value: "AIDS", label: "AI & Data Science (AIDS)" },
];

const COMMON_BATCHES = [
  { value: "ALL", label: "All Batches" },
  { value: "2027", label: "Class of 2027" },
  { value: "2026", label: "Class of 2026" },
  { value: "2025", label: "Class of 2025" },
  { value: "2024", label: "Class of 2024" },
  { value: "2023", label: "Class of 2023" },
];

export function LeaderboardFilters({ currentFilters }: LeaderboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(currentFilters.search || "");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const updateUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === "ALL") {
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

  const hasActiveFilters = Boolean(
    currentFilters.search ||
    currentFilters.branch ||
    currentFilters.batch ||
    currentFilters.gender ||
    currentFilters.minSolved ||
    currentFilters.minRating ||
    currentFilters.activityStatus
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 mb-6 backdrop-blur-sm">
      {/* Primary Bar: Search & Primary Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, handle, branch, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 pl-9 pr-20 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Branch Select */}
          <select
            value={currentFilters.branch || "ALL"}
            onChange={(e) => updateUrl({ branch: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-medium text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            {COMMON_BRANCHES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          {/* Batch Select */}
          <select
            value={currentFilters.batch?.toString() || "ALL"}
            onChange={(e) => updateUrl({ batch: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-medium text-zinc-300 focus:border-indigo-500 focus:outline-none"
          >
            {COMMON_BATCHES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              showMoreFilters || hasActiveFilters
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
                : "border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                showMoreFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset all filters"
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:border-rose-800/60 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filters */}
      {showMoreFilters && (
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-150">
          {/* Gender Filter (Strictly MALE / FEMALE per Constitution) */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={currentFilters.gender || "ALL"}
              onChange={(e) => updateUrl({ gender: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* Min Problems Solved */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Min Solved
            </label>
            <select
              value={currentFilters.minSolved?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minSolved: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">Any Count</option>
              <option value="50">≥ 50 Solved</option>
              <option value="100">≥ 100 Solved</option>
              <option value="250">≥ 250 Solved</option>
              <option value="500">≥ 500 Solved</option>
            </select>
          </div>

          {/* Min Contest Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Min Rating
            </label>
            <select
              value={currentFilters.minRating?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minRating: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">Any Rating</option>
              <option value="1400">≥ 1400</option>
              <option value="1600">≥ 1600</option>
              <option value="1800">≥ 1800</option>
              <option value="2000">≥ 2000</option>
            </select>
          </div>

          {/* Activity Status */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Activity (30d)
            </label>
            <select
              value={currentFilters.activityStatus || "ALL"}
              onChange={(e) => updateUrl({ activityStatus: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Students</option>
              <option value="ACTIVE">Active in last 30d</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      )}

      {isPending && (
        <div className="mt-2 text-[11px] text-indigo-400 animate-pulse">
          Applying filters...
        </div>
      )}
    </div>
  );
}