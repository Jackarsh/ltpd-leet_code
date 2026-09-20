import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import {
  getAdminAchievements,
  createAchievement,
  updateAchievement,
  archiveAchievement,
} from "@/server/services/admin-achievement.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;

    const achievements = await getAdminAchievements({ search, category, status });
    return NextResponse.json({ success: true, achievements });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/achievements] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();

    const body = await req.json();
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    // Support action: "ARCHIVE"
    if (body.action === "ARCHIVE" && body.id) {
      const archived = await archiveAchievement(admin.id, body.id, meta);
      return NextResponse.json({ success: true, achievement: archived });
    }

    // Support action: "UPDATE" or updating when an ID is provided
    if (body.action === "UPDATE" || body.id) {
      const updated = await updateAchievement(admin.id, body.id, body, meta);
      return NextResponse.json({ success: true, achievement: updated });
    }

    // Default: CREATE
    const created = await createAchievement(admin.id, body, meta);
    return NextResponse.json({ success: true, achievement: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to process achievement request.";
    console.error("[api/admin/achievements] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
