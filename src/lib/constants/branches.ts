/**
 * Centralized Engineering Branch Constants
 *
 * Full-form branch names are the canonical values used throughout the application
 * for storage, display, filtering, and UI dropdowns.
 *
 * Legacy abbreviated values (e.g. "CSE", "ECE") stored in the database must be
 * normalised to full names via BRANCH_ABBREVIATION_MAP before display or comparison.
 */

export interface BranchOption {
  value: string;
  label: string;
}

/** Canonical list of engineering branches (full names). */
export const ENGINEERING_BRANCHES: BranchOption[] = [
  { value: "Computer Science and Engineering", label: "Computer Science and Engineering" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Chemical Engineering", label: "Chemical Engineering" },
  { value: "Aerospace Engineering", label: "Aerospace Engineering" },
  { value: "Biotechnology", label: "Biotechnology" },
  { value: "Other", label: "Other" },
];

/**
 * Maps legacy abbreviated branch values (as stored in the database) to their
 * canonical full-name equivalents.  Case-insensitive matching is used at
 * runtime — see `normalizeBranch()`.
 */
export const BRANCH_ABBREVIATION_MAP: Record<string, string> = {
  cse: "Computer Science and Engineering",
  "computer science": "Computer Science and Engineering",
  "cs&e": "Computer Science and Engineering",
  it: "Information Technology",
  "information technology": "Information Technology",
  ece: "Electronics and Communication Engineering",
  "electronics": "Electronics and Communication Engineering",
  "electronics and communication": "Electronics and Communication Engineering",
  ee: "Electrical Engineering",
  "electrical": "Electrical Engineering",
  mech: "Mechanical Engineering",
  "mechanical": "Mechanical Engineering",
  civil: "Civil Engineering",
  "civil engineering": "Civil Engineering",
  chem: "Chemical Engineering",
  "chemical": "Chemical Engineering",
  aero: "Aerospace Engineering",
  "aerospace": "Aerospace Engineering",
  biotech: "Biotechnology",
};

/**
 * Normalise a branch string from any stored value (abbreviated or full) to the
 * canonical full-name.  Returns the original value unchanged if no mapping
 * exists (safe for unknown or already-canonical values).
 */
export function normalizeBranch(branch: string | null | undefined): string | null {
  if (!branch) return null;
  const key = branch.trim().toLowerCase();
  return BRANCH_ABBREVIATION_MAP[key] ?? branch.trim();
}

/** Branch options prefixed with an "all" placeholder for filter dropdowns. */
export const BRANCH_FILTER_OPTIONS: BranchOption[] = [
  { value: "ALL", label: "All Engineering Branches" },
  ...ENGINEERING_BRANCHES,
];
