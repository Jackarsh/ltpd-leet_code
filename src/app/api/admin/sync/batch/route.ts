import { NextRequest, NextResponse } from "next/server";
import { assertSuperAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { triggerPlatformBatchSync } from "@/server/services/admin-sync.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Only SUPER_ADMIN can initiate a platform-wide batch sync (FR-613)
    const admin = await assertSuperAdmin();

    const body = await req.json().catch(() => ({}));
    const confirmationText = body.confirmation;

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    const result = await triggerPlatformBatchSync(admin.id, confirmationText, meta);
    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to trigger batch platform sync.";
    console.error("[api/admin/sync/batch] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
