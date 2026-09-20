import { NextRequest, NextResponse } from "next/server";
import {
  assertSuperAdmin,
  UnauthorizedError,
  ForbiddenError,
  LockoutProtectionError,
} from "@/server/auth/rbac";
import {
  getAdministrativeUsers,
  searchEligibleUsers,
  changeUserRole,
} from "@/server/services/admin-role.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Only SUPER_ADMIN can view and manage administrator role governance (FR-617)
    await assertSuperAdmin();

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search");

    if (searchQuery) {
      const candidates = await searchEligibleUsers(searchQuery);
      return NextResponse.json({ success: true, candidates });
    }

    const data = await getAdministrativeUsers();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("[api/admin/roles] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch administrator roles." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await assertSuperAdmin();

    const body = await req.json().catch(() => ({}));
    const { targetUserId, newRole, confirmation } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Target user ID and new role are required." },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");
    const meta = { ipAddress, userAgent };

    const updatedUser = await changeUserRole(
      admin.id,
      targetUserId,
      newRole,
      confirmation,
      meta
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof LockoutProtectionError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Failed to update user role.";
    console.error("[api/admin/roles] POST Error:", error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
