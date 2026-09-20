import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { searchAuditLogs } from "@/server/services/admin-audit.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const actionType = searchParams.get("actionType") || undefined;
    const targetType = searchParams.get("targetType") || undefined;
    const adminUserId = searchParams.get("adminUserId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await searchAuditLogs({
      search,
      actionType,
      targetType,
      adminUserId,
      startDate,
      endDate,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/audit] GET Error:", error);
    return NextResponse.json({ error: "Failed to query audit logs." }, { status: 500 });
  }
}
