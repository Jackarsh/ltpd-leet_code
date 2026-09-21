"use client";

import { useState, useTransition, useMemo } from "react";
import type {
  CardMetricsDTO,
  ProfileCardConfigDTO,
  CardTheme,
  CardLayout,
  BadgeDTO,
} from "@/types/profile-card";
import { CardLivePreview } from "./CardLivePreview";
import { ExportBar } from "./ExportBar";
import { ThemeSelector } from "./ThemeSelector";
import { LayoutToggle } from "./LayoutToggle";
import { BadgePicker } from "./BadgePicker";
import { saveCardConfigAction } from "@/server/actions/update-card-config";

interface CardStudioClientProps {
  metrics: CardMetricsDTO;
  initialConfig: ProfileCardConfigDTO;
}

export function CardStudioClient({
  metrics,
  initialConfig,
}: CardStudioClientProps) {
  const [theme, setTheme] = useState<CardTheme>(initialConfig.theme);
  const [layout, setLayout] = useState<CardLayout>(initialConfig.layout);
  const [showStreak, setShowStreak] = useState(initialConfig.showStreak);
  const [showRating, setShowRating] = useState(initialConfig.showRating);
  const [showAchievements, setShowAchievements] = useState(initialConfig.showAchievements);
  const [featuredBadgeIds, setFeaturedBadgeIds] = useState<string[]>(
    initialConfig.featuredBadgeIds ?? []
  );

  const [isBadgePickerOpen, setIsBadgePickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"saved" | "error" | null>(null);

  const availableBadges: BadgeDTO[] = useMemo(() => {
    return metrics.allUnlockedBadges ?? metrics.badges ?? [];
  }, [metrics.allUnlockedBadges, metrics.badges]);

  const previewBadges: BadgeDTO[] = useMemo(() => {
    if (featuredBadgeIds.length > 0) {
      const selected = featuredBadgeIds
        .map((id) => availableBadges.find((b) => b.id === id))
        .filter((b): b is BadgeDTO => b !== undefined);
      if (selected.length > 0) return selected;
    }
    return metrics.badges;
  }, [featuredBadgeIds, availableBadges, metrics.badges]);

  const effectiveMetrics: CardMetricsDTO = {
    ...metrics,
    badges: previewBadges,
  };

  const effectiveConfig: ProfileCardConfigDTO = {
    ...initialConfig,
    theme,
    layout,
    showStreak,
    showRating,
    showAchievements,
    featuredBadgeIds,
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveCardConfigAction({
        theme,
        layout,
        showStreak,
        showRating,
        showAchievements,
        featuredBadgeIds,
      });
      if (res?.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        setSaveStatus("error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Live Interactive Preview */}
      <CardLivePreview
        metrics={effectiveMetrics}
        config={effectiveConfig}
        activeTheme={theme}
        activeLayout={layout}
      />

      {/* 2. One-Click Export & Markdown Embed Bar */}
      <ExportBar
        displayName={metrics.displayName}
        username={metrics.leetcodeUsername}
        cardToken={initialConfig.cardToken}
        theme={theme}
        layout={layout}
      />

      {/* 3. Customization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemeSelector
          selectedTheme={theme}
          onSelectTheme={setTheme}
        />

        <div className="flex flex-col gap-5 rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
          <div className="border-b border-[#21262d] pb-3">
            <h3 className="text-sm font-semibold text-[#e6edf3]">Layout & Visibility</h3>
          </div>

          <LayoutToggle
            selectedLayout={layout}
            onSelectLayout={setLayout}
          />

          <div className="flex flex-col gap-2 pt-1 border-t border-[#21262d]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#c9d1d9]">Featured Badges</span>
              <button
                type="button"
                onClick={() => setIsBadgePickerOpen(true)}
                className="text-xs font-semibold text-[#e6edf3] hover:underline"
              >
                {featuredBadgeIds.length > 0
                  ? `Selected (${featuredBadgeIds.length}/3)`
                  : "Auto-Rarity (Choose 3)"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {previewBadges.length === 0 ? (
                <span className="text-[11px] text-[#6e7681] italic">No badges unlocked yet.</span>
              ) : (
                previewBadges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-2.5 py-1 text-[11px] font-medium text-[#c9d1d9]"
                  >
                    <span className="truncate max-w-[130px]">{b.name}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Metric Visibility Toggles */}
          <div className="flex flex-col gap-2 pt-1 border-t border-[#21262d]">
            <span className="text-xs font-medium text-[#c9d1d9]">Metric Visibility</span>
            <label className="flex items-center justify-between text-xs text-[#848d97] cursor-pointer py-1">
              <span>Show active problem-solving streak</span>
              <input
                type="checkbox"
                checked={showStreak}
                onChange={(e) => setShowStreak(e.target.checked)}
                className="rounded border-[#30363d] bg-[#0d1117] text-[#e6edf3] focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-[#848d97] cursor-pointer py-1">
              <span>Show LeetCode contest rating</span>
              <input
                type="checkbox"
                checked={showRating}
                onChange={(e) => setShowRating(e.target.checked)}
                className="rounded border-[#30363d] bg-[#0d1117] text-[#e6edf3] focus:ring-0"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-[#848d97] cursor-pointer py-1">
              <span>Show featured badges & achievements</span>
              <input
                type="checkbox"
                checked={showAchievements}
                onChange={(e) => setShowAchievements(e.target.checked)}
                className="rounded border-[#30363d] bg-[#0d1117] text-[#e6edf3] focus:ring-0"
              />
            </label>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
            <div>
              {saveStatus === "saved" && (
                <span className="text-xs text-[#e6edf3]">
                  Preferences saved as default!
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs text-[#848d97]">
                  Failed to save preferences.
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-xl bg-[#21262d] border border-[#30363d] px-4 py-2 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save as Default"}
            </button>
          </div>
        </div>
      </div>

      {isBadgePickerOpen && (
        <BadgePicker
          availableBadges={availableBadges}
          selectedBadgeIds={featuredBadgeIds}
          isOpen={isBadgePickerOpen}
          onClose={() => setIsBadgePickerOpen(false)}
          onSave={(ids) => {
            setFeaturedBadgeIds(ids);
            setIsBadgePickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
