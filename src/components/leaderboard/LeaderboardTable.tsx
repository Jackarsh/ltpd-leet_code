"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import {
  LeaderboardResponseDTO,
  LeaderboardSortDimension,
  LeaderboardSortDirection,
} from "@/types/leaderboard";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { RankingFormulaModal } from "@/components/leaderboard/RankingFormulaModal";

interface LeaderboardTableProps {
  data: LeaderboardResponseDTO;
  currentUserId?: string;
  sortBy?: LeaderboardSortDimension;
  sortDir?: LeaderboardSortDirection;
}

export function LeaderboardTable({
  data,
  currentUserId,
  sortBy = "RANK",
  sortDir = "asc",
}: LeaderboardTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const handleSortChange = (newDimension: LeaderboardSortDimension) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newDimension);
    params.set("sortDir", newDimension === "RANK" ? "asc" : "desc");
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSortDir = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const sortOptions = [
    { value: "RANK", label: "Ranking (Default)" },
    { value: "TOTAL_SOLVED", label: "Total Solved" },
    { value: "HARD_SOLVED", label: "Hard Solved" },
    { value: "CONTEST_RATING", label: "Contest Rating" },
    { value: "STREAK", label: "Streak Days" },
  ];

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-end gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowFormulaModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-sm"
          >
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Ranking Formula</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-0.5 hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as LeaderboardSortDimension)}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:outline-none cursor-pointer shadow-sm transition-colors"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSortDir}
              title={sortDir === "asc" ? "Ascending" : "Descending"}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 shadow-sm transition-colors btn-press"
            >
              {sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Cards List (IMDb Top 250 style) */}
      {data.students.length > 0 ? (
        <div className="space-y-3.5">
          {data.students.map((row) => (
            <LeaderboardRow key={row.id} row={row} isCurrentUser={currentUserId === row.id} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No coders match the selected criteria</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting branch, admission batch, or clearing your search term to see more coders.
          </p>
        </div>
      )}

      {/* Pagination Bar */}
      {data.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-5 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{data.page}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{data.totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm btn-press"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm btn-press"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showFormulaModal && (
        <RankingFormulaModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />
      )}
    </div>
  );
}
