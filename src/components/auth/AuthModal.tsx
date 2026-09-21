"use client";

import React, { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { register } from "@/server/actions/register";

interface AuthModalProps { isOpen: boolean; onClose: () => void; initialMode?: "login" | "register"; }

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [isPending, startTransition] = useTransition();
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
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setLoginError(null);
    startTransition(async () => {
      const result = await signIn("credentials", { email: loginEmail, password: loginPassword, redirect: false });
      if (result?.error) { setLoginError("Invalid email or password"); } else { onClose(); router.refresh(); }
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setRegError(null); setRegSuccess(null);
    startTransition(async () => {
      const result = await register({ name: regName, email: regEmail, password: regPassword, leetcodeUsername: regLeetcode, gender: regGender, branch: regBranch, graduationYear: parseInt(regBatch, 10) });
      if (result?.error) {
        const err = result.error as Record<string, string[]> | string;
        const errMsg = typeof err === "string" ? err : Object.values(err).flat().join(", ");
        setRegError(errMsg);
      } else { setRegSuccess("Account created! Sign in to continue."); setMode("login"); }
    });
  };

  const inputCls = "w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#484f58] focus:outline-none transition-colors";
  const inputSmCls = "w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-[#484f58] focus:outline-none";
  const selectCls = "w-full rounded-md border border-[#30363d] bg-[#0d1117] px-2 py-1.5 text-xs text-[#e6edf3] focus:border-[#484f58] focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-3 right-3 rounded-md p-1 text-[#6e7681] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors">
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-4 mb-5 border-b border-[#21262d] pb-3">
          <button onClick={() => setMode("login")} className={`text-sm font-semibold transition-colors pb-1 ${mode === "login" ? "text-[#e6edf3] border-b-2 border-[#e6edf3]" : "text-[#848d97] hover:text-[#e6edf3]"}`}>Sign In</button>
          <button onClick={() => setMode("register")} className={`text-sm font-semibold transition-colors pb-1 ${mode === "register" ? "text-[#e6edf3] border-b-2 border-[#e6edf3]" : "text-[#848d97] hover:text-[#e6edf3]"}`}>Create Account</button>
        </div>

        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && <div className="p-2.5 rounded-md border border-[#30363d] bg-[#21262d] text-xs text-[#e6edf3]">{loginError}</div>}
            {regSuccess && <div className="p-2.5 rounded-md border border-[#30363d] bg-[#21262d] text-xs text-[#e6edf3]">{regSuccess}</div>}
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">Email address</label><input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="name@college.edu" className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">Password</label><input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" className={inputCls} /></div>
            <button type="submit" disabled={isPending} className="w-full rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] py-2 text-xs font-semibold text-[#e6edf3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}<span>{isPending ? "Signing in..." : "Sign In"}</span>
            </button>
            <div className="pt-2 text-center text-[11px] text-[#6e7681]">Demo: <span className="text-[#e6edf3]">admin@college.edu</span> &middot; <span className="text-[#e6edf3]">student@college.edu</span></div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
            {regError && <div className="p-2.5 rounded-md border border-[#30363d] bg-[#21262d] text-xs text-[#e6edf3]">{regError}</div>}
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">Full Name</label><input type="text" required value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Alex Coder" className={inputSmCls} /></div>
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">Email</label><input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="alex@college.edu" className={inputSmCls} /></div>
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">LeetCode Username</label><input type="text" required value={regLeetcode} onChange={(e) => setRegLeetcode(e.target.value)} placeholder="leetcode_handle" className={inputSmCls} /></div>
            <div><label className="block text-xs font-medium text-[#848d97] mb-1">Password</label><input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Minimum 8 characters" className={inputSmCls} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="block text-[11px] font-medium text-[#848d97] mb-1">Gender</label><select value={regGender} onChange={(e) => setRegGender(e.target.value as "MALE" | "FEMALE")} className={selectCls}><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div>
              <div><label className="block text-[11px] font-medium text-[#848d97] mb-1">Branch</label><select value={regBranch} onChange={(e) => setRegBranch(e.target.value)} className={selectCls}><option value="CSE">CSE</option><option value="IT">IT</option><option value="ECE">ECE</option><option value="MECH">MECH</option></select></div>
              <div><label className="block text-[11px] font-medium text-[#848d97] mb-1">Batch</label><select value={regBatch} onChange={(e) => setRegBatch(e.target.value)} className={selectCls}><option value="2025">2025</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option></select></div>
            </div>
            <button type="submit" disabled={isPending} className="w-full mt-2 rounded-md border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] py-2 text-xs font-semibold text-[#e6edf3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}<span>{isPending ? "Creating account..." : "Join Platform"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
