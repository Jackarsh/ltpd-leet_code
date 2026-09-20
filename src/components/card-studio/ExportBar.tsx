"use client";

import { useState, useMemo } from "react";
import { Check, Copy, Link, ExternalLink, ShieldCheck } from "lucide-react";
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

  // Derive origin safely on client or fallback to window.location
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
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Share & Embed</h3>
          <p className="text-xs text-zinc-400">
            Paste into your GitHub profile README, personal portfolio, or blog.
          </p>
        </div>

        {/* Private Token Toggle */}
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useToken}
            onChange={(e) => setUseToken(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-800 text-indigo-500 focus:ring-indigo-500/20"
          />
          <span className="flex items-center gap-1 text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            Use private token slug (anonymize URL)
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleCopyMarkdown}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all"
        >
          {copiedMarkdown ? (
            <>
              <Check className="h-4 w-4 text-white" />
              <span>Copied Markdown!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy GitHub Markdown</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopyUrl}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 active:scale-[0.98] transition-all"
        >
          {copiedUrl ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Copied Image URL!</span>
            </>
          ) : (
            <>
              <Link className="h-4 w-4" />
              <span>Copy Direct Image URL</span>
            </>
          )}
        </button>
      </div>

      {/* Raw Markdown Snippet Box */}
      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Markdown Preview
        </span>
        <div className="relative rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-mono text-zinc-400 overflow-x-auto whitespace-pre">
          {markdownSnippet}
        </div>
      </div>
    </div>
  );
}
