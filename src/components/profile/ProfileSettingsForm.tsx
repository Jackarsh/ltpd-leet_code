"use client";

import React, { useState, useTransition } from "react";
import { updateProfile } from "@/server/actions/update-profile";
import { changeEmail } from "@/server/actions/change-email";
import { GenderSelect } from "@/components/ui/GenderSelect";
import { Loader2, Save, Mail, ShieldAlert } from "lucide-react";

interface ProfileSettingsFormProps {
  initialData: {
    displayName: string;
    gender: string;
    leetcodeUsername: string;
    admissionYear?: number | null;
    graduationYear?: number | null;
    branch?: string | null;
    bio?: string | null;
    email?: string;
  };
}

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  // Profile update state
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [gender, setGender] = useState(initialData.gender);

  // Email change state (FR-021)
  const [isEmailPending, startEmailTransition] = useTransition();
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const values: Record<string, unknown> = {
      displayName: formData.get("displayName") as string,
      gender,
      leetcodeUsername: formData.get("leetcodeUsername") as string,
      admissionYear: formData.get("admissionYear") ? Number(formData.get("admissionYear")) : null,
      graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : null,
      branch: (formData.get("branch") as string) || null,
      bio: (formData.get("bio") as string) || null,
    };

    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.error && typeof result.error === "object") {
        setErrors(result.error as Record<string, string[]>);
      }
      if (result.success) setSuccess(result.success);
    });
  };

  const handleEmailChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailSuccess(null);
    setEmailError(null);

    if (!newEmail.trim()) {
      setEmailError("Please enter a valid new email address.");
      return;
    }

    startEmailTransition(async () => {
      const result = await changeEmail({ newEmail });
      if (result.error) {
        setEmailError(result.error);
      }
      if (result.success) {
        setEmailSuccess(result.success);
        setNewEmail("");
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* ─── Profile Information ───────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-zinc-100 mb-6">Profile Information</h2>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {success && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-zinc-300">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={initialData.displayName}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            {errors.displayName && <p className="text-sm text-rose-400">{errors.displayName[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leetcodeUsername" className="text-sm font-medium text-zinc-300">LeetCode Username</label>
            <input
              id="leetcodeUsername"
              name="leetcodeUsername"
              defaultValue={initialData.leetcodeUsername}
              disabled={isPending}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            {errors.leetcodeUsername && <p className="text-sm text-rose-400">{errors.leetcodeUsername[0]}</p>}
          </div>

          <GenderSelect value={gender} onChange={setGender} error={errors.gender?.[0]} disabled={isPending} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="admissionYear" className="text-sm font-medium text-zinc-400">Admission Year</label>
              <input
                id="admissionYear"
                name="admissionYear"
                type="number"
                defaultValue={initialData.admissionYear ?? ""}
                disabled={isPending}
                placeholder="e.g. 2022"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="graduationYear" className="text-sm font-medium text-zinc-400">Graduation Year</label>
              <input
                id="graduationYear"
                name="graduationYear"
                type="number"
                defaultValue={initialData.graduationYear ?? ""}
                disabled={isPending}
                placeholder="e.g. 2026"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="branch" className="text-sm font-medium text-zinc-400">Branch</label>
            <input
              id="branch"
              name="branch"
              defaultValue={initialData.branch ?? ""}
              disabled={isPending}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-zinc-400">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={300}
              defaultValue={initialData.bio ?? ""}
              disabled={isPending}
              placeholder="Tell others a bit about yourself (max 300 characters)..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-indigo-600/30"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* ─── Account Email & Security (FR-021) ─────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Account Email Address</h2>
        </div>

        <p className="text-sm text-zinc-400 mb-6">
          Your current email address is <span className="font-semibold text-zinc-200">{initialData.email || "configured"}</span>.
          Changing your email will send a confirmation link to the new address. Your current email remains active until the new one is verified.
        </p>

        {emailSuccess && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-300 text-sm mb-6">
            {emailSuccess}
          </div>
        )}

        {emailError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-rose-300 text-sm mb-6">
            {emailError}
          </div>
        )}

        <form onSubmit={handleEmailChangeSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label htmlFor="newEmail" className="text-sm font-medium text-zinc-300">
              New Email Address
            </label>
            <input
              id="newEmail"
              name="newEmail"
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={isEmailPending}
              placeholder="new.email@example.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isEmailPending}
            className="rounded-lg bg-zinc-800 border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isEmailPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {isEmailPending ? "Sending Verification..." : "Request Email Change"}
          </button>
        </form>
      </div>
    </div>
  );
}