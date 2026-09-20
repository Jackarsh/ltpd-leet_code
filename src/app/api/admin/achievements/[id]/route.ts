import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import {
  getAdminAchievementById,
  updateAchievement,
  archiveAchievement,
} from "@/server/services/admin-achievement.service";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin();
    const { id } = await params;

    const achievement = await getAdminAchievementById(id);
    if (!achievement) {
      return NextResponse.json({ error: "Achievement not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, achievement });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch achievement." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdmin();
    const { id } = await params;
    const body = await req.json();

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    if (body.status === "ARCHIVED" && Object.keys(body).length === 1) {
      const archived = await archiveAchievement(admin.id, id, meta);
      return NextResponse.json({ success: true, achievement: archived });
    }

    const updated = await updateAchievement(admin.id, id, body, meta);
    return NextResponse.json({ success: true, achievement: updated });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to update achievement.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
