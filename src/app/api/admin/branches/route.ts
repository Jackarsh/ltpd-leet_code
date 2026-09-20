import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import {
  getAllBranches,
  createBranch,
  updateBranch,
  archiveBranch,
} from "@/server/services/calendar.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await assertAdmin();
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("includeInactive") !== "false";

    const branches = await getAllBranches(includeInactive);
    return NextResponse.json({ success: true, branches });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/branches] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch branches." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();
    const body = await req.json();

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    if (body.action === "ARCHIVE" && body.id) {
      const archived = await archiveBranch(admin.id, body.id, meta);
      return NextResponse.json({ success: true, branch: archived });
    }

    if (body.action === "UPDATE" || body.id) {
      const updated = await updateBranch(admin.id, body.id, body, meta);
      return NextResponse.json({ success: true, branch: updated });
    }

    const created = await createBranch(admin.id, body, meta);
    return NextResponse.json({ success: true, branch: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to process branch request.";
    console.error("[api/admin/branches] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
