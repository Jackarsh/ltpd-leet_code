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
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#21262d] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] font-mono font-bold text-xs">
            LC
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
              LeetCode Account Integration
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#e6edf3] bg-[#21262d] border border-[#30363d] px-2 py-0.5 rounded font-normal">
                  <CheckCircle2 className="h-3 w-3 text-[#3fb950]" /> Verified
                </span>
              )}
            </h2>
            <p className="text-xs text-[#848d97]">
              Connect your public profile to sync solved problems, contest ratings, and leaderboard rankings
            </p>
          </div>
        </div>

        {currentUsername && (
          <a
            href={`https://leetcode.com/u/${currentUsername}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#848d97] hover:text-[#e6edf3] flex items-center gap-1 self-start sm:self-auto transition-colors"
          >
            <span>@{currentUsername}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {success && (
        <div className="rounded-lg bg-[#21262d] border border-[#238636]/40 p-3 text-xs text-[#3fb950] flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-[#21262d] border border-[#f85149]/40 p-3 text-xs text-[#f85149] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="lcUsername" className="text-xs font-medium text-[#848d97]">
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
              className="flex-1 rounded-md border border-[#30363d] bg-[#0d1117] px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isPending || !username.trim()}
              className="btn-press rounded-md bg-[#21262d] border border-[#30363d] px-4 py-2 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Validating with LeetCode...</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-[#848d97]" />
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
