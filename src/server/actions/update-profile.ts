"use server";

import { db } from "@/lib/db";
import { ProfileUpdateSchema } from "@/lib/validations/profile";
import { sanitizeInput } from "@/server/services/user.service";
import { auth } from "@/lib/auth";

// FR-019: Update editable profile fields
// FR-020: Non-editable fields are not in the schema
// FR-006: Prohibited fields are stripped by sanitizeInput
export async function updateProfile(values: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to update your profile." };
  }

  // Strip prohibited fields (FR-006, US8)
  const sanitized = sanitizeInput(values);

  const validatedFields = ProfileUpdateSchema.safeParse(sanitized);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  // Check LeetCode username uniqueness if being changed
  if (data.leetcodeUsername) {
    const existing = await db.userProfile.findFirst({
      where: {
        leetcodeUsername: data.leetcodeUsername,
        NOT: { userId: session.user.id },
      },
    });
    if (existing) {
      return { error: { leetcodeUsername: ["This LeetCode username is already in use"] } };
    }
  }

  await db.userProfile.update({
    where: { userId: session.user.id },
    data: {
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.gender && { gender: data.gender }),
      ...(data.leetcodeUsername && { leetcodeUsername: data.leetcodeUsername }),
      ...(data.admissionYear !== undefined && { admissionYear: data.admissionYear }),
      ...(data.graduationYear !== undefined && { graduationYear: data.graduationYear }),
      ...(data.branch !== undefined && { branch: data.branch }),
      ...(data.bio !== undefined && { bio: data.bio }),
    },
  });

  return { success: "Profile updated successfully." };
}
