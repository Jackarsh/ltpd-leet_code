import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Token expiry durations
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (FR-033)
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;    // 1 hour (FR-017)
const EMAIL_CHANGE_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (FR-021)

// Generate Verification Token (FR-008)
export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

  // Delete any existing tokens for this email/type
  await db.verificationToken.deleteMany({
    where: { email, type: "EMAIL_VERIFICATION" },
  });

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      type: "EMAIL_VERIFICATION",
      expires,
    },
  });

  return verificationToken;
}

// Generate Password Reset Token (FR-016)
export async function generatePasswordResetToken(email: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS);

  await db.verificationToken.deleteMany({
    where: { email, type: "PASSWORD_RESET" },
  });

  const resetToken = await db.verificationToken.create({
    data: {
      email,
      token,
      type: "PASSWORD_RESET",
      expires,
    },
  });

  return resetToken;
}

// Generate Email Change Token (FR-021)
// Stores "userId:newEmail" in email column to cleanly map which account is being updated
export async function generateEmailChangeToken(userId: string, newEmail: string) {
  const token = uuidv4();
  const expires = new Date(Date.now() + EMAIL_CHANGE_TOKEN_EXPIRY_MS);
  const identifier = `${userId}:${newEmail}`;

  await db.verificationToken.deleteMany({
    where: { email: identifier, type: "EMAIL_CHANGE" },
  });

  const changeToken = await db.verificationToken.create({
    data: {
      email: identifier,
      token,
      type: "EMAIL_CHANGE",
      expires,
    },
  });

  return changeToken;
}

// Validate Token
export async function getVerificationTokenByToken(token: string) {
  try {
    return await db.verificationToken.findUnique({
      where: { token },
    });
  } catch {
    return null;
  }
}

// Delete consumed token
export async function deleteVerificationToken(id: string) {
  await db.verificationToken.delete({ where: { id } });
}