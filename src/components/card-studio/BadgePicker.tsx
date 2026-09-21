"use client";

import { useState, useEffect } from "react";
import type { BadgeDTO } from "@/types/profile-card";
import { Check, X, RotateCcw } from "lucide-react";

interface BadgePickerProps {
  availableBadges: BadgeDTO[];
  selectedBadgeIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (badgeIds: string[]) => void;
}

export function BadgePicker({
  availableBadges,
  selectedBadgeIds,
  isOpen,
  onClose,
  onSave,
}: BadgePickerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedBadgeIds);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedBadgeIds);
    }
  }, [isOpen, selectedBadgeIds]);

  if (!isOpen) return null;

  const toggleBadge = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) return;
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const resetToAuto = () => {
    setSelectedIds([]);
  };

  const handleSave = () => {
    onSave(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#e6edf3]">
              Featured Badges
            </h2>
            <p className="text-xs text-[#848d97] mt-0.5">
              Select up to 3 badges to display on your stats card ({selectedIds.length}/3)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#848d97] hover:bg-[#21262d] hover:text-[#e6edf3] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Reset button */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#848d97]">
            {selectedIds.length === 0
              ? "Currently using automatic highest-rarity fallback."
              : `${selectedIds.length} custom badges selected.`}
          </span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={resetToAuto}
              className="inline-flex items-center gap-1 text-xs text-[#848d97] hover:text-[#e6edf3] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Auto
            </button>
          )}
        </div>

        {/* Badges List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {availableBadges.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#848d97]">
              No badges unlocked yet. Solve problems and participate in contests to earn badges!
            </div>
          ) : (
            availableBadges.map((badge) => {
              const isSelected = selectedIds.includes(badge.id);
              const isLimitReached = selectedIds.length >= 3 && !isSelected;

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => toggleBadge(badge.id)}
                  disabled={isLimitReached}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-[#484f58] bg-[#21262d] text-[#e6edf3]"
                      : isLimitReached
                      ? "border-[#21262d] bg-[#0d1117] opacity-40 cursor-not-allowed"
                      : "border-[#21262d] bg-[#0d1117] hover:border-[#30363d] text-[#c9d1d9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#e6edf3]">
                        {badge.name}
                      </span>
                      <span className="text-[11px] text-[#848d97]">
                        {badge.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded border border-[#30363d] bg-[#161b22] px-2 py-0.5 text-[10px] font-semibold text-[#848d97]">
                      {badge.rarity}
                    </span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                        isSelected
                          ? "border-[#484f58] bg-[#30363d] text-[#e6edf3]"
                          : "border-[#30363d] bg-[#0d1117]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-[#21262d] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#30363d] bg-[#21262d] px-3.5 py-1.5 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#30363d] px-4 py-1.5 text-xs font-semibold text-[#e6edf3] hover:bg-[#484f58] transition-colors"
          >
            Apply ({selectedIds.length}/3)
          </button>
        </div>
      </div>
    </div>
  );
}
