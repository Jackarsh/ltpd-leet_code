import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureDefaultAchievementsExist } from "@/server/services/achievement.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDefaultAchievementsExist();
    const achievements = await db.achievement.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { points: "asc" },
    });
    return NextResponse.json(achievements);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch achievements";
    console.error("Achievements API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}