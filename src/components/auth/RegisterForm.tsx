"use client";

import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { register } from "@/server/actions/register";
import { GenderSelect } from "@/components/ui/GenderSelect";
import { BranchSelect } from "@/components/ui/BranchSelect";
import { BatchSelect } from "@/components/ui/BatchSelect";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  sendFirebaseVerification,
  signInWithGoogle,
  signInWithApple,
} from "@/lib/firebase/auth-service";

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

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");
  // Controlled state for academic dropdown fields (T014, T016)
  const [branch, setBranch] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setErrors({});
    try {
      const res = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (!res.success || !res.user) {
        setErrors({ form: [res.error || `Failed to sign in with ${provider}`] });
        return;
      }
      const signInRes = await signIn("firebase-social", {
        email: res.user.email,
        name: res.user.displayName || res.user.email.split("@")[0],
        firebaseUid: res.user.uid,
        redirect: false,
      });
      if (signInRes?.error) {
        setErrors({ form: [signInRes.error] });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setErrors({ form: [msg] });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    setDevVerifyUrl(null);

    const formData = new FormData(e.currentTarget);
    const values = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      leetcodeUsername: formData.get("leetcodeUsername") as string,
      gender: gender as "MALE" | "FEMALE",
      admissionYear: admissionYear ? Number(admissionYear) : undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      branch: branch || undefined,
    };

    startTransition(async () => {
      const result = await register(values);
      if (result.error) {
        if (typeof result.error === "object") {
          setErrors(result.error as Record<string, string[]>);
        }
      }
      if (result.success) {
        if (isFirebaseConfigured()) {
          sendFirebaseVerification(values.email, values.password).catch(console.error);
        }

        // Auto sign-in immediately so user is not prompted to log in again!
        const loginRes = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (loginRes?.error) {
          setSuccess(result.success);
          if (result.devVerifyUrl) {
            setDevVerifyUrl(result.devVerifyUrl);
          }
        } else {
          router.push("/dashboard");
          router.refresh();
        }
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
            or register with email
          </span>
        </div>
      </div>

      {errors.form && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-rose-700 dark:text-rose-300 text-xs">
          {errors.form[0]}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
          <p className="font-semibold">{success}</p>
          {devVerifyUrl && (
            <div className="pt-1">
              <a
                href={devVerifyUrl}
                className="inline-flex items-center gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Click here to verify email instantly &rarr;
              </a>
            </div>
          )}
        </div>
      )}

      {/* Full Name (FR-001) */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          Full Name <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
          placeholder="Enter your full name"
          className="w-full rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/50 px-4 py-2.5 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.name && <p className="text-sm text-rose-500 dark:text-rose-400">{errors.name[0]}</p>}
      </div>

      {/* Email (FR-001, FR-002) */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          Email <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/50 px-4 py-2.5 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.email && <p className="text-sm text-rose-500 dark:text-rose-400">{errors.email[0]}</p>}
      </div>

      {/* Password (FR-031) */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          Password <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          disabled={isPending}
          placeholder="Minimum 6 characters"
          className="w-full rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/50 px-4 py-2.5 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.password && <p className="text-sm text-rose-500 dark:text-rose-400">{errors.password[0]}</p>}
      </div>

      {/* LeetCode Username (FR-002) */}
      <div className="space-y-1.5">
        <label htmlFor="leetcodeUsername" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          LeetCode Username <span className="text-rose-500 dark:text-rose-400">*</span>
        </label>
        <input
          id="leetcodeUsername"
          name="leetcodeUsername"
          type="text"
          required
          disabled={isPending}
          placeholder="Your LeetCode handle"
          className="w-full rounded-lg border border-stone-300/80 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-800/50 px-4 py-2.5 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.leetcodeUsername && <p className="text-sm text-rose-500 dark:text-rose-400">{errors.leetcodeUsername[0]}</p>}
      </div>

      {/* Gender (FR-003, US6) */}
      <GenderSelect
        value={gender}
        onChange={setGender}
        error={errors.gender?.[0]}
        disabled={isPending}
      />

      {/* Optional Academic Fields (FR-007) */}
      <details className="group">
        <summary className="text-sm font-medium text-stone-600 dark:text-zinc-400 cursor-pointer hover:text-stone-900 dark:hover:text-zinc-300 transition-colors">
          Academic Information (Optional)
        </summary>
        <div className="mt-3 space-y-4 pl-1">
          <div className="grid grid-cols-2 gap-4">
            <BatchSelect
              mode="admission"
              value={admissionYear}
              onChange={setAdmissionYear}
              disabled={isPending}
            />
            <BatchSelect
              mode="graduation"
              value={graduationYear}
              onChange={setGraduationYear}
              disabled={isPending}
            />
          </div>
          <BranchSelect
            value={branch}
            onChange={setBranch}
            disabled={isPending}
          />
        </div>
      </details>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
