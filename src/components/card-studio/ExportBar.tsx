"use client";

import { useState, useMemo } from "react";
import { Check, Copy, Link } from "lucide-react";
import type { CardTheme, CardLayout } from "@/types/profile-card";

interface ExportBarProps {
  displayName: string;
  username: string;
  cardToken: string;
  theme: CardTheme;
  layout: CardLayout;
}

export function ExportBar({
  displayName,
  username,
  cardToken,
  theme,
  layout,
}: ExportBarProps) {
  const [useToken, setUseToken] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const slug = useToken ? cardToken : username;

  const cardImageUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (theme && theme !== "github-dark") {
      params.set("theme", theme);
    }
    if (layout === "compact") {
      params.set("layout", "compact");
    }
    const query = params.toString();
    return `${origin}/api/cards/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`;
  }, [origin, slug, theme, layout]);

  const profileUrl = `${origin}/profiles/${encodeURIComponent(username)}`;
  const markdownSnippet = `[![${displayName}'s Coding Stats](${cardImageUrl})](${profileUrl})`;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown to clipboard:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(cardImageUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL to clipboard:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#21262d] pb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e6edf3]">Share & Embed</h3>
          <p className="text-xs text-[#848d97]">
            Paste into your GitHub profile README, personal portfolio, or blog.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-[#848d97] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useToken}
            onChange={(e) => setUseToken(e.target.checked)}
            className="rounded border-[#30363d] bg-[#0d1117] text-[#e6edf3] focus:ring-0"
          />
          <span className="text-[#c9d1d9]">
            Use private token slug (anonymize URL)
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#21262d] border border-[#30363d] px-4 py-2.5 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] active:scale-[0.98] transition-all"
        >
          {copiedMarkdown ? (
            <>
              <Check className="h-4 w-4 text-[#e6edf3]" />
              <span>Copied Markdown!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[#848d97]" />
              <span>Copy GitHub Markdown</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyUrl}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#0d1117] px-4 py-2.5 text-xs font-semibold text-[#c9d1d9] hover:bg-[#21262d] active:scale-[0.98] transition-all"
        >
          {copiedUrl ? (
            <>
              <Check className="h-4 w-4 text-[#e6edf3]" />
              <span>Copied Image URL!</span>
            </>
          ) : (
            <>
              <Link className="h-4 w-4 text-[#848d97]" />
              <span>Copy Direct Image URL</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-medium text-[#848d97]">Markdown Snippet</span>
        <code className="rounded-xl border border-[#30363d] bg-[#0d1117] p-3 text-xs font-mono text-[#c9d1d9] break-all select-all">
          {markdownSnippet}
        </code>
      </div>
    </div>
  );
}
