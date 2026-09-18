"use server";

import { db } from "@/lib/db";
import { EmailChangeSchema } from "@/lib/validations/profile";
import { generateEmailChangeToken } from "@/server/services/auth.service";
import { sendEmailChangeVerification } from "@/server/services/email.service";
import { auth } from "@/lib/auth";

// FR-021: Email change with re-verification
export async function changeEmail(values: { newEmail: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to change your email." };
  }

  const validatedFields = EmailChangeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Please enter a valid email address." };
  }

  const { newEmail } = validatedFields.data;

  // Check if new email is already taken
  const existingUser = await db.user.findUnique({ where: { email: newEmail } });
  if (existingUser) {
    return { error: "This email address is already registered to another account." };
  }

  // Generate token and send verification to new email
  const token = await generateEmailChangeToken(session.user.id, newEmail);
  await sendEmailChangeVerification(newEmail, token.token);

  return {
    success:
      "A confirmation email has been sent to your new address. Your current email remains active until you verify the new one.",
  };
}