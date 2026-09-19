"use client";

import { useMemo } from "react";
import type { CardMetricsDTO, ProfileCardConfigDTO, CardTheme, CardLayout } from "@/types/profile-card";
import { Sparkles, Maximize2 } from "lucide-react";

interface CardLivePreviewProps {
  metrics: CardMetricsDTO;
  config: ProfileCardConfigDTO;
  activeTheme?: CardTheme;
  activeLayout?: CardLayout;
}

export function CardLivePreview({
  metrics,
  config,
  activeTheme,
  activeLayout,
}: CardLivePreviewProps) {
  const theme = activeTheme ?? config.theme;
  const layout = activeLayout ?? config.layout;

  // Compute live SVG URL with query parameters
  const previewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (theme && theme !== "github-dark") {
      params.set("theme", theme);
    }
    if (layout === "compact") {
      params.set("layout", "compact");
    }
    const query = params.toString();
    return `/api/cards/${encodeURIComponent(metrics.leetcodeUsername)}${query ? `?${query}` : ""}`;
  }, [metrics.leetcodeUsername, theme, layout]);

  const isCompact = layout === "compact";
  const dimensions = isCompact ? "350 × 120 px" : "495 × 195 px";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-zinc-200">Interactive Card Preview</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Maximize2 className="h-3 w-3 text-zinc-500" />
          <span>{dimensions}</span>
        </div>
      </div>

      {/* Preview Card Canvas */}
      <div className="flex items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-8 backdrop-blur-md overflow-hidden min-h-[220px]">
        <div
          className={`w-full transition-all duration-300 flex items-center justify-center ${
            isCompact ? "max-w-[350px]" : "max-w-[495px]"
          }`}
        >
          {/* SVG Card Image */}
          <img
            src={previewUrl}
            alt={`${metrics.displayName}'s Developer Profile Card`}
            className="w-full h-auto rounded-xl shadow-2xl transition-all duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>
      </div>

      <p className="text-center text-xs text-zinc-500">
        Live vector SVG rendered by server engine. Updates in real-time as you adjust settings.
      </p>
    </div>
  );
}
