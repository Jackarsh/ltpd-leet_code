"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { newPassword } from "@/server/actions/new-password";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function NewPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-zinc-400">Invalid or missing reset token.</p>
        <Link href="/auth/forgot-password" className="text-indigo-400 hover:text-indigo-300">Request a new reset link</Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result = await newPassword({ password, token });
      if (result.error) setError(result.error);
      if (result.success) setMessage(result.success);
    });
  };

  return (
    <>
      <h2 className="mb-6 text-xl font-semibold text-zinc-100">Set a new password</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm">
            {message} <Link href="/auth/login" className="underline">Sign in now</Link>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm">{error}</div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">New Password</label>
          <input id="password" name="password" type="password" required minLength={6} disabled={isPending} placeholder="Minimum 6 characters" className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50" />
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-400">Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}
