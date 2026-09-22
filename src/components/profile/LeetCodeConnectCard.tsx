"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { linkLeetCodeAccount } from "@/server/actions/link-leetcode";
import { Loader2, Link2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface Props {
  currentUsername?: string;
  isVerified?: boolean;
}

export function LeetCodeConnectCard({ currentUsername, isVerified }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState(currentUsername || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await linkLeetCodeAccount({ username });
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs shadow-sm">
            LC
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-stone-900 dark:text-white flex items-center gap-2">
              LeetCode Account Integration
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Verified
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Connect your public profile to sync solved problems, contest ratings, and leaderboard rankings
            </p>
          </div>
        </div>

        {currentUsername && (
          <a
            href={`https://leetcode.com/u/${currentUsername}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span className="font-mono">@{currentUsername}</span>
            <ExternalLink className="h-3 w-3 text-stone-400 dark:text-slate-500" />
          </a>
        )}
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900 p-3 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="lcUsername" className="text-xs font-semibold text-stone-700 dark:text-slate-300">
            LeetCode Username
          </label>
          <div className="flex flex-col sm:flex-row gap-2 max-w-lg">
            <input
              id="lcUsername"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isPending}
              placeholder="e.g. neal_wu, tourist"
              className="flex-1 rounded-xl border border-stone-300/80 dark:border-slate-700 bg-stone-50/60 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-stone-400 dark:focus:border-slate-500 focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending || !username.trim()}
              className="btn-press rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Validating with LeetCode...</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-stone-400 dark:text-slate-500" />
                  <span>{currentUsername ? "Update & Sync" : "Connect Account"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
