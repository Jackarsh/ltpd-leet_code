import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import {
  getAllAcademicPeriods,
  getCurrentPeriods,
  createAcademicPeriod,
  updateAcademicPeriod,
} from "@/server/services/calendar.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdmin();

    const [periods, current] = await Promise.all([
      getAllAcademicPeriods(),
      getCurrentPeriods(),
    ]);

    return NextResponse.json({
      success: true,
      periods,
      currentSemester: current.currentSemester,
      currentYear: current.currentYear,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/calendar] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch academic calendar." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await assertAdmin();
    const body = await req.json();

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    if (body.action === "UPDATE" || body.id) {
      const updated = await updateAcademicPeriod(admin.id, body.id, body, meta);
      return NextResponse.json({ success: true, period: updated });
    }

    const created = await createAcademicPeriod(admin.id, body, meta);
    return NextResponse.json({ success: true, period: created }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Failed to process academic calendar request.";
    console.error("[api/admin/calendar] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
