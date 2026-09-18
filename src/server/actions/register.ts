"use server";

import { db } from "@/lib/db";
import { RegisterSchema, type RegisterInput } from "@/lib/validations/auth";
import { generateVerificationToken } from "@/server/services/auth.service";
import { sendVerificationEmail } from "@/server/services/email.service";
import { sanitizeInput } from "@/server/services/user.service";
import bcrypt from "bcryptjs";

// Prohibited fields that must never be persisted (FR-006, US8)
const PROHIBITED_FIELDS = ["enrollmentNumber", "rollNumber", "section", "enrollment_number", "roll_number"];

export async function register(values: RegisterInput) {
  // 1. Sanitize: strip any prohibited fields (T027, FR-006)
  const sanitized = sanitizeInput(values as Record<string, unknown>) as RegisterInput;

  // 2. Validate input (FR-002, FR-003, FR-004, FR-031)
  const validatedFields = RegisterSchema.safeParse(sanitized);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, leetcodeUsername, gender, admissionYear, graduationYear, branch } =
    validatedFields.data;

  // 3. Check for existing account (FR-005, FR-028, FR-033)
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    // If unverified and older than 24 hours, purge it (FR-033, US13)
    const ageMs = Date.now() - new Date(existingUser.createdAt).getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (!existingUser.emailVerified && ageMs >= TWENTY_FOUR_HOURS) {
      await db.user.delete({ where: { id: existingUser.id } });
    } else {
      return { error: { email: ["An account with this email already exists"] } };
    }
  }

  // 4. Check concurrent uniqueness of LeetCode username across profiles
  const existingProfile = await db.userProfile.findFirst({
    where: { leetcodeUsername },
  });
  if (existingProfile) {
    return { error: { leetcodeUsername: ["This LeetCode username is already in use"] } };
  }

  // 5. Hash password (FR-031)
  const passwordHash = await bcrypt.hash(password, 12);

  // 6. Create user + profile in a transaction (FR-029)
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      status: "PENDING_VERIFICATION",
      profile: {
        create: {
          displayName: name,
          gender,
          leetcodeUsername,
          admissionYear: admissionYear ?? null,
          graduationYear: graduationYear ?? null,
          branch: branch ?? null,
        },
      },
    },
  });

  // 7. Generate verification token and send email (FR-008)
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(email, verificationToken.token);

  return { success: "Verification email sent! Please check your inbox." };
}
