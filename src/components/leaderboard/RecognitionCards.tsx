"use client";

import Link from "next/link";
import { Trophy, Zap, Flame, Award, HelpCircle } from "lucide-react";
import { RecognitionCardData } from "@/types/leaderboard";

interface RecognitionCardsProps {
  cards: RecognitionCardData[];
}

export function RecognitionCards({ cards }: RecognitionCardsProps) {
  const getCardIcon = (category: string) => {
    switch (category) {
      case "MOST_SOLVED":
        return <Trophy className="h-5 w-5 text-amber-400" />;
      case "TOP_RATING":
        return <Zap className="h-5 w-5 text-indigo-400" />;
      case "MOST_HARD":
        return <Flame className="h-5 w-5 text-rose-400" />;
      default:
        return <Award className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getBorderGradient = (category: string) => {
    switch (category) {
      case "MOST_SOLVED":
        return "border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent";
      case "TOP_RATING":
        return "border-indigo-500/20 hover:border-indigo-500/40 bg-gradient-to-b from-indigo-500/5 to-transparent";
      case "MOST_HARD":
        return "border-rose-500/20 hover:border-rose-500/40 bg-gradient-to-b from-rose-500/5 to-transparent";
      default:
        return "border-zinc-800 hover:border-zinc-700";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card) => {
        const student = card.student;
        return (
          <div
            key={card.category}
            className={`relative rounded-xl border p-5 transition-all duration-200 backdrop-blur-sm ${getBorderGradient(
              card.category
            )}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                  {getCardIcon(card.category)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{card.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-1">{card.description}</p>
                </div>
              </div>
            </div>

            {student ? (
              <Link
                href={`/profiles/${encodeURIComponent(student.leetcodeUsername)}`}
                className="group mt-2 block rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-3 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.displayName}
                          className="h-10 w-10 rounded-full object-cover border border-zinc-700"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center font-bold text-sm text-indigo-300">
                          {student.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      {student.collegeRank && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-800 px-1 text-[10px] font-bold text-zinc-300 border border-zinc-700">
                          #{student.collegeRank}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors">
                        {student.displayName}
                      </div>
                      <div className="text-xs text-zinc-400">
                        @{student.leetcodeUsername}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-zinc-100">
                      {student.value}
                    </div>
                    <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                      {card.category === "TOP_RATING" ? "Rating" : "Problems"}
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="mt-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 p-4 text-center">
                <p className="text-xs text-zinc-400">No data yet</p>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3 text-zinc-400" />
                {card.tieBreakerRule}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}