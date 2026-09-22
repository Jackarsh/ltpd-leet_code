"use server";

import { db } from "@/lib/db";

/**
 * Activates a user account in the database after successful Firebase email verification.
 */
export async function activateFirebaseVerifiedUser(email: string) {
  if (!email) {
    return { error: "Email is required for verification." };
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "User account not found." };
  }

  if (user.emailVerified && user.status === "ACTIVE") {
    return { success: true, message: "Account is already verified." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });

  return { success: true, message: "Account verified successfully!" };
}
