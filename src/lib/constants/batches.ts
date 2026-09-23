/**
 * Centralized Batch / Academic Year Constants
 *
 * These values represent graduation years used throughout the application
 * for storage, display, filtering, and UI dropdowns.
 *
 * The application tracks students by graduation year (the batch they graduate in).
 * Admission year = graduationYear - 4 for standard 4-year engineering programs.
 */

export interface BatchOption {
  value: string;
  label: string;
}

/**
 * Supported graduation years for the platform.
 * Range covers current active batches ± a few years to accommodate
 * older existing profiles and near-future enrollments.
 */
const BATCH_START_YEAR = 2021;
const BATCH_END_YEAR = 2030;

/** Generate graduation year options dynamically within the supported range. */
export const GRADUATION_YEAR_OPTIONS: BatchOption[] = Array.from(
  { length: BATCH_END_YEAR - BATCH_START_YEAR + 1 },
  (_, i) => {
    const year = BATCH_START_YEAR + i;
    return { value: String(year), label: `Class of ${year}` };
  }
);

/** Generate admission year options (typically 4 years before graduation). */
export const ADMISSION_YEAR_OPTIONS: BatchOption[] = Array.from(
  { length: BATCH_END_YEAR - BATCH_START_YEAR + 1 },
  (_, i) => {
    const year = BATCH_START_YEAR + i;
    return { value: String(year), label: String(year) };
  }
);

/**
 * Graduation year options prefixed with an "all" placeholder for filter
 * dropdowns (matches the pattern used in LeaderboardFilters).
 */
export const BATCH_FILTER_OPTIONS: BatchOption[] = [
  { value: "ALL", label: "All Batches" },
  ...GRADUATION_YEAR_OPTIONS,
];
