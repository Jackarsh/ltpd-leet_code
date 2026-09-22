"use client";

import Link from "next/link";
import { Trophy, ExternalLink } from "lucide-react";
import { LeaderboardRowDTO } from "@/types/leaderboard";

import { GlitchCodeRank } from "@/components/leaderboard/GlitchCodeRank";

interface LeaderboardHeroProps {
  topStudent?: LeaderboardRowDTO;
  totalCoders: number;
}

export function LeaderboardHero({ topStudent, totalCoders }: LeaderboardHeroProps) {
  return (
    <div className="relative overflow-hidden bg-[#0b132b] text-white border-b border-white/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Glitching CodeRank Title */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <GlitchCodeRank />
          </div>

          {/* Right Column: Floating Spotlight Card (Hostelhood Cashback Card style) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            {topStudent ? (
              <div className="w-full max-w-[340px] rounded-2xl border border-white/20 bg-gradient-to-br from-[#121c3d] to-[#0d1630] p-6 shadow-2xl backdrop-blur-lg relative overflow-hidden group hover:border-sky-400/50 transition-all duration-300">
                {/* Glowing top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    #1 College Leader
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ★ {topStudent.weightedScore ? topStudent.weightedScore.toFixed(1) : "0.0"} pts
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-[#0b132b] shrink-0 shadow-md">
                    {topStudent.avatarUrl ? (
                      <img
                        src={topStudent.avatarUrl}
                        alt={topStudent.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-display font-black text-xl">
                        {topStudent.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display font-extrabold text-base text-white truncate group-hover:text-sky-300 transition-colors">
                      {topStudent.displayName}
                    </h2>
                    <p className="text-xs text-slate-300 truncate">
                      @{topStudent.leetcodeUsername}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{topStudent.branch || "ENGINEERING"}</span>
                      {topStudent.graduationYear && <span>&middot; Batch &apos;{String(topStudent.graduationYear).slice(-2)}</span>}
                    </div>
                  </div>
                </div>

                {/* Score breakdown metrics in card */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-white/5 border border-white/10 text-center mb-4">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Solved</div>
                    <div className="font-mono font-bold text-sm text-white">{topStudent.totalSolved}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Hard</div>
                    <div className="font-mono font-bold text-sm text-rose-400">{topStudent.hardSolved}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Rating</div>
                    <div className="font-mono font-bold text-sm text-sky-400">
                      {topStudent.contestRating ? Math.round(topStudent.contestRating) : "—"}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/profiles/${encodeURIComponent(topStudent.leetcodeUsername)}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md btn-press"
                >
                  <span>View Leader Profile</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="w-full max-w-[340px] rounded-2xl border border-white/20 bg-[#121c3d] p-6 shadow-2xl text-center">
                <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                <h2 className="font-display font-bold text-lg text-white">
                  Collegiate Benchmark
                </h2>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  {totalCoders} verified student profiles tracked with automated synchronization.
                </p>
                <div className="py-2.5 px-4 rounded-xl bg-white/10 text-xs font-semibold text-sky-300 border border-white/15">
                  Synchronized with LeetCode API
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
