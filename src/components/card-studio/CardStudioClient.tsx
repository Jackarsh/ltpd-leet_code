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
import { Sliders, CheckCircle2, AlertCircle, Award, Sparkles } from "lucide-react";

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

  // Derive preview badges according to user selection or automatic fallback
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
        {/* Theme Picker Component (T012) */}
        <ThemeSelector
          selectedTheme={theme}
          onSelectTheme={setTheme}
        />

        {/* Layout & Visibility Preferences (T013, T014, T015) */}
        <div className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Layout & Visibility</h3>
          </div>

          {/* Layout density toggle Component (T013) */}
          <LayoutToggle
            selectedLayout={layout}
            onSelectLayout={setLayout}
          />

          {/* Featured Achievement Badge Selector Trigger (T014) */}
          <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Featured Badges</span>
              <button
                type="button"
                onClick={() => setIsBadgePickerOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                <span>
                  {featuredBadgeIds.length > 0
                    ? `Selected (${featuredBadgeIds.length}/3)`
                    : "Auto-Rarity (Choose 3)"}
                </span>
              </button>
            </div>

            {/* Badges preview chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {previewBadges.length === 0 ? (
                <span className="text-[11px] text-zinc-500 italic">No badges unlocked yet.</span>
              ) : (
                previewBadges.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300"
                  >
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span className="truncate max-w-[130px]">{b.name}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Metric Visibility Toggles */}
          <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/80">
            <span className="text-xs font-medium text-zinc-300">Metric Visibility</span>
            <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer py-1">
              <span>Show active problem-solving streak</span>
              <input
                type="checkbox"
                checked={showStreak}
                onChange={(e) => setShowStreak(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer py-1">
              <span>Show LeetCode contest rating</span>
              <input
                type="checkbox"
                checked={showRating}
                onChange={(e) => setShowRating(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-zinc-400 cursor-pointer py-1">
              <span>Show featured badges & achievements</span>
              <input
                type="checkbox"
                checked={showAchievements}
                onChange={(e) => setShowAchievements(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
              />
            </label>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
            <div>
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Preferences saved as default!
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Failed to save preferences.
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save as Default"}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Badge Selector Modal (T014) */}
      <BadgePicker
        availableBadges={availableBadges}
        selectedBadgeIds={featuredBadgeIds}
        isOpen={isBadgePickerOpen}
        onClose={() => setIsBadgePickerOpen(false)}
        onSave={(badgeIds) => setFeaturedBadgeIds(badgeIds)}
      />
    </div>
  );
}
