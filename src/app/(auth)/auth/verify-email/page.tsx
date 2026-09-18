"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Suspense } from "react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const error = searchParams.get("error");

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-semibold text-zinc-100">Email Verified!</h2>
        <p className="text-zinc-400">Your account is now active. You can sign in.</p>
        <Link href="/auth/login" className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30">
          Sign In
        </Link>
      </div>
    );
  }

  if (status === "email_change_success") {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-semibold text-zinc-100">Email Changed!</h2>
        <p className="text-zinc-400">Your email address has been successfully updated and verified.</p>
        <Link href="/dashboard" className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (status === "already_verified") {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-16 w-16 text-amber-400 mx-auto" />
        <h2 className="text-xl font-semibold text-zinc-100">Already Verified</h2>
        <p className="text-zinc-400">Your account is already verified.</p>
        <Link href="/auth/login" className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30">
          Sign In
        </Link>
      </div>
    );
  }

  const errorMessages: Record<string, string> = {
    missing_token: "No verification token provided.",
    invalid_token: "This verification link is invalid.",
    expired_token: "This verification link has expired.",
    user_not_found: "Account not found.",
    email_taken: "This email address is now in use by another account.",
  };

  return (
    <div className="text-center space-y-4">
      <XCircle className="h-16 w-16 text-rose-400 mx-auto" />
      <h2 className="text-xl font-semibold text-zinc-100">Verification Failed</h2>
      <p className="text-zinc-400">{error ? errorMessages[error] || "An error occurred." : "Check your email for a verification link."}</p>
      <Link href="/auth/register" className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30">
        Try Again
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}