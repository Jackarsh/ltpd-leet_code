"use client";

import React, { useState, useTransition } from "react";
import { resetPassword } from "@/server/actions/reset-password";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    startTransition(async () => {
      const result = await resetPassword({ email });
      if (result.error) setError(result.error);
      if (result.success) setMessage(result.success);
    });
  };

  return (
    <>
      <h2 className="mb-2 text-xl font-semibold text-zinc-100">Forgot your password?</h2>
      <p className="mb-6 text-sm text-zinc-400">Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
        </div>

        <button type="submit" disabled={isPending} className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>

        <p className="text-center text-sm text-zinc-500">
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Back to sign in</Link>
        </p>
      </form>
    </>
  );
}
