import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { resolveConflict } from "@/server/services/duplicate.service";
import type { ConflictResolutionAction } from "@/lib/duplicate-resolver";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await assertAdmin();

    const body = await request.json();
    const { targetUserId, action, resolutionNote } = body;

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await resolveConflict(
      admin.id,
      targetUserId,
      action as ConflictResolutionAction,
      resolutionNote,
      { ipAddress, userAgent }
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to resolve conflict.";
    console.error("[api/admin/duplicates/resolve] Error resolving conflict:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
