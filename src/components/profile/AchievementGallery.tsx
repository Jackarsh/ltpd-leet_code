"use client";

import { useState } from "react";
import {
  Award,
  Lock,
  Trophy,
  Zap,
  Flame,
  Crown,
  Calendar,
  Activity,
  Shield,
  Sparkles,
  AlertCircle,
  Archive,
} from "lucide-react";
import { UserBadgeDTO } from "@/types/profile";

interface AchievementGalleryProps {
  achievements: UserBadgeDTO[];
  lockedAchievements?: UserBadgeDTO[];
}

export function AchievementGallery({
  achievements,
  lockedAchievements = [],
}: AchievementGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const getBadgeIcon = (iconKey: string) => {
    switch (iconKey.toLowerCase()) {
      case "trophy":
        return <Trophy className="h-6 w-6 text-amber-400" />;
      case "zap":
        return <Zap className="h-6 w-6 text-indigo-400" />;
      case "flame":
        return <Flame className="h-6 w-6 text-rose-400" />;
      case "crown":
        return <Crown className="h-6 w-6 text-amber-300" />;
      case "shield":
        return <Shield className="h-6 w-6 text-cyan-400" />;
      case "sparkles":
        return <Sparkles className="h-6 w-6 text-purple-400" />;
      case "calendar":
        return <Calendar className="h-6 w-6 text-emerald-400" />;
      case "activity":
        return <Activity className="h-6 w-6 text-sky-400" />;
      default:
        return <Award className="h-6 w-6 text-indigo-400" />;
    }
  };

  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "EPIC":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "RARE":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const categories = [
    { key: "ALL", label: "All" },
    { key: "PROBLEM_SOLVING", label: "Problem Solving" },
    { key: "CONTESTS", label: "Contests" },
    { key: "CONSISTENCY", label: "Consistency" },
  ];

  const filteredEarned = achievements.filter((b) => {
    if (selectedCategory === "ALL") return true;
    return b.category === selectedCategory;
  });

  const filteredLocked = lockedAchievements.filter((b) => {
    if (selectedCategory === "ALL") return true;
    return b.category === selectedCategory;
  });

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-lg mb-8">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold text-zinc-100 uppercase tracking-wider">
            Collegiate Achievements
          </h2>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
            {achievements.length} Unlocked
          </span>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === c.key
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-850"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Earned Badges Grid */}
      {filteredEarned.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredEarned.map((badge) => (
            <div
              key={badge.id}
              className={`relative rounded-xl border p-4 transition-all duration-200 backdrop-blur-sm ${
                badge.isRevoked
                  ? "bg-rose-950/10 border-rose-900/40 opacity-75"
                  : badge.isLegacy
                  ? "bg-zinc-950/40 border-zinc-700/60"
                  : "bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="rounded-xl bg-zinc-900 p-2.5 border border-zinc-800 shrink-0">
                  {getBadgeIcon(badge.iconKey)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-sm text-zinc-100 truncate">{badge.name}</h3>
                    {badge.rarityLevel && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${getRarityBadge(
                          badge.rarityLevel
                        )}`}
                      >
                        {badge.rarityLevel}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{badge.description}</p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-850">
                    <span>
                      Earned {new Date(badge.unlockedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>

                    {badge.isRevoked && (
                      <span className="flex items-center gap-1 text-rose-400 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        Revoked
                      </span>
                    )}

                    {badge.isLegacy && (
                      <span className="flex items-center gap-1 text-zinc-400 font-medium">
                        <Archive className="h-3 w-3" />
                        Legacy
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-950/50 border border-zinc-850 p-6 text-center text-xs text-zinc-400 mb-6">
          No achievements earned in this category yet.
        </div>
      )}

      {/* Locked Achievements (Owner Only - FR-333, FR-334) */}
      {filteredLocked.length > 0 && (
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            <span>Locked Milestones ({filteredLocked.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocked.map((badge) => (
              <div
                key={badge.id}
                className="rounded-xl border border-zinc-850/80 bg-zinc-950/30 p-4 opacity-60 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start gap-3.5">
                  <div className="rounded-xl bg-zinc-900/60 p-2.5 border border-zinc-850 shrink-0 text-zinc-400">
                    <Lock className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-zinc-300 truncate">{badge.name}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mb-2">{badge.description}</p>
                    <div className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-indigo-300 border border-zinc-800">
                      {badge.conditionText}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}