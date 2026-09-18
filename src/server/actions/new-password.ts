"use server";

import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/lib/validations/auth";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/server/services/auth.service";
import bcrypt from "bcryptjs";

// FR-017, FR-018: Single-use, time-limited password reset
export async function newPassword(values: { password: string; token: string }) {
  const validatedFields = NewPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  const { password, token } = validatedFields.data;

  // Find and validate token
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken || existingToken.type !== "PASSWORD_RESET") {
    return { error: "Invalid or expired reset link. Please request a new one." };
  }

  // Check expiry (FR-017)
  if (new Date(existingToken.expires) < new Date()) {
    await deleteVerificationToken(existingToken.id);
    return { error: "This reset link has expired. Please request a new one." };
  }

  // Find user
  const existingUser = await db.user.findUnique({
    where: { email: existingToken.email },
  });
  if (!existingUser) {
    return { error: "Account not found." };
  }

  // Hash new password (FR-031: min 6 chars enforced by schema)
  const passwordHash = await bcrypt.hash(password, 12);

  // Update password
  await db.user.update({
    where: { id: existingUser.id },
    data: { passwordHash },
  });

  // Invalidate token (FR-018)
  await deleteVerificationToken(existingToken.id);

  return { success: "Password updated! You can now log in with your new password." };
}
