import { db } from "@/lib/db";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/server/services/auth.service";
import { NextResponse } from "next/server";

// FR-011: Validate token, activate account
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=missing_token", request.url)
    );
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken || existingToken.type !== "EMAIL_VERIFICATION") {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=invalid_token", request.url)
    );
  }

  // Check expiry
  if (new Date(existingToken.expires) < new Date()) {
    await deleteVerificationToken(existingToken.id);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=expired_token", request.url)
    );
  }

  // Find user
  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=user_not_found", request.url)
    );
  }

  // Already verified (US2 scenario 5)
  if (existingUser.emailVerified) {
    await deleteVerificationToken(existingToken.id);
    return NextResponse.redirect(
      new URL("/auth/verify-email?status=already_verified", request.url)
    );
  }

  // Activate account
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });

  // Consume token (FR-011)
  await deleteVerificationToken(existingToken.id);

  return NextResponse.redirect(
    new URL("/auth/verify-email?status=success", request.url)
  );
}
