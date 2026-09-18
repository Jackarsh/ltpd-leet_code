import { db } from "@/lib/db";
import { getInitials, getAvatarColor, deriveBatchLabel } from "@/lib/utils";

// ─── Public Profile DTO (FR-024, FR-026, FR-027) ────────────────────────────
// FR-024: Email MUST NOT appear on any public surface.
export interface PublicProfileDTO {
  displayName: string;
  gender: string;
  leetcodeUsername: string;
  avatarUrl: string | null;
  initials: string;
  avatarColor: string;
  branch: string | null;
  batchLabel: string | null;
  bio: string | null;
  collegeRank: number | null;
  weightedScore: number | null;
  statsAvailable: boolean; // FR-027: false until R2 sync runs
}

export async function getPublicProfile(
  leetcodeUsername: string
): Promise<PublicProfileDTO | null> {
  const profile = await db.userProfile.findFirst({
    where: { leetcodeUsername },
    include: { user: { select: { emailVerified: true, status: true } } },
  });

  if (!profile || profile.user.status !== "ACTIVE") return null;

  return {
    displayName: profile.displayName,
    gender: profile.gender,
    leetcodeUsername: profile.leetcodeUsername,
    avatarUrl: profile.avatarUrl,
    initials: getInitials(profile.displayName),
    avatarColor: getAvatarColor(profile.displayName),
    branch: profile.branch,
    batchLabel: deriveBatchLabel(profile.admissionYear, profile.graduationYear),
    bio: profile.bio,
    collegeRank: profile.collegeRank,
    weightedScore: profile.weightedScore,
    // FR-027: stats not available until R2 sync
    statsAvailable: false,
  };
}

// ─── Sanitization: strip prohibited fields (FR-006) ─────────────────────────
// Never persist: enrollment number, roll number, section.
const PROHIBITED_FIELDS = [
  "enrollmentNumber",
  "enrollment_number",
  "rollNumber",
  "roll_number",
  "section",
];

export function sanitizeInput<T extends Record<string, unknown>>(input: T): T {
  const sanitized = { ...input };
  for (const field of PROHIBITED_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}
