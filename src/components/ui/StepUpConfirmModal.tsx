"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface StepUpConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmWord?: string;
  isDestructive?: boolean;
  isPending?: boolean;
}

export function StepUpConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord = "CONFIRM",
  isDestructive = true,
  isPending = false,
}: StepUpConfirmModalProps) {
  const [typedWord, setTypedWord] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTypedWord("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const isMatch = typedWord.trim() === confirmWord;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch || isPending) return;
    await onConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-up-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="flex flex-col w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 p-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isDestructive
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 id="step-up-title" className="text-base font-semibold text-zinc-100">
                {title}
              </h3>
              <span className="text-xs text-zinc-400">Step-Up Authorization Required</span>
            </div>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <p className="text-xs text-zinc-300 leading-relaxed">{description}</p>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex flex-col gap-2">
            <label htmlFor="confirm-input" className="text-xs text-zinc-400">
              Please type <span className="font-mono font-bold text-zinc-200">{confirmWord}</span> to
              confirm this operation:
            </label>
            <input
              id="confirm-input"
              type="text"
              autoFocus
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={confirmWord}
              disabled={isPending}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isMatch || isPending}
              className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                isDestructive
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20"
              }`}
            >
              {isPending ? "Executing..." : "Confirm & Execute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
