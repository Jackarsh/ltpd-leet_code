import { db } from "@/lib/db";
import type { AuditActionType, AuditLogFilter } from "@/types/admin";
import type { Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  adminUserId: string;
  actionType: AuditActionType;
  targetType: string;
  targetId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Appends an immutable audit log entry for administrative mutations (FR-622, SC-602).
 * Strictly append-only: no update or delete operations are exposed.
 */
export async function recordAuditLog(params: CreateAuditLogParams) {
  try {
    return await db.auditLog.create({
      data: {
        adminUserId: params.adminUserId,
        actionType: params.actionType,
        targetType: params.targetType,
        targetId: params.targetId,
        beforeState: (params.beforeState ?? undefined) as Prisma.InputJsonValue | undefined,
        afterState: (params.afterState ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit log failure must be logged with high severity but not crash the entire transaction
    console.error("[AuditService] Failed to persist audit log record:", error);
    throw error;
  }
}

/**
 * Searches and paginates through audit logs (FR-623).
 */
export async function queryAuditLogs(filter: AuditLogFilter = {}) {
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));
  const skip = (page - 1) * pageSize;

  const where: Prisma.AuditLogWhereInput = {
    ...(filter.adminUserId && { adminUserId: filter.adminUserId }),
    ...(filter.actionType && { actionType: filter.actionType }),
    ...(filter.targetType && { targetType: filter.targetType }),
    ...(filter.startDate || filter.endDate
      ? {
          createdAt: {
            ...(filter.startDate && { gte: filter.startDate }),
            ...(filter.endDate && { lte: filter.endDate }),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
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
            profile: { select: { displayName: true } },
          },
        },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      adminUserId: log.adminUserId,
      adminEmail: log.adminUser.email,
      adminName: log.adminUser.profile?.displayName ?? log.adminUser.email,
      adminRole: log.adminUser.role,
      actionType: log.actionType as AuditActionType,
      targetType: log.targetType,
      targetId: log.targetId,
      beforeState: log.beforeState as Record<string, unknown> | null,
      afterState: log.afterState as Record<string, unknown> | null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
