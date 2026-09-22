"use client";

import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { resendVerification } from "@/server/actions/resend-verification";
import { checkLoginStatus, devAutoVerifyUser } from "@/server/actions/check-login-status";
import { signInWithGoogle, signInWithApple } from "@/lib/firebase/auth-service";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.71-11.7-14.01-6.19-9.56-11.19-20.91-14.99-34.06-3.8-13.15-5.7-25.17-5.7-36.06 0-14.35 3.58-26.31 10.74-35.88 7.16-9.56 16.09-14.45 26.79-14.67 4.9.11 10.35 1.34 16.34 3.7 5.99 2.36 10.15 3.59 12.47 3.69 2.08 0 6.39-1.28 12.92-3.84 6.53-2.56 11.96-3.73 16.29-3.52 14.57 1.07 25.8 6.64 33.69 16.71-12.18 7.39-18.17 17.51-17.97 30.34.2 10.12 4.09 18.66 11.67 25.62 7.58 6.96 16.39 10.89 26.43 11.79-2.28 7.18-5.32 14.53-9.12 22.07zM119.22 33.09c0-7.07 2.61-13.78 7.83-20.14 5.22-6.36 11.63-10.66 19.23-12.91.43 2.17.65 4.35.65 6.53 0 7.28-2.67 14.13-8.01 20.55-5.34 6.42-11.89 10.59-19.65 12.51-.05-2.18-.05-4.36-.05-6.54z" />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setError(null);
    try {
      const res = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (!res.success || !res.user) {
        setError(res.error || `Failed to sign in with ${provider}`);
        return;
      }
      const signInRes = await signIn("firebase-social", {
        email: res.user.email,
        name: res.user.displayName || res.user.email.split("@")[0],
        firebaseUid: res.user.uid,
        redirect: false,
      });
      if (signInRes?.error) {
        setError(signInRes.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setError(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsUnverified(false);
    setDevVerifyUrl(null);
    setResendSuccess(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setCurrentEmail(email);
    setCurrentPassword(password);

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Accurately determine failure reason
        const status = await checkLoginStatus(email);
        if (status.reason === "LOCKED") {
          setError("Account is temporarily locked. Please try again in 15 minutes.");
        } else if (status.reason === "UNVERIFIED") {
          setError("Please verify your email before logging in.");
          setIsUnverified(true);
          setDevVerifyUrl(status.devVerifyUrl ?? null);
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleDevAutoVerify = () => {
    if (!currentEmail) return;
    startTransition(async () => {
      await devAutoVerifyUser(currentEmail);
      // Auto sign in now that user is verified
      const result = await signIn("credentials", {
        email: currentEmail,
        password: currentPassword,
        redirect: false,
      });
      if (result?.error) {
        setError("Account verified! Please re-enter your password to sign in.");
        setIsUnverified(false);
        setDevVerifyUrl(null);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
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
      {/* Social Login Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          disabled={isPending || Boolean(socialLoading)}
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-stone-300/80 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 text-xs font-semibold text-stone-800 dark:text-white transition-all shadow-sm disabled:opacity-50"
        >
          {socialLoading === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin text-stone-600 dark:text-white" />
          ) : (
            <GoogleIcon className="h-4 w-4" />
          )}
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          disabled={isPending || Boolean(socialLoading)}
          onClick={() => handleSocialLogin("apple")}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-stone-300/80 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-stone-50 dark:hover:bg-white/10 text-xs font-semibold text-stone-800 dark:text-white transition-all shadow-sm disabled:opacity-50"
        >
          {socialLoading === "apple" ? (
            <Loader2 className="h-4 w-4 animate-spin text-stone-600 dark:text-white" />
          ) : (
            <AppleIcon className="h-4 w-4 text-stone-900 dark:text-white" />
          )}
          <span>Continue with Apple</span>
        </button>
      </div>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200 dark:border-white/10" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-white dark:bg-[#121820] px-2 text-stone-500 dark:text-[#848d97]">
            or continue with email
          </span>
        </div>
      </div>

      {resendSuccess && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
          <MailCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{resendSuccess}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-700 dark:text-rose-300 text-xs space-y-3">
          <p className="font-semibold">{error}</p>
          {isUnverified && (
            <div className="flex flex-col gap-2 pt-1">
              {devVerifyUrl && (
                <button
                  type="button"
                  onClick={handleDevAutoVerify}
                  disabled={isPending}
                  className="btn-press inline-flex items-center justify-center gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-colors shadow-sm self-start"
                >
                  Verify Email Instantly (Dev Mode) &rarr;
                </button>
              )}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 underline hover:text-rose-800 dark:hover:text-white transition-colors disabled:opacity-50 self-start"
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
        <label htmlFor="email" className="text-xs font-semibold text-stone-700 dark:text-slate-300">
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
          className="w-full rounded-xl border border-stone-300/80 dark:border-slate-700 bg-stone-50/60 dark:bg-slate-800/60 px-4 py-2.5 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-stone-400 dark:focus:border-slate-500 focus:outline-none transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold text-stone-700 dark:text-slate-300">
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline transition-colors"
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
          className="w-full rounded-xl border border-stone-300/80 dark:border-slate-700 bg-stone-50/60 dark:bg-slate-800/60 px-4 py-2.5 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-stone-400 dark:focus:border-slate-500 focus:outline-none transition-all disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full btn-press rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-stone-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-colors"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}