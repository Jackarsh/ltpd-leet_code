"use client";

import { useState, useEffect } from "react";
import type { AdminUserListItemDTO } from "@/types/admin";
import { Lock, X, UserCog, Check, AlertCircle } from "lucide-react";
import type { Gender } from "@prisma/client";

interface EditUserModalProps {
  user: AdminUserListItemDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: Partial<AdminUserListItemDTO>) => void;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [branch, setBranch] = useState("");
  const [admissionYear, setAdmissionYear] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName);
      setGender(user.gender ?? "");
      setBranch(user.branch ?? "");
      setAdmissionYear(user.admissionYear ? String(user.admissionYear) : "");
      setGraduationYear(user.graduationYear ? String(user.graduationYear) : "");
      setErrorMessage(null);
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        displayName,
        ...(gender && { gender }),
        branch: branch || null,
        ...(admissionYear && { admissionYear: parseInt(admissionYear, 10) }),
        ...(graduationYear && { graduationYear: parseInt(graduationYear, 10) }),
      };

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user.");
      }

      onSuccess({
        id: user.id,
        displayName,
        gender: gender || null,
        branch: branch || null,
        admissionYear: admissionYear ? parseInt(admissionYear, 10) : null,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error updating user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="flex flex-col w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h3 id="edit-user-title" className="text-base font-semibold text-zinc-100">
                Edit Student Profile
              </h3>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Read-Only Stats Banner (FR-603) */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span>Verified External Statistics (Read-Only)</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Coding statistics are synchronized directly from LeetCode. Administrative tampering is strictly prohibited (FR-603).
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                <span className="text-[10px] text-zinc-500 uppercase">Solved</span>
                <p className="text-xs font-bold text-zinc-200">{user.totalSolved}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                <span className="text-[10px] text-zinc-500 uppercase">Rating</span>
                <p className="text-xs font-bold text-zinc-200">{user.contestRating ?? "Unrated"}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2">
                <span className="text-[10px] text-zinc-500 uppercase">Streak</span>
                <p className="text-xs font-bold text-zinc-200">{user.currentStreak}d</p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Display Name</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={50}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* Academic Branch */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Academic Branch</label>
            <input
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Batch Years */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Admission Year</label>
              <input
                type="number"
                placeholder="2023"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Graduation Year</label>
              <input
                type="number"
                placeholder="2027"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
