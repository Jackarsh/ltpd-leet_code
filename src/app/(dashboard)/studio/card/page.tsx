import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateCardConfig, getCardDataByIdentifier } from "@/server/services/card-svg.service";
import { CardStudioClient } from "@/components/card-studio/CardStudioClient";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Card Studio | CodeRank",
  description: "Customize, preview, and embed your verified developer coding stats card into GitHub READMEs and personal portfolios.",
};

export default async function CardStudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/studio/card");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true, codingAccounts: { where: { platform: "LEETCODE" } } },
  });

  const leetcodeAccount = user?.codingAccounts[0];
  const leetcodeUsername = user?.profile?.leetcodeUsername || leetcodeAccount?.username;

  if (!user?.profile || !leetcodeUsername) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6 text-[#e6edf3]">
          <h2 className="text-base font-semibold">LeetCode Account Required</h2>
          <p className="mt-1 text-sm text-[#848d97]">You must link and verify your LeetCode username in your profile settings before generating a developer statistics card.</p>
          <div className="mt-4">
            <Link href="/settings/profile" className="inline-flex items-center gap-1.5 rounded-xl bg-[#21262d] border border-[#30363d] px-4 py-2 text-xs font-semibold text-[#e6edf3] hover:bg-[#30363d] transition-colors">
              Configure Profile & Link LeetCode <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [config, cardData] = await Promise.all([getOrCreateCardConfig(user.id), getCardDataByIdentifier(leetcodeUsername)]);

  if (!cardData) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-center text-[#848d97]">Unable to load profile card statistics.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#e6edf3]">Developer Profile Card Studio</h1>
        <p className="mt-1 text-sm text-[#848d97]">Export your verified problem-solving metrics and college ranking as a dynamic, auto-updating vector SVG for your GitHub README.</p>
      </div>
      <CardStudioClient metrics={cardData.metrics} initialConfig={config} />
    </div>
  );
}
