/**
 * Academic Calendar & Department Branch Validator (FR-614, FR-615, SC-610)
 *
 * Validates semester and academic year date sequences, period bounds, and branch codes.
 */

export interface DateSequenceValidationResult {
  isValid: boolean;
  error?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Validates that a date sequence has valid timestamps and that startDate < endDate.
 */
export function validateDateSequence(
  startInput: string | Date,
  endInput: string | Date
): DateSequenceValidationResult {
  if (!startInput) {
    return { isValid: false, error: "Start date is required." };
  }
  if (!endInput) {
    return { isValid: false, error: "End date is required." };
  }

  const startDate = new Date(startInput);
  const endDate = new Date(endInput);

  if (isNaN(startDate.getTime())) {
    return { isValid: false, error: "Start date must be a valid date format." };
  }

  if (isNaN(endDate.getTime())) {
    return { isValid: false, error: "End date must be a valid date format." };
  }

  if (startDate.getTime() >= endDate.getTime()) {
    return {
      isValid: false,
      error: "Start date must be strictly before end date.",
    };
  }

  return {
    isValid: true,
    startDate,
    endDate,
  };
}

export interface AcademicPeriodInput {
  name: string;
  periodType: "SEMESTER" | "ACADEMIC_YEAR";
  startDate: string | Date;
  endDate: string | Date;
  isCurrent?: boolean;
}

/**
 * Validates and sanitizes academic period input (semesters / academic years).
 */
export function validateAcademicPeriodInput(input: Partial<AcademicPeriodInput>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    name: string;
    periodType: "SEMESTER" | "ACADEMIC_YEAR";
    startDate: Date;
    endDate: Date;
    isCurrent: boolean;
  };
} {
  const errors: Record<string, string> = {};

  const name = (input.name || "").trim();
  if (name.length < 3 || name.length > 50) {
    errors.name = "Period name must be between 3 and 50 characters.";
  }

  const periodType = (input.periodType || "SEMESTER").toUpperCase() as
    | "SEMESTER"
    | "ACADEMIC_YEAR";
  if (!["SEMESTER", "ACADEMIC_YEAR"].includes(periodType)) {
    errors.periodType = 'Period type must be either "SEMESTER" or "ACADEMIC_YEAR".';
  }

  const dateCheck = validateDateSequence(input.startDate ?? "", input.endDate ?? "");
  if (!dateCheck.isValid || !dateCheck.startDate || !dateCheck.endDate) {
    errors.dates = dateCheck.error || "Invalid date range.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      name,
      periodType,
      startDate: dateCheck.startDate!,
      endDate: dateCheck.endDate!,
      isCurrent: Boolean(input.isCurrent),
    },
  };
}

export interface AcademicBranchInput {
  name: string;
  code: string;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Validates and sanitizes academic department / branch input.
 */
export function validateBranchInput(input: Partial<AcademicBranchInput>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    name: string;
    code: string;
    isActive: boolean;
    displayOrder: number;
  };
} {
  const errors: Record<string, string> = {};

  const name = (input.name || "").trim();
  if (name.length < 2 || name.length > 100) {
    errors.name = "Branch name must be between 2 and 100 characters.";
  }

  const code = (input.code || "").trim().toUpperCase();
  if (code.length < 2 || code.length > 15) {
    errors.code = "Branch code must be between 2 and 15 characters.";
  } else if (!/^[A-Z0-9_-]+$/.test(code)) {
    errors.code = "Branch code can only contain uppercase letters, numbers, hyphens, and underscores.";
  }

  const displayOrder =
    input.displayOrder !== undefined ? Math.max(0, Number(input.displayOrder) || 0) : 0;

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      name,
      code,
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      displayOrder,
    },
  };
}
