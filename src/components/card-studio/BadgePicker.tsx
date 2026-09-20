"use client";

import { useState, useEffect } from "react";
import type { BadgeDTO } from "@/types/profile-card";
import { Award, Check, X, Shield, Sparkles, RotateCcw } from "lucide-react";

interface BadgePickerProps {
  availableBadges: BadgeDTO[];
  selectedBadgeIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (badgeIds: string[]) => void;
}

const RARITY_STYLES: Record<BadgeDTO["rarity"], { badge: string; text: string; bg: string }> = {
  LEGENDARY: {
    badge: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    text: "text-amber-400",
    bg: "bg-amber-950/20 border-amber-900/30",
  },
  EPIC: {
    badge: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    text: "text-purple-400",
    bg: "bg-purple-950/20 border-purple-900/30",
  },
  RARE: {
    badge: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    text: "text-blue-400",
    bg: "bg-blue-950/20 border-blue-900/30",
  },
  COMMON: {
    badge: "border-zinc-700 bg-zinc-800/40 text-zinc-400",
    text: "text-zinc-400",
    bg: "bg-zinc-900/40 border-zinc-800",
  },
};

export function BadgePicker({
  availableBadges,
  selectedBadgeIds,
  isOpen,
  onClose,
  onSave,
}: BadgePickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedBadgeIds);

  // Synchronize internal state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedBadgeIds);
    }
  }, [isOpen, selectedBadgeIds]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        return; // Enforce maximum of 3
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleResetToAuto = () => {
    setSelectedIds([]); // Empty indicates automatic selection by top rarity
  };

  const handleApply = () => {
    onSave(selectedIds);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="flex flex-col w-full max-w-xl max-h-[85vh] rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 id="badge-picker-title" className="text-base font-semibold text-zinc-100">
                Feature Unlocked Badges
              </h2>
              <p className="text-xs text-zinc-400">
                Choose up to 3 achievements to showcase prominently on your card.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Badge List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-medium text-zinc-300">
              Selected:{" "}
              <span className={selectedIds.length === 3 ? "text-amber-400 font-bold" : "text-indigo-400 font-semibold"}>
                {selectedIds.length} / 3
              </span>
              {selectedIds.length === 0 && (
                <span className="ml-2 text-zinc-500 font-normal">
                  (Auto-displaying top 3 highest rarity)
                </span>
              )}
            </span>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleResetToAuto}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to Auto-Rarity</span>
              </button>
            )}
          </div>

          {availableBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6">
              <Sparkles className="h-8 w-8 text-zinc-600 mb-2" />
              <p className="text-sm font-medium text-zinc-300">No Unlocked Badges Yet</p>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm">
                Solve problems and compete on the collegiate leaderboard to unlock achievement badges.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {availableBadges.map((badge) => {
                const isSelected = selectedIds.includes(badge.id);
                const isMaxReached = selectedIds.length >= 3 && !isSelected;
                const rarity = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.COMMON;

                return (
                  <button
                    key={badge.id}
                    type="button"
                    disabled={isMaxReached}
                    onClick={() => handleToggle(badge.id)}
                    className={`flex items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500/50"
                        : isMaxReached
                        ? "border-zinc-800/40 bg-zinc-950/20 opacity-40 cursor-not-allowed"
                        : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/40"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-600 text-white"
                          : "border-zinc-700 bg-zinc-800"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {badge.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${rarity.badge}`}
                        >
                          {badge.rarity}
                        </span>
                      </div>
                      {badge.description && (
                        <p className="mt-0.5 text-[11px] text-zinc-400 line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </div>

                    {/* Badge Icon preview */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${rarity.bg}`}
                    >
                      <Shield className={`h-4 w-4 ${rarity.text}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/40 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all"
          >
            Apply Selection ({selectedIds.length}/3)
          </button>
        </div>
      </div>
    </div>
  );
}
