import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import {
  getSyncHealthMetrics,
  resetSyncCircuitBreaker,
} from "@/server/services/admin-sync.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdmin();

    const metrics = await getSyncHealthMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/sync/health] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch sync health metrics." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();
    const body = await req.json().catch(() => ({}));

    if (body.action === "RESET_BREAKER") {
      const res = await resetSyncCircuitBreaker(admin.id);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to perform sync operation." }, { status: 500 });
  }
}
