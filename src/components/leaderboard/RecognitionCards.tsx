"use client";

import Link from "next/link";
import { RecognitionCardData } from "@/types/leaderboard";

interface RecognitionCardsProps {
  cards: RecognitionCardData[];
}

export function RecognitionCards({ cards }: RecognitionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
      {cards.map((card) => {
        const student = card.student;

        return (
          <div
            key={card.category}
            className="card-hover relative flex flex-col justify-between p-4 rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#444c56]"
          >
            <div>
              {/* Header: Clean Category Badge & Title (No AI Trophy/Thunderbolt icons) */}
              <div className="mb-2">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#848d97]">
                  {card.title}
                </div>
                <p className="text-[11px] text-[#848d97] mt-0.5">{card.description}</p>
              </div>

              {/* Student Details or Empty State */}
              {student ? (
                <div className="mt-3 flex items-center gap-3">
                  <Link
                    href={`/profiles/${encodeURIComponent(student.leetcodeUsername)}`}
                    className="shrink-0"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-[#30363d] bg-[#0d1117] flex items-center justify-center">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#21262d] text-[#f0f6fc] font-bold text-sm">
                          {student.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profiles/${encodeURIComponent(student.leetcodeUsername)}`}
                      className="font-display font-bold text-sm text-[#f0f6fc] hover:text-[#58a6ff] transition-colors truncate block"
                    >
                      {student.displayName}
                    </Link>
                    <div className="text-xs text-[#848d97]">
                      @{student.leetcodeUsername} · Rank #{student.collegeRank ?? "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 py-2 text-center text-xs text-[#848d97]">
                  Awaiting qualification
                </div>
              )}
            </div>

            {/* Bottom Stat Value */}
            {student && (
              <div className="mt-3 pt-2.5 border-t border-[#21262d] flex items-center justify-between">
                <span className="text-xs text-[#848d97]">{student.sublabel}</span>
                <span className="font-mono text-sm font-bold text-[#f0f6fc]">
                  {student.value}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
