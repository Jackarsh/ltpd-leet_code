import { db } from "@/lib/db";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/server/services/auth.service";
import { NextResponse } from "next/server";

// FR-021: Verify and apply email change
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=missing_token", request.url)
    );
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken || existingToken.type !== "EMAIL_CHANGE") {
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

  // Parse userId and newEmail from stored format "userId:newEmail"
  const colonIndex = existingToken.email.indexOf(":");
  if (colonIndex === -1) {
    await deleteVerificationToken(existingToken.id);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=invalid_token", request.url)
    );
  }

  const userId = existingToken.email.substring(0, colonIndex);
  const newEmail = existingToken.email.substring(colonIndex + 1);

  // Check if new email was claimed by someone else in the interim
  const emailInUse = await db.user.findFirst({
    where: {
      email: newEmail,
      id: { not: userId },
    },
  });

  if (emailInUse) {
    await deleteVerificationToken(existingToken.id);
    return NextResponse.redirect(
      new URL("/auth/verify-email?error=email_taken", request.url)
    );
  }

  // Update user's email and refresh verification status
  await db.user.update({
    where: { id: userId },
    data: {
      email: newEmail,
      emailVerified: new Date(),
    },
  });

  // Consume token (FR-021)
  await deleteVerificationToken(existingToken.id);

  return NextResponse.redirect(
    new URL("/auth/verify-email?status=email_change_success", request.url)
  );
}