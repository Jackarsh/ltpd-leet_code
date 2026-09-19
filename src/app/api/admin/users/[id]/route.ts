import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { updateUserMetadata } from "@/server/services/admin-user.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdmin();
    const resolvedParams = await params;
    const targetUserId = resolvedParams.id;

    const body = await request.json();

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const updated = await updateUserMetadata(
      admin.id,
      targetUserId,
      body,
      { ipAddress, userAgent }
    );

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to update user profile.";
    console.error("[api/admin/users/[id]] Error updating user:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
