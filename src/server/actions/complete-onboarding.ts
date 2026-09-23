"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const OnboardingSchema = z.object({
  leetcodeUsername: z.string().min(1, "LeetCode username is required"),
  branch: z.string().min(1, "Branch is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  graduationYear: z.number().min(2000).max(2100),
});

export async function completeOnboarding(values: z.infer<typeof OnboardingSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to complete onboarding." };
  }

  const validatedFields = OnboardingSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const data = validatedFields.data;

  // Check LeetCode username uniqueness
  const existing = await db.userProfile.findFirst({
    where: {
      leetcodeUsername: data.leetcodeUsername,
      NOT: { userId: session.user.id },
    },
  });
  if (existing) {
    return { error: { leetcodeUsername: ["This LeetCode username is already in use"] } };
  }

  await db.userProfile.update({
    where: { userId: session.user.id },
    data: {
      leetcodeUsername: data.leetcodeUsername,
      branch: data.branch,
      gender: data.gender,
      graduationYear: data.graduationYear,
    },
  });

  return { success: "Onboarding completed successfully." };
}
