"use server";

import { db } from "@/lib/db";

export interface LoginStatusResult {
  reason: "INVALID_CREDENTIALS" | "UNVERIFIED" | "LOCKED";
  devVerifyUrl?: string | null;
}

export async function checkLoginStatus(email: string): Promise<LoginStatusResult> {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { reason: "INVALID_CREDENTIALS" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, emailVerified: true, status: true, lockedUntil: true },
  });

  if (!user) {
    return { reason: "INVALID_CREDENTIALS" };
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    return { reason: "LOCKED" };
  }

  if (!user.emailVerified || user.status === "PENDING_VERIFICATION") {
    let devVerifyUrl: string | null = null;
    if (process.env.NODE_ENV === "development") {
      const existingToken = await db.verificationToken.findFirst({
        where: { email: normalizedEmail, type: "EMAIL_VERIFICATION" },
        orderBy: { createdAt: "desc" },
      });
      if (existingToken) {
        devVerifyUrl = `/api/auth/verify?token=${existingToken.token}`;
      }
    }

    return {
      reason: "UNVERIFIED",
      devVerifyUrl,
    };
  }

  return { reason: "INVALID_CREDENTIALS" };
}

export async function devAutoVerifyUser(email: string) {
  if (process.env.NODE_ENV !== "development") {
    return { error: "Development only action" };
  }

  const normalizedEmail = email.trim().toLowerCase();
  await db.user.update({
    where: { email: normalizedEmail },
    data: {
      emailVerified: new Date(),
      status: "ACTIVE",
    },
  });

  return { success: true };
}
