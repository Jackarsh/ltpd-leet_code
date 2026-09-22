"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyFirebaseCode } from "@/lib/firebase/auth-service";
import { activateFirebaseVerifiedUser } from "@/server/actions/verify-firebase";

function FirebaseVerifyContent() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const email = searchParams.get("email");
  const mode = searchParams.get("mode");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function processVerification() {
      if (!oobCode) {
        setStatus("error");
        setErrorMessage("Missing verification code in link.");
        return;
      }

      // 1. Verify action code with Firebase Auth
      const fbResult = await verifyFirebaseCode(oobCode);
      if (!fbResult.success) {
        setStatus("error");
        setErrorMessage(fbResult.error || "Failed to verify email link.");
        return;
      }

      // 2. If email is provided, activate account in local PostgreSQL database
      if (email) {
        const dbResult = await activateFirebaseVerifiedUser(email);
        if (dbResult.error) {
          setStatus("error");
          setErrorMessage(dbResult.error);
          return;
        }
      }

      setStatus("success");
    }

    processVerification();
  }, [oobCode, email, mode]);

  if (status === "loading") {
    return (
      <div className="text-center space-y-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
        <p className="text-sm text-slate-300">
          Connecting to Firebase to validate your verification token.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-5 py-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Email Verified!</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto">
            Your CodeRank account{email ? ` (${email})` : ""} has been verified and activated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-block rounded-full bg-white text-[#0b132b] hover:bg-slate-100 px-6 py-2.5 text-xs font-bold transition-all shadow-md btn-press"
          >
            Go to Platform & Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-5 py-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
        <XCircle className="h-10 w-10" />
      </div>
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Verification Failed</h2>
        <p className="text-sm text-red-300 mt-2 max-w-sm mx-auto">
          {errorMessage || "The verification link is invalid or has already been used."}
        </p>
      </div>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-block rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 text-xs font-semibold transition-all"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function FirebaseVerifyPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b132b]/95 p-8 shadow-2xl backdrop-blur-md">
        <Suspense
          fallback={
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
            </div>
          }
        >
          <FirebaseVerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
