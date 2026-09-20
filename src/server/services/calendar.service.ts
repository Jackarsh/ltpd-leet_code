import { db } from "@/lib/db";
import {
  validateAcademicPeriodInput,
  validateBranchInput,
  AcademicPeriodInput,
  AcademicBranchInput,
} from "@/lib/calendar-validator";
import { recordAuditLog } from "./audit.service";

/**
 * Fetches all configured academic branches (FR-614).
 */
export async function getAllBranches(includeInactive = true) {
  const where = includeInactive ? {} : { isActive: true };
  return db.academicBranch.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });
}

/**
 * Creates a new academic department branch (FR-614).
 */
export async function createBranch(
  adminUserId: string,
  input: Partial<AcademicBranchInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const validation = validateBranchInput(input);
  if (!validation.isValid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${msg}`);
  }

  const { name, code, isActive, displayOrder } = validation.sanitized;

  // Check unique name and code
  const existing = await db.academicBranch.findFirst({
    where: {
      OR: [{ code }, { name }],
    },
  });

  if (existing) {
    if (existing.code === code) {
      throw new Error(`A branch with code "${code}" already exists.`);
    }
    throw new Error(`A branch with name "${name}" already exists.`);
  }

  const branch = await db.academicBranch.create({
    data: {
      name,
      code,
      isActive,
      displayOrder,
    },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "BRANCH_CREATE",
    targetType: "AcademicBranch",
    targetId: branch.id,
    afterState: { name, code, isActive, displayOrder },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return branch;
}

/**
 * Updates an academic department branch.
 */
export async function updateBranch(
  adminUserId: string,
  id: string,
  input: Partial<AcademicBranchInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const existing = await db.academicBranch.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Branch with ID "${id}" not found.`);
  }

  const validation = validateBranchInput({
    ...existing,
    ...input,
  });

  if (!validation.isValid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${msg}`);
  }

  const { name, code, isActive, displayOrder } = validation.sanitized;

  // Check conflicts
  const conflict = await db.academicBranch.findFirst({
    where: {
      id: { not: id },
      OR: [{ code }, { name }],
    },
  });

  if (conflict) {
    if (conflict.code === code) {
      throw new Error(`Another branch with code "${code}" already exists.`);
    }
    throw new Error(`Another branch with name "${name}" already exists.`);
  }

  const updated = await db.academicBranch.update({
    where: { id },
    data: {
      name,
      code,
      isActive,
      displayOrder,
    },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "BRANCH_UPDATE",
    targetType: "AcademicBranch",
    targetId: id,
    beforeState: {
      name: existing.name,
      code: existing.code,
      isActive: existing.isActive,
      displayOrder: existing.displayOrder,
    },
    afterState: { name, code, isActive, displayOrder },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return updated;
}

/**
 * Archives an academic branch (soft deactivation preserving student metrics, FR-614).
 */
export async function archiveBranch(
  adminUserId: string,
  id: string,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const existing = await db.academicBranch.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Branch with ID "${id}" not found.`);
  }

  const updated = await db.academicBranch.update({
    where: { id },
    data: { isActive: false },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "BRANCH_ARCHIVE",
    targetType: "AcademicBranch",
    targetId: id,
    beforeState: { isActive: existing.isActive },
    afterState: { isActive: false },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return updated;
}

/**
 * Fetches all academic periods (semesters and academic years, FR-615).
 */
export async function getAllAcademicPeriods() {
  return db.academicPeriod.findMany({
    orderBy: [{ periodType: "asc" }, { startDate: "desc" }],
  });
}

/**
 * Fetches currently active semester and academic year.
 */
export async function getCurrentPeriods() {
  const [currentSemester, currentYear] = await Promise.all([
    db.academicPeriod.findFirst({
      where: { periodType: "SEMESTER", isCurrent: true },
    }),
    db.academicPeriod.findFirst({
      where: { periodType: "ACADEMIC_YEAR", isCurrent: true },
    }),
  ]);

  return { currentSemester, currentYear };
}

/**
 * Creates an academic period (semester or academic year) with date sequence validation (FR-615).
 */
export async function createAcademicPeriod(
  adminUserId: string,
  input: Partial<AcademicPeriodInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const validation = validateAcademicPeriodInput(input);
  if (!validation.isValid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${msg}`);
  }

  const { name, periodType, startDate, endDate, isCurrent } = validation.sanitized;

  // If marked current, unset any existing current period of the same type
  if (isCurrent) {
    await db.academicPeriod.updateMany({
      where: { periodType, isCurrent: true },
      data: { isCurrent: false },
    });
  }

  const period = await db.academicPeriod.create({
    data: {
      name,
      periodType,
      startDate,
      endDate,
      isCurrent,
    },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "CALENDAR_CREATE",
    targetType: "AcademicPeriod",
    targetId: period.id,
    afterState: {
      name,
      periodType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isCurrent,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return period;
}

/**
 * Updates an academic period with date sequence validation.
 */
export async function updateAcademicPeriod(
  adminUserId: string,
  id: string,
  input: Partial<AcademicPeriodInput>,
  meta?: { ipAddress?: string | null; userAgent?: string | null }
) {
  const existing = await db.academicPeriod.findUnique({ where: { id } });
  if (!existing) {
    throw new Error(`Academic period with ID "${id}" not found.`);
  }

  const validation = validateAcademicPeriodInput({
    name: input.name ?? existing.name,
    periodType: (input.periodType as any) ?? existing.periodType,
    startDate: input.startDate ?? existing.startDate,
    endDate: input.endDate ?? existing.endDate,
    isCurrent: input.isCurrent ?? existing.isCurrent,
  });

  if (!validation.isValid || !validation.sanitized) {
    const msg = Object.values(validation.errors).join(", ");
    throw new Error(`Validation failed: ${msg}`);
  }

  const { name, periodType, startDate, endDate, isCurrent } = validation.sanitized;

  // If marked current, unset other current periods of the same type
  if (isCurrent && !existing.isCurrent) {
    await db.academicPeriod.updateMany({
      where: {
        periodType,
        isCurrent: true,
        id: { not: id },
      },
      data: { isCurrent: false },
    });
  }

  const updated = await db.academicPeriod.update({
    where: { id },
    data: {
      name,
      periodType,
      startDate,
      endDate,
      isCurrent,
    },
  });

  await recordAuditLog({
    adminUserId,
    actionType: "CALENDAR_UPDATE",
    targetType: "AcademicPeriod",
    targetId: id,
    beforeState: {
      name: existing.name,
      periodType: existing.periodType,
      startDate: existing.startDate.toISOString(),
      endDate: existing.endDate.toISOString(),
      isCurrent: existing.isCurrent,
    },
    afterState: {
      name,
      periodType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isCurrent,
    },
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
  });

  return updated;
}
