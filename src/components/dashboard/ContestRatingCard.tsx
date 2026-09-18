import React from "react";
import { Trophy, Globe, Flame } from "lucide-react";

interface Props {
  contestRating: number | null;
  globalContestRank: number | null;
  contestsAttended: number;
}

export function ContestRatingCard({
  contestRating,
  globalContestRank,
  contestsAttended,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Contest Standing
        </h3>
        {contestRating ? (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
            Rating {contestRating}
          </span>
        ) : (
          <span className="text-xs text-zinc-500">Unrated</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Globe className="h-3 w-3 text-indigo-400" /> Global Rank
          </div>
          <div className="text-xl font-bold text-zinc-100 mt-1">
            {globalContestRank ? `#${globalContestRank.toLocaleString()}` : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-800/30 p-3">
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-400" /> Contests
          </div>
          <div className="text-xl font-bold text-zinc-100 mt-1">
            {contestsAttended}
          </div>
        </div>
      </div>
    </div>
  );
}