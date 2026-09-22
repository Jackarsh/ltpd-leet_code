"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, RotateCcw, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { LeaderboardFilterParams } from "@/types/leaderboard";

interface LeaderboardFiltersProps {
  currentFilters: LeaderboardFilterParams;
}

const COMMON_BRANCHES = [
  { value: "ALL", label: "All Branches" },
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
    <div className="rounded-xl border border-[#1e2632] bg-[#121820]/90 p-4 shadow-sm shadow-black/20">
      {/* Sidebar Header (Shopping Site Style) */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1e2632]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[#c89b68]" />
          <span className="text-sm font-semibold text-[#ece8e1] tracking-tight">Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#c89b68]/15 border border-[#c89b68]/30 px-2 py-0.5 text-[11px] font-semibold text-[#e5b882]">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-[#8d98a5] hover:text-[#cf6679] transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}

          {/* Mobile Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex items-center gap-1 text-xs font-medium text-[#ece8e1] bg-[#18212b] hover:bg-[#202c3a] border border-[#25303e] px-2 py-1 rounded-md transition-colors"
          >
            <span>{isMobileOpen ? "Collapse" : "Expand"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isMobileOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter Body: Always visible on Desktop, collapsible on Mobile */}
      <div className={`mt-4 space-y-4 ${isMobileOpen ? "block" : "hidden"} lg:block`}>
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-[#8d98a5] uppercase tracking-wider mb-1.5">
            Search Coder
          </label>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7785]" />
            <input
              type="text"
              placeholder="Name, @handle, branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#25303e] bg-[#0b0f14] pl-8 pr-14 py-1.5 text-xs text-[#ece8e1] placeholder-[#6b7785] focus:border-[#c89b68]/70 focus:outline-none transition-colors"
            />
            {search ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  updateUrl({ search: "" });
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-[#8d98a5] hover:text-[#ece8e1] p-0.5"
                title="Clear input"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded border border-[#25303e] bg-[#18212b] px-2 py-1 text-[11px] font-medium text-[#d6d0c7] hover:bg-[#c89b68]/20 hover:border-[#c89b68]/40 hover:text-[#f3cf98] transition-colors"
            >
              Go
            </button>
          </form>
        </div>

        {/* Branch Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isBranchActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Branch {isBranchActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.branch || "ALL"}
              onChange={(e) => updateUrl({ branch: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isBranchActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              {COMMON_BRANCHES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Batch Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isBatchActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Graduation Batch {isBatchActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.batch?.toString() || "ALL"}
              onChange={(e) => updateUrl({ batch: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isBatchActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              {COMMON_BATCHES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isGenderActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Gender {isGenderActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.gender || "ALL"}
              onChange={(e) => updateUrl({ gender: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isGenderActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Min Solved Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isMinSolvedActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Min Problems Solved {isMinSolvedActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.minSolved?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minSolved: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isMinSolvedActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              <option value="ALL">Any Count</option>
              <option value="50">&ge; 50 problems</option>
              <option value="100">&ge; 100 problems</option>
              <option value="250">&ge; 250 problems</option>
              <option value="500">&ge; 500 problems</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isMinRatingActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Min Contest Rating {isMinRatingActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.minRating?.toString() || "ALL"}
              onChange={(e) => updateUrl({ minRating: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isMinRatingActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              <option value="ALL">Any Rating</option>
              <option value="1400">&ge; 1400</option>
              <option value="1600">&ge; 1600</option>
              <option value="1800">&ge; 1800</option>
              <option value="2000">&ge; 2000</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Activity Status Filter */}
        <div>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${isActivityActive ? "text-[#e5b882]" : "text-[#8d98a5]"}`}>
            Activity Status {isActivityActive && "•"}
          </label>
          <div className="relative">
            <select
              value={currentFilters.activityStatus || "ALL"}
              onChange={(e) => updateUrl({ activityStatus: e.target.value })}
              className={`w-full appearance-none rounded-lg border bg-[#0b0f14] px-2.5 py-1.5 text-xs text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer pr-8 transition-colors ${
                isActivityActive ? "border-[#c89b68]/50" : "border-[#25303e]"
              }`}
            >
              <option value="ALL">All Students</option>
              <option value="ACTIVE">Active in last 30d</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8d98a5]" />
          </div>
        </div>

        {/* Reset All Button at bottom if filters active */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-[#1e2632]">
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#25303e] bg-[#18212b] px-3 py-1.5 text-xs font-medium text-[#d6d0c7] hover:text-[#cf6679] hover:border-[#cf6679]/40 hover:bg-[#20141a] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}

        {/* Pending state */}
        {isPending && (
          <div className="text-[11px] text-[#8d98a5] animate-pulse flex items-center gap-1.5 pt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c89b68] animate-ping" />
            <span>Updating rankings...</span>
          </div>
        )}
      </div>
    </div>
  );
}
