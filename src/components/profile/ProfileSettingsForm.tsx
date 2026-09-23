"use client";

import React, { useState, useTransition } from "react";
import { updateProfile } from "@/server/actions/update-profile";
import { changeEmail } from "@/server/actions/change-email";
import { GenderSelect } from "@/components/ui/GenderSelect";
import { BranchSelect } from "@/components/ui/BranchSelect";
import { BatchSelect } from "@/components/ui/BatchSelect";
import { normalizeBranch } from "@/lib/constants/branches";
import { Loader2, Save, Mail } from "lucide-react";

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
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [gender, setGender] = useState(initialData.gender);

  // Controlled state for dropdown fields — normalise legacy branch abbreviation
  const [branch, setBranch] = useState(normalizeBranch(initialData.branch) ?? "");
  const [admissionYear, setAdmissionYear] = useState(
    initialData.admissionYear != null ? String(initialData.admissionYear) : ""
  );
  const [graduationYear, setGraduationYear] = useState(
    initialData.graduationYear != null ? String(initialData.graduationYear) : ""
  );

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
      admissionYear: admissionYear ? Number(admissionYear) : null,
      graduationYear: graduationYear ? Number(graduationYear) : null,
      branch: branch || null,
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

  const inputCls =
    "w-full rounded-md border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-3.5 py-2 text-xs text-slate-900 dark:text-[#e6edf3] placeholder-slate-400 dark:placeholder-[#6e7681] focus:border-blue-500 dark:focus:border-[#484f58] focus:outline-none transition-colors disabled:opacity-50";

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-[#e6edf3] border-b border-slate-100 dark:border-[#21262d] pb-3">
          Academic &amp; Personal Profile
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {success && (
            <div className="rounded-lg bg-emerald-50 dark:bg-[#21262d] border border-emerald-200 dark:border-[#238636]/40 p-3 text-xs text-emerald-700 dark:text-[#3fb950]">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-xs font-medium text-slate-600 dark:text-[#848d97]">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={initialData.displayName}
              disabled={isPending}
              className={inputCls}
            />
            {errors.displayName && <p className="text-xs text-rose-500 dark:text-[#f85149]">{errors.displayName[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="leetcodeUsername" className="text-xs font-medium text-slate-600 dark:text-[#848d97]">
              LeetCode Username
            </label>
            <input
              id="leetcodeUsername"
              name="leetcodeUsername"
              defaultValue={initialData.leetcodeUsername}
              disabled={isPending}
              className={inputCls}
            />
            {errors.leetcodeUsername && <p className="text-xs text-rose-500 dark:text-[#f85149]">{errors.leetcodeUsername[0]}</p>}
          </div>

          <GenderSelect value={gender} onChange={setGender} error={errors.gender?.[0]} disabled={isPending} />

          {/* Batch year dropdowns (T017) */}
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

          {/* Branch dropdown (T015) — legacy values normalised via normalizeBranch in state init */}
          <BranchSelect
            value={branch}
            onChange={setBranch}
            error={errors.branch?.[0]}
            disabled={isPending}
          />

          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-xs font-medium text-slate-600 dark:text-[#848d97]">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={300}
              defaultValue={initialData.bio ?? ""}
              disabled={isPending}
              placeholder="Tell others a bit about yourself (max 300 characters)..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-press rounded-md bg-slate-100 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-[#e6edf3] hover:bg-slate-200 dark:hover:bg-[#30363d] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 text-slate-500 dark:text-[#848d97]" />}
            <span>{isPending ? "Saving..." : "Save Profile"}</span>
          </button>
        </form>
      </div>

      {/* Account Email & Security */}
      <div className="rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#21262d] pb-3">
          <Mail className="h-4 w-4 text-slate-400 dark:text-[#848d97]" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[#e6edf3]">Account Email Address</h2>
        </div>

        <p className="text-xs text-slate-500 dark:text-[#848d97]">
          Current email:{" "}
          <span className="font-semibold text-slate-900 dark:text-[#e6edf3]">{initialData.email || "configured"}</span>.{" "}
          Changing your email sends a confirmation link to the new address. Your current email remains active until verified.
        </p>

        {emailSuccess && (
          <div className="rounded-lg bg-emerald-50 dark:bg-[#21262d] border border-emerald-200 dark:border-[#238636]/40 p-3 text-xs text-emerald-700 dark:text-[#3fb950]">
            {emailSuccess}
          </div>
        )}

        {emailError && (
          <div className="rounded-lg bg-rose-50 dark:bg-[#21262d] border border-rose-200 dark:border-[#f85149]/40 p-3 text-xs text-rose-600 dark:text-[#f85149]">
            {emailError}
          </div>
        )}

        <form onSubmit={handleEmailChangeSubmit} className="space-y-3 max-w-md">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isEmailPending}
            placeholder="Enter new email address..."
            className={inputCls}
          />
          <button
            type="submit"
            disabled={isEmailPending || !newEmail.trim()}
            className="btn-press rounded-md bg-slate-100 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] px-4 py-2 text-xs font-semibold text-slate-800 dark:text-[#e6edf3] hover:bg-slate-200 dark:hover:bg-[#30363d] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isEmailPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isEmailPending ? "Sending Verification..." : "Update Email"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
