"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { completeOnboarding } from "@/server/actions/complete-onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isPending, startTransition] = useTransition();

  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [branch, setBranch] = useState("CSE");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [batch, setBatch] = useState("2026");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If the user somehow gets here but doesn't need onboarding, redirect them
    if (session && (session as { needsOnboarding?: boolean }).needsOnboarding === false) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await completeOnboarding({
        leetcodeUsername,
        branch,
        gender,
        graduationYear: parseInt(batch, 10),
      });

      if (result.error) {
        const err = result.error as Record<string, string[]> | string;
        const errMsg = typeof err === "string" ? err : Object.values(err).flat().join(", ");
        setError(errMsg);
      } else {
        await update({ needsOnboarding: false }); // This triggers the jwt callback with trigger="update"
        router.push("/dashboard");
      }
    });
  };

  const inputSmCls =
    "w-full rounded-xl border border-white/10 bg-[#0d1117] px-3 py-1.5 text-xs text-[#e6edf3] placeholder-[#6e7681] focus:border-white/30 focus:outline-none transition-colors";
  const selectCls =
    "w-full rounded-xl border border-white/10 bg-[#0d1117] px-2 py-1.5 text-xs text-[#e6edf3] focus:border-white/30 focus:outline-none transition-colors";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#161b22] p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white tracking-tight">Complete Your Profile</h2>
          <p className="text-sm text-slate-400 mt-2">
            Just a few more details to set up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">LeetCode Username</label>
            <input
              type="text"
              required
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="Your LeetCode Handle"
              className={inputSmCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}
                className={selectCls}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className={selectCls}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Graduation Year</label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className={selectCls}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 rounded-xl bg-white text-[#0b132b] hover:bg-slate-100 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isPending ? "Saving..." : "Complete Setup"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
