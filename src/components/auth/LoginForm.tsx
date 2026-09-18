"use client";

import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { resendVerification } from "@/server/actions/resend-verification";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setResendSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setCurrentEmail(email);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("locked")) {
          setError("Account is temporarily locked. Please try again in 15 minutes.");
        } else if (result.error.includes("verify")) {
          setError("Please verify your email before logging in.");
          setIsUnverified(true);
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleResend = () => {
    if (!currentEmail) return;
    setResendSuccess(null);

    startResendTransition(async () => {
      const result = await resendVerification({ email: currentEmail });
      if (result.success) {
        setResendSuccess(result.success);
      } else if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {resendSuccess && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm flex items-start gap-2">
          <MailCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <span>{resendSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm space-y-3">
          <p>{error}</p>
          {isUnverified && (
            <div>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-200 underline hover:text-white transition-colors disabled:opacity-50"
              >
                {isResending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          onChange={(e) => setCurrentEmail(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isPending}
          placeholder="Enter your password"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}