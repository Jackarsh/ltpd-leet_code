import { NextResponse } from "next/server";
import { assertAdmin, UnauthorizedError, ForbiddenError } from "@/server/auth/rbac";
import { findDuplicateConflicts } from "@/server/services/duplicate.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await assertAdmin();

    const conflicts = await findDuplicateConflicts();
    return NextResponse.json({ success: true, conflicts });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/duplicates] Error querying conflicts:", error);
    return NextResponse.json({ error: "Failed to query duplicate conflicts." }, { status: 500 });
  }
}
