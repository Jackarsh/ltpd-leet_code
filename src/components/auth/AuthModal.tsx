"use client";

import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { register } from "@/server/actions/register";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  sendFirebaseVerification,
  signInWithGoogle,
  signInWithApple,
} from "@/lib/firebase/auth-service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

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

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isPending, startTransition] = useTransition();
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLeetcode, setRegLeetcode] = useState("");
  const [regGender, setRegGender] = useState<"MALE" | "FEMALE">("MALE");
  const [regBranch, setRegBranch] = useState("CSE");
  const [regBatch, setRegBatch] = useState("2026");
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    setLoginError(null);
    setRegError(null);
    try {
      const res = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (!res.success || !res.user) {
        const errText = res.error || `Failed to sign in with ${provider}`;
        setLoginError(errText);
        setRegError(errText);
        return;
      }

      const signInRes = await signIn("firebase-social", {
        email: res.user.email,
        name: res.user.displayName || res.user.email.split("@")[0],
        firebaseUid: res.user.uid,
        redirect: false,
      });

      if (signInRes?.error) {
        setLoginError(signInRes.error);
        setRegError(signInRes.error);
      } else {
        onClose();
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to sign in with ${provider}`;
      setLoginError(msg);
      setRegError(msg);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });
      if (result?.error) {
        setLoginError("Invalid email or password");
      } else {
        onClose();
        router.refresh();
      }
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    startTransition(async () => {
      const result = await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        leetcodeUsername: regLeetcode,
        gender: regGender,
        branch: regBranch,
        graduationYear: parseInt(regBatch, 10),
      });

      if (result?.error) {
        const err = result.error as Record<string, string[]> | string;
        const errMsg = typeof err === "string" ? err : Object.values(err).flat().join(", ");
        setRegError(errMsg);
      } else {
        // Dispatch Firebase verification email in background
        if (isFirebaseConfigured()) {
          sendFirebaseVerification(regEmail, regPassword).catch(console.error);
        }

        // Auto sign-in immediately so user is not asked to sign in again
        const loginRes = await signIn("credentials", {
          email: regEmail,
          password: regPassword,
          redirect: false,
        });

        if (loginRes?.error) {
          setRegError(loginRes.error);
        } else {
          onClose();
          router.refresh();
        }
      }
    });
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-[#0d1117] px-3.5 py-2 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-white/30 focus:outline-none transition-colors";
  const inputSmCls =
    "w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-white/30 focus:outline-none";
  const selectCls =
    "w-full rounded-xl border border-white/10 bg-[#0d1117] px-2 py-1.5 text-xs text-[#e6edf3] focus:border-white/30 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#161b22] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 rounded-full p-1.5 text-[#6e7681] hover:text-[#e6edf3] hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Tab switch */}
        <div className="flex gap-4 mb-5 border-b border-white/10 pb-3">
          <button
            onClick={() => setMode("login")}
            className={`text-sm font-semibold transition-colors pb-1 ${
              mode === "login"
                ? "text-white border-b-2 border-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`text-sm font-semibold transition-colors pb-1 ${
              mode === "register"
                ? "text-white border-b-2 border-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Social Sign-In Buttons */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            disabled={isPending || Boolean(socialLoading)}
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
          >
            {socialLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            disabled={isPending || Boolean(socialLoading)}
            onClick={() => handleSocialLogin("apple")}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all shadow-sm disabled:opacity-50"
          >
            {socialLoading === "apple" ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <AppleIcon className="h-4 w-4 text-white" />
            )}
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-[#161b22] px-2 text-[#848d97]">or with email</span>
          </div>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="name@college.edu"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              disabled={isPending || Boolean(socialLoading)}
              className="w-full rounded-xl bg-white text-[#0b132b] hover:bg-slate-100 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isPending ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {regError && (
              <div className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300">
                {regError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Alex Coder"
                className={inputSmCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="alex@college.edu"
                className={inputSmCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">LeetCode Handle</label>
              <input
                type="text"
                required
                value={regLeetcode}
                onChange={(e) => setRegLeetcode(e.target.value)}
                placeholder="leetcode_handle"
                className={inputSmCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={inputSmCls}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Gender</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value as "MALE" | "FEMALE")}
                  className={selectCls}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Branch</label>
                <select
                  value={regBranch}
                  onChange={(e) => setRegBranch(e.target.value)}
                  className={selectCls}
                >
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="MECH">MECH</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Batch</label>
                <select
                  value={regBatch}
                  onChange={(e) => setRegBatch(e.target.value)}
                  className={selectCls}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || Boolean(socialLoading)}
              className="w-full mt-2 rounded-xl bg-white text-[#0b132b] hover:bg-slate-100 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isPending ? "Creating account..." : "Join Platform"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
