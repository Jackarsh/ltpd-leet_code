export type ConflictResolutionAction = "UNLINK" | "DISABLE";

export interface ResolutionValidationInput {
  action: ConflictResolutionAction;
  resolutionNote?: string | null;
  targetUserId: string;
}

export function validateResolutionInput(input: ResolutionValidationInput): {
  action: ConflictResolutionAction;
  resolutionNote: string;
  targetUserId: string;
} {
  if (!input.targetUserId || typeof input.targetUserId !== "string") {
    throw new Error("Target user ID is required for conflict resolution.");
  }

  if (input.action !== "UNLINK" && input.action !== "DISABLE") {
    throw new Error("Resolution action must be 'UNLINK' or 'DISABLE'.");
  }

  const note = input.resolutionNote?.trim();
  if (!note || note.length < 5) {
    throw new Error("A resolution note of at least 5 characters is required for administrative audit (FR-606).");
  }

  return {
    action: input.action,
    resolutionNote: note,
    targetUserId: input.targetUserId,
  };
}

export function computeUnlinkedProfileState(existingUsername: string) {
  return {
    leetcodeUsername: "",
    collegeRank: null,
    weightedScore: 0,
    previousUsername: existingUsername,
    statusNotice: "Pending LeetCode Link",
  };
}

export function computeResetCodingStats() {
  return {
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    acceptanceRate: 0,
    contestRating: null,
    highestContestRating: null,
    longestStreak: 0,
    contestsAttended: 0,
    submissionCalendarJson: null,
  };
}
