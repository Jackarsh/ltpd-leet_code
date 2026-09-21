"use client";

import { useMemo } from "react";
import type { CardMetricsDTO, ProfileCardConfigDTO, CardTheme, CardLayout } from "@/types/profile-card";
import { Maximize2 } from "lucide-react";

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
  const dimensions = isCompact ? "350 \u00D7 120 px" : "495 \u00D7 195 px";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3]">Interactive Card Preview</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#848d97]">
          <Maximize2 className="h-3 w-3 text-[#6e7681]" />
          <span>{dimensions}</span>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-2xl border border-[#30363d] bg-[#161b22] p-4 sm:p-8 overflow-hidden min-h-[220px]">
        <div
          className={`w-full transition-all duration-300 flex items-center justify-center ${
            isCompact ? "max-w-[350px]" : "max-w-[495px]"
          }`}
        >
          <img
            src={previewUrl}
            alt={`${metrics.displayName}'s Developer Profile Card`}
            className="w-full h-auto rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>
      </div>

      <p className="text-center text-xs text-[#848d97]">
        Live vector SVG rendered by server engine. Updates in real-time as you adjust settings.
      </p>
    </div>
  );
}
