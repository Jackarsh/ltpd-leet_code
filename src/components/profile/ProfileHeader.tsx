"use client";

import { ExternalLink, AlertTriangle } from "lucide-react";
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
    .join(" \u00B7 ");

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-20 w-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-display font-bold text-2xl text-slate-800 dark:text-white">
                {profile.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            {profile.collegeRank && (
              <span className="absolute -bottom-2 -right-2 flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-xs font-mono font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
                #{profile.collegeRank}
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                {profile.displayName}
              </h1>
              {profile.gender && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {profile.gender}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <a
                href={`https://leetcode.com/u/${encodeURIComponent(profile.leetcodeUsername)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-medium"
              >
                <span>@{profile.leetcodeUsername}</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              {academicDetails && (
                <div className="flex items-center gap-1.5">
                  <span>&bull;</span>
                  <span>{academicDetails}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-200 dark:border-slate-800 pt-4 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              College Rank: {profile.collegeRank ? `#${profile.collegeRank}` : "Unranked"}
            </span>
          </div>

          {profile.isStale && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Data may be outdated</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
