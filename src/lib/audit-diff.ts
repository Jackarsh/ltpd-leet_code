/**
 * Audit Log State Diff Engine (FR-622, SC-602)
 *
 * Computes deep and shallow field-level before/after diffs for immutable administrative audit trails.
 */

export type DiffChangeType = "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";

export interface FieldDiff {
  field: string;
  before: unknown;
  after: unknown;
  type: DiffChangeType;
}

export interface StateDiffResult {
  hasChanges: boolean;
  totalChanges: number;
  diffs: FieldDiff[];
}

/**
 * Compares two arbitrary JSON state objects and extracts structured field changes.
 */
export function computeStateDiff(
  beforeState?: Record<string, unknown> | null,
  afterState?: Record<string, unknown> | null
): StateDiffResult {
  const before = beforeState ?? {};
  const after = afterState ?? {};

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diffs: FieldDiff[] = [];

  for (const key of Array.from(allKeys).sort()) {
    const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

    const valBefore = before[key];
    const valAfter = after[key];

    if (!hasBefore && hasAfter) {
      diffs.push({
        field: key,
        before: null,
        after: valAfter,
        type: "ADDED",
      });
    } else if (hasBefore && !hasAfter) {
      diffs.push({
        field: key,
        before: valBefore,
        after: null,
        type: "REMOVED",
      });
    } else {
      const isIdentical = JSON.stringify(valBefore) === JSON.stringify(valAfter);
      if (!isIdentical) {
        diffs.push({
          field: key,
          before: valBefore,
          after: valAfter,
          type: "MODIFIED",
        });
      } else {
        diffs.push({
          field: key,
          before: valBefore,
          after: valAfter,
          type: "UNCHANGED",
        });
      }
    }
  }

  const changeDiffs = diffs.filter((d) => d.type !== "UNCHANGED");

  return {
    hasChanges: changeDiffs.length > 0,
    totalChanges: changeDiffs.length,
    diffs,
  };
}

/**
 * Formats diff values into human-readable strings for UI display.
 */
export function formatDiffValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}
