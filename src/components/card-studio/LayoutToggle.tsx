"use client";

import type { CardLayout } from "@/types/profile-card";
import { LayoutGrid, Minimize2 } from "lucide-react";

interface LayoutToggleProps {
  selectedLayout: CardLayout;
  onSelectLayout: (layout: CardLayout) => void;
}

export function LayoutToggle({
  selectedLayout,
  onSelectLayout,
}: LayoutToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[#c9d1d9]">Dimension Layout</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectLayout("standard")}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
            selectedLayout === "standard"
              ? "border-[#484f58] bg-[#21262d] text-[#e6edf3]"
              : "border-[#30363d] bg-[#0d1117] text-[#848d97] hover:border-[#484f58] hover:text-[#e6edf3]"
          }`}
        >
          <div className="mt-0.5 rounded-lg p-2 bg-[#161b22] text-[#848d97]">
            <LayoutGrid className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[#e6edf3]">Standard Banner</span>
            <span className="text-[11px] text-[#848d97]">495 &times; 195px &bull; Full metrics</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectLayout("compact")}
          className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
            selectedLayout === "compact"
              ? "border-[#484f58] bg-[#21262d] text-[#e6edf3]"
              : "border-[#30363d] bg-[#0d1117] text-[#848d97] hover:border-[#484f58] hover:text-[#e6edf3]"
          }`}
        >
          <div className="mt-0.5 rounded-lg p-2 bg-[#161b22] text-[#848d97]">
            <Minimize2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-[#e6edf3]">Compact Badge</span>
            <span className="text-[11px] text-[#848d97]">350 &times; 120px &bull; Minimalist</span>
          </div>
        </button>
      </div>
    </div>
  );
}
