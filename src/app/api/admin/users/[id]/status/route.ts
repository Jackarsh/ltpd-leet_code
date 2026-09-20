import { NextRequest, NextResponse } from "next/server";
import {
  assertAdmin,
  UnauthorizedError,
  ForbiddenError,
  LockoutProtectionError,
} from "@/server/auth/rbac";
import { toggleUserAccountStatus } from "@/server/services/admin-user.service";
import { AccountStatus } from "@prisma/client";

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
    const { status, reason } = body;

    if (!status || !Object.values(AccountStatus).includes(status)) {
      return NextResponse.json(
        { error: "Valid status (ACTIVE | DISABLED) is required." },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const updatedUser = await toggleUserAccountStatus(
      admin.id,
      targetUserId,
      status as AccountStatus,
      reason,
      { ipAddress, userAgent }
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof LockoutProtectionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Failed to update account status.";
    console.error("[api/admin/users/[id]/status] Error toggling status:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
