import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { triggerUserManualSync } from "@/server/services/admin-sync.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await assertAdmin();
    const { id: targetUserId } = await params;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    const result = await triggerUserManualSync(admin.id, targetUserId, meta);
    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to trigger user synchronization.";
    console.error("[api/admin/users/:id/sync] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
