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
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") { params.delete(key); } else { params.set(key, val); }
    });
    startTransition(() => { router.push(`${pathname}?${params.toString()}`); });
  };

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); updateUrl({ search: search.trim() }); };
  const handleReset = () => { setSearch(""); startTransition(() => { router.push(pathname); }); };

  const hasActiveFilters = Boolean(
    currentFilters.search || currentFilters.branch || currentFilters.batch ||
    currentFilters.gender || currentFilters.minSolved || currentFilters.minRating || currentFilters.activityStatus
  );

  return (
    <div className="rounded-xl border border-[#21262d] bg-[#161b22] p-3.5 mb-6">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6e7681]" />
          <input type="text" placeholder="Filter by student name, @handle, or branch..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-[#30363d] bg-[#0d1117] pl-9 pr-16 py-1.5 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#484f58] focus:outline-none transition-colors" />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-[#21262d] px-2 py-1 text-[11px] font-medium text-[#c9d1d9] hover:bg-[#30363d] transition-colors">Filter</button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select value={currentFilters.branch || "ALL"} onChange={(e) => updateUrl({ branch: e.target.value })}
            className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
            {COMMON_BRANCHES.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
          </select>
          <select value={currentFilters.batch?.toString() || "ALL"} onChange={(e) => updateUrl({ batch: e.target.value })}
            className="rounded-md border border-[#30363d] bg-[#0d1117] px-2.5 py-1.5 text-xs font-medium text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
            {COMMON_BATCHES.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}
          </select>
          <button type="button" onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showMoreFilters || hasActiveFilters ? "border-[#484f58] bg-[#21262d] text-[#e6edf3]" : "border-[#30363d] bg-[#0d1117] text-[#848d97] hover:text-[#e6edf3]"
            }`}>
            <Filter className="h-3 w-3" /><span>More</span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showMoreFilters ? "rotate-180" : ""}`} />
          </button>
          {hasActiveFilters && (
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1 rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs font-medium text-[#848d97] hover:text-[#e6edf3] transition-colors">
              <RotateCcw className="h-3 w-3" /><span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {showMoreFilters && (
        <div className="mt-3 pt-3 border-t border-[#21262d] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-wider mb-1">Gender</label>
            <select value={currentFilters.gender || "ALL"} onChange={(e) => updateUrl({ gender: e.target.value })}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
              <option value="ALL">All Genders</option><option value="MALE">Male</option><option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-wider mb-1">Min Solved</label>
            <select value={currentFilters.minSolved?.toString() || "ALL"} onChange={(e) => updateUrl({ minSolved: e.target.value })}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
              <option value="ALL">Any Count</option><option value="50">&ge; 50</option><option value="100">&ge; 100</option><option value="250">&ge; 250</option><option value="500">&ge; 500</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-wider mb-1">Min Rating</label>
            <select value={currentFilters.minRating?.toString() || "ALL"} onChange={(e) => updateUrl({ minRating: e.target.value })}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
              <option value="ALL">Any Rating</option><option value="1400">&ge; 1400</option><option value="1600">&ge; 1600</option><option value="1800">&ge; 1800</option><option value="2000">&ge; 2000</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#6e7681] uppercase tracking-wider mb-1">Activity (30d)</label>
            <select value={currentFilters.activityStatus || "ALL"} onChange={(e) => updateUrl({ activityStatus: e.target.value })}
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs text-[#c9d1d9] focus:border-[#484f58] focus:outline-none cursor-pointer">
              <option value="ALL">All Students</option><option value="ACTIVE">Active in last 30d</option><option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      )}
      {isPending && <div className="mt-2 text-[11px] text-[#848d97] animate-pulse">Filtering rankings...</div>}
    </div>
  );
}
