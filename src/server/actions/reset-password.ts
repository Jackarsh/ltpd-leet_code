"use server";

import { db } from "@/lib/db";
import { ResetPasswordSchema } from "@/lib/validations/auth";
import { generatePasswordResetToken } from "@/server/services/auth.service";
import { sendPasswordResetEmail } from "@/server/services/email.service";

// FR-016: Generic confirmation regardless of whether email exists
export async function resetPassword(values: { email: string }) {
  const validatedFields = ResetPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  const { email } = validatedFields.data;

  const existingUser = await db.user.findUnique({ where: { email } });

  if (existingUser) {
    const resetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, resetToken.token);
  }

  // Always return same message (FR-016)
  return { success: "If this email is registered, a reset link has been sent." };
}
