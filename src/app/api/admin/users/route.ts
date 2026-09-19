import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { listUsersForAdmin } from "@/server/services/admin-user.service";
import type { AccountStatus, Gender, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await assertAdmin();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || undefined;
    const branch = searchParams.get("branch") || undefined;
    const batchParam = searchParams.get("batch");
    const batch = batchParam ? parseInt(batchParam, 10) : undefined;
    const gender = (searchParams.get("gender") as Gender) || undefined;
    const status = (searchParams.get("status") as AccountStatus) || undefined;
    const role = (searchParams.get("role") as Role) || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    const result = await listUsersForAdmin({
      search,
      branch,
      batch,
      gender,
      status,
      role,
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
    console.error("[api/admin/users] Error listing users:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
