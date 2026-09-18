"use client";

import { ExternalLink, Trophy, AlertTriangle, GraduationCap } from "lucide-react";
import { PublicStudentProfileDTO } from "@/types/profile";

interface ProfileHeaderProps {
  profile: PublicStudentProfileDTO;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const academicDetails = [
    profile.branch ? profile.branch.toUpperCase() : null,
    profile.graduationYear ? `Class of ${profile.graduationYear}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl mb-8">
      {/* Background Accent Gradient */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          {/* Avatar with fallback */}
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-20 w-20 rounded-full object-cover border-2 border-zinc-700 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-900 to-zinc-900 border-2 border-indigo-500/50 flex items-center justify-center font-bold text-2xl text-indigo-200 shadow-md">
                {profile.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            {profile.collegeRank && (
              <span className="absolute -bottom-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-xs font-bold text-amber-400 border border-amber-500/40 shadow">
                #{profile.collegeRank}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-zinc-100">{profile.displayName}</h1>
              {profile.gender && (
                <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300 border border-zinc-700">
                  {profile.gender === "MALE" ? "Male" : "Female"}
                </span>
              )}
              {profile.isStale && (
                <span
                  title="Data may not reflect most recent activity"
                  className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Stale Data
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400 flex-wrap">
              <a
                href={`https://leetcode.com/u/${profile.leetcodeUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium"
              >
                <span>@{profile.leetcodeUsername}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              {academicDetails && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{academicDetails}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* College Rank & Weighted Score Badge */}
        <div className="flex sm:flex-col items-end justify-between border-t sm:border-t-0 border-zinc-800 pt-4 sm:pt-0">
          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              College Rank
            </span>
            <div className="flex items-center gap-1.5 text-2xl font-black text-zinc-100 sm:justify-end">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span>{profile.collegeRank ? `#${profile.collegeRank}` : "—"}</span>
            </div>
          </div>

          {profile.weightedScore !== null && (
            <div className="text-right mt-1">
              <span className="text-xs text-zinc-400">Overall Score: </span>
              <span className="text-sm font-mono font-bold text-indigo-400">
                {profile.weightedScore} pts
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}