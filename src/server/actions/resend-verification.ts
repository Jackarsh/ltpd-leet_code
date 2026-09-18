"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { generateVerificationToken } from "@/server/services/auth.service";
import { sendVerificationEmail } from "@/server/services/email.service";

const ResendVerificationSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

// FR-010: Resend verification email for unverified account
export async function resendVerification(values: { email: string }) {
  const validatedFields = ResendVerificationSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  const { email } = validatedFields.data;

  const user = await db.user.findUnique({
    where: { email },
  });

  // If user does not exist or is already verified, do not leak or fail
  if (!user || user.emailVerified || user.status !== "PENDING_VERIFICATION") {
    return {
      success:
        "If an unverified account exists with that email, a new verification link has been sent.",
    };
  }

  // Generate new verification token and dispatch email
  const token = await generateVerificationToken(user.email);
  await sendVerificationEmail(user.email, token.token);

  return {
    success:
      "A new verification link has been sent to your email address. Please check your inbox.",
  };
}