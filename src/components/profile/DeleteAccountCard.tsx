"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { StepUpConfirmModal } from "@/components/ui/StepUpConfirmModal";
import { deleteAccount } from "@/server/actions/delete-account";

export function DeleteAccountCard() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const res = await deleteAccount();
      if (res?.error) {
        alert(res.error);
        setIsPending(false);
        setIsModalOpen(false);
      } else {
        // Sign out on the client to clear session, and redirect to home
        await signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      alert("Something went wrong deleting your account.");
      setIsPending(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-red-400">Danger Zone</h2>
              <p className="mt-1 text-sm text-stone-500 dark:text-red-300/70 max-w-lg">
                Permanently delete your account and all associated data. This action cannot be undone. All your LeetCode stats, achievements, and leaderboard rankings will be permanently erased.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center justify-center gap-2 h-10 self-start mt-2 sm:mt-0"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      <StepUpConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Your Account"
        description="Are you absolutely sure you want to permanently delete your account? All your statistics, achievements, and configurations will be permanently destroyed. This action cannot be reversed."
        confirmWord="DELETE"
        isDestructive={true}
        isPending={isPending}
      />
    </>
  );
}
