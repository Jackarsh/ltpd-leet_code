"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
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
    { value: "RANK", label: "Ranking" },
    { value: "TOTAL_SOLVED", label: "Total Solved" },
    { value: "HARD_SOLVED", label: "Hard Solved" },
    { value: "CONTEST_RATING", label: "Contest Rating" },
    { value: "STREAK", label: "Streak Days" },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e2632]">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8d98a5]">
            Showing <strong className="text-[#ece8e1]">{data.students.length}</strong> of{" "}
            <strong className="text-[#ece8e1]">{data.total}</strong> ranked coders
          </span>
          <button
            onClick={() => setShowFormulaModal(true)}
            className="text-xs text-[#8d98a5] hover:text-[#e5b882] transition-colors hover:underline"
          >
            Ranking Formula
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#6b7785] mr-1 hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as LeaderboardSortDimension)}
            className="rounded-lg border border-[#25303e] bg-[#121820] px-2.5 py-1.5 text-xs font-semibold text-[#ece8e1] focus:border-[#c89b68]/70 focus:outline-none cursor-pointer transition-colors"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={toggleSortDir}
            title={sortDir === "asc" ? "Ascending" : "Descending"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#25303e] bg-[#121820] text-[#8d98a5] hover:text-[#ece8e1] hover:border-[#c89b68]/50 transition-colors shadow-sm shadow-black/20"
          >
            {sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {data.students.length > 0 ? (
        <div className="space-y-3">
          {data.students.map((row) => (
            <LeaderboardRow key={row.id} row={row} isCurrentUser={currentUserId === row.id} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-xl border border-[#1e2632] bg-[#121820]/60 shadow-inner">
          <p className="text-sm font-medium text-[#8d98a5]">No coders match the selected filters</p>
          <p className="text-xs text-[#6b7785] mt-1">Try broadening your search or resetting filters</p>
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-[#1e2632]">
          <span className="text-xs text-[#8d98a5]">
            Page <strong className="text-[#ece8e1]">{data.page}</strong> of{" "}
            <strong className="text-[#ece8e1]">{data.totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => handlePageChange(data.page - 1)} disabled={data.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-[#25303e] bg-[#121820] px-3 py-1.5 text-xs font-medium text-[#d6d0c7] hover:bg-[#18212b] hover:border-[#c89b68]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" /><span>Previous</span>
            </button>
            <button onClick={() => handlePageChange(data.page + 1)} disabled={data.page >= data.totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#25303e] bg-[#121820] px-3 py-1.5 text-xs font-medium text-[#d6d0c7] hover:bg-[#18212b] hover:border-[#c89b68]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <span>Next</span><ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {showFormulaModal && <RankingFormulaModal isOpen={showFormulaModal} onClose={() => setShowFormulaModal(false)} />}
    </div>
  );
}
