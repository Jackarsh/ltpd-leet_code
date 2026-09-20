import { db } from "@/lib/db";
import { computeStateDiff, StateDiffResult } from "@/lib/audit-diff";
import type { Prisma } from "@prisma/client";

export interface AuditSearchFilters {
  search?: string;
  actionType?: string;
  targetType?: string;
  adminUserId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface EnrichedAuditLogRecord {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminDisplayName: string;
  adminRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  diff: StateDiffResult;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogSearchResult {
  logs: EnrichedAuditLogRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalRecords: number;
    actionTypeDistribution: Record<string, number>;
  };
}

/**
 * Searches, filters, and paginates through immutable audit logs with before/after state diffs (FR-623, SC-602).
 */
export async function searchAuditLogs(
  filters: AuditSearchFilters = {}
): Promise<AuditLogSearchResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.AuditLogWhereInput = {};

  if (filters.actionType && filters.actionType !== "ALL") {
    where.actionType = filters.actionType;
  }

  if (filters.targetType && filters.targetType !== "ALL") {
    where.targetType = filters.targetType;
  }

  if (filters.adminUserId && filters.adminUserId !== "ALL") {
    where.adminUserId = filters.adminUserId;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim();
    where.OR = [
      { targetId: { contains: term, mode: "insensitive" } },
      { ipAddress: { contains: term, mode: "insensitive" } },
      {
        adminUser: {
          OR: [
            { email: { contains: term, mode: "insensitive" } },
            { profile: { displayName: { contains: term, mode: "insensitive" } } },
          ],
        },
      },
    ];
  }

  const [rawLogs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        adminUser: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  const actionTypeDistribution: Record<string, number> = {};

  const logs: EnrichedAuditLogRecord[] = rawLogs.map((log) => {
    actionTypeDistribution[log.actionType] = (actionTypeDistribution[log.actionType] || 0) + 1;

    const before = (log.beforeState as Record<string, unknown> | null) ?? null;
    const after = (log.afterState as Record<string, unknown> | null) ?? null;
    const diff = computeStateDiff(before, after);

    return {
      id: log.id,
      adminUserId: log.adminUserId,
      adminEmail: log.adminUser.email,
      adminDisplayName: log.adminUser.profile?.displayName || log.adminUser.email,
      adminRole: log.adminUser.role,
      actionType: log.actionType,
      targetType: log.targetType,
      targetId: log.targetId,
      beforeState: before,
      afterState: after,
      diff,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
    };
  });

  return {
    logs,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    summary: {
      totalRecords: total,
      actionTypeDistribution,
    },
  };
}

/**
 * Fetches a single audit log entry by ID with complete detail.
 */
export async function getAuditLogById(id: string): Promise<EnrichedAuditLogRecord | null> {
  const log = await db.auditLog.findUnique({
    where: { id },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          role: true,
          profile: {
            select: { displayName: true },
          },
        },
      },
    },
  });

  if (!log) return null;

  const before = (log.beforeState as Record<string, unknown> | null) ?? null;
  const after = (log.afterState as Record<string, unknown> | null) ?? null;
  const diff = computeStateDiff(before, after);

  return {
    id: log.id,
    adminUserId: log.adminUserId,
    adminEmail: log.adminUser.email,
    adminDisplayName: log.adminUser.profile?.displayName || log.adminUser.email,
    adminRole: log.adminUser.role,
    actionType: log.actionType,
    targetType: log.targetType,
    targetId: log.targetId,
    beforeState: before,
    afterState: after,
    diff,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt.toISOString(),
  };
}
