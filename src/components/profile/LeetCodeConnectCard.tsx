"use client";

import React, { useState, useTransition } from "react";
import { linkLeetCodeAccount } from "@/server/actions/link-leetcode";
import { Loader2, Link2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface Props {
  currentUsername?: string;
  isVerified?: boolean;
}

export function LeetCodeConnectCard({ currentUsername, isVerified }: Props) {
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
      }
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-sm">
            LC
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              LeetCode Integration
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-normal">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400">
              Connect your public profile to sync solved problems and ratings
            </p>
          </div>
        </div>

        {currentUsername && (
          <a
            href={`https://leetcode.com/${currentUsername}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            LeetCode Profile <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label htmlFor="lcUsername" className="text-sm font-medium text-zinc-300">
            LeetCode Username
          </label>
          <input
            id="lcUsername"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isPending}
            placeholder="e.g. tour_de_force"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/30"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          {isPending ? "Validating with LeetCode..." : currentUsername ? "Update Username" : "Connect Account"}
        </button>
      </form>
    </div>
  );
}