"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Users,
  SearchX,
} from "lucide-react";
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

  const handleSort = (dimension: LeaderboardSortDimension) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", dimension);

    if (sortBy === dimension) {
      params.set("sortDir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sortDir", dimension === "RANK" ? "asc" : "desc");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderSortIcon = (dimension: LeaderboardSortDimension) => {
    if (sortBy !== dimension) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-300 transition-colors" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-indigo-400" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-indigo-400" />
    );
  };

  const students = data.students;

  return (
    <>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden backdrop-blur-sm shadow-xl">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/40">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>
              Showing <strong className="text-zinc-200">{students.length}</strong> of{" "}
              <strong className="text-zinc-200">{data.total}</strong> eligible students
            </span>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Formula & Weights</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort("RANK")}
                  className="py-3 pl-4 pr-3 cursor-pointer group hover:text-zinc-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    {renderSortIcon("RANK")}
                  </div>
                </th>

                <th className="py-3 px-3">Student</th>

                <th
                  onClick={() => handleSort("TOTAL_SOLVED")}
                  className="py-3 px-3 cursor-pointer group hover:text-zinc-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Solved</span>
                    {renderSortIcon("TOTAL_SOLVED")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("HARD_SOLVED")}
                  className="py-3 px-3 cursor-pointer group hover:text-zinc-200 transition-colors hidden sm:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Breakdown (E/M/H)</span>
                    {renderSortIcon("HARD_SOLVED")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("CONTEST_RATING")}
                  className="py-3 px-3 cursor-pointer group hover:text-zinc-200 transition-colors hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Rating</span>
                    {renderSortIcon("CONTEST_RATING")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("STREAK")}
                  className="py-3 px-3 cursor-pointer group hover:text-zinc-200 transition-colors hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Streak</span>
                    {renderSortIcon("STREAK")}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("RANK")}
                  className="py-3 pl-3 pr-4 text-right cursor-pointer group hover:text-zinc-200 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Weighted Score</span>
                    {renderSortIcon("RANK")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {students.length > 0 ? (
                students.map((student) => (
                  <LeaderboardRow
                    key={student.id}
                    row={student}
                    isCurrentUser={currentUserId ? student.id === currentUserId : false}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <SearchX className="h-8 w-8 text-zinc-400" />
                      <p className="text-sm font-semibold text-zinc-300">
                        No students match the selected filters
                      </p>
                      <p className="text-xs text-zinc-400 max-w-sm">
                        Try clearing your search query or adjusting your branch and batch filters to see more results.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (FR-208) */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-950/40">
            <div className="text-xs text-zinc-400">
              Page <strong className="text-zinc-200">{data.page}</strong> of{" "}
              <strong className="text-zinc-200">{data.totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(data.page - 1)}
                disabled={data.page <= 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>

              <button
                onClick={() => handlePageChange(data.page + 1)}
                disabled={data.page >= data.totalPages}
                className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Ranking Formula Explanation Modal */}
      <RankingFormulaModal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
      />
    </>
  );
}