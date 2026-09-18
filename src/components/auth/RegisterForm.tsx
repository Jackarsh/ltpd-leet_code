"use client";

import React, { useState, useTransition } from "react";
import { register } from "@/server/actions/register";
import { GenderSelect } from "@/components/ui/GenderSelect";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [gender, setGender] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const values = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      leetcodeUsername: formData.get("leetcodeUsername") as string,
      gender: gender as "MALE" | "FEMALE",
      admissionYear: formData.get("admissionYear") ? Number(formData.get("admissionYear")) : undefined,
      graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
      branch: (formData.get("branch") as string) || undefined,
    };

    startTransition(async () => {
      const result = await register(values);
      if (result.error) {
        if (typeof result.error === "object") {
          setErrors(result.error as Record<string, string[]>);
        }
      }
      if (result.success) {
        setSuccess(result.success);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm">
          {success}
        </div>
      )}

      {/* Full Name (FR-002) */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-300">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
          placeholder="Enter your full name"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.name && <p className="text-sm text-rose-400">{errors.name[0]}</p>}
      </div>

      {/* Email (FR-001, FR-002) */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-zinc-300">
          Email <span className="text-rose-400">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isPending}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.email && <p className="text-sm text-rose-400">{errors.email[0]}</p>}
      </div>

      {/* Password (FR-031) */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-zinc-300">
          Password <span className="text-rose-400">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          disabled={isPending}
          placeholder="Minimum 6 characters"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.password && <p className="text-sm text-rose-400">{errors.password[0]}</p>}
      </div>

      {/* LeetCode Username (FR-002) */}
      <div className="space-y-1.5">
        <label htmlFor="leetcodeUsername" className="text-sm font-medium text-zinc-300">
          LeetCode Username <span className="text-rose-400">*</span>
        </label>
        <input
          id="leetcodeUsername"
          name="leetcodeUsername"
          type="text"
          required
          disabled={isPending}
          placeholder="Your LeetCode handle"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
        />
        {errors.leetcodeUsername && <p className="text-sm text-rose-400">{errors.leetcodeUsername[0]}</p>}
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
        <summary className="text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-300 transition-colors">
          Academic Information (Optional)
        </summary>
        <div className="mt-3 space-y-4 pl-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="admissionYear" className="text-xs text-zinc-400">Admission Year</label>
              <input
                id="admissionYear"
                name="admissionYear"
                type="number"
                disabled={isPending}
                placeholder="e.g. 2022"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="graduationYear" className="text-xs text-zinc-400">Graduation Year</label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="number"
                disabled={isPending}
                placeholder="e.g. 2026"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="branch" className="text-xs text-zinc-400">Branch</label>
            <input
              id="branch"
              name="branch"
              type="text"
              disabled={isPending}
              placeholder="e.g. Computer Science"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>
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
