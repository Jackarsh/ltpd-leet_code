import { runBatchLeetCodeSync } from "@/server/workers/leetcode-sync";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runBatchLeetCodeSync();
  return NextResponse.json({ ok: true, ...result });
}