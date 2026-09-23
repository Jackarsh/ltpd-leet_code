import { Role, AccountStatus, Gender } from "@prisma/client";

export type AdminRole = "PLATFORM_ADMIN" | "SUPER_ADMIN";

export type AuditActionType =
  | "USER_UPDATE"
  | "USER_STATUS_CHANGE"
  | "USER_DELETE"
  | "DUPLICATE_RESOLVE"
  | "ACHIEVEMENT_CREATE"
  | "ACHIEVEMENT_UPDATE"
  | "ACHIEVEMENT_ARCHIVE"
  | "SYNC_TRIGGER"
  | "BATCH_SYNC_TRIGGER"
  | "ROLE_GRANT"
  | "ROLE_REVOKE"
  | "BRANCH_CREATE"
  | "BRANCH_UPDATE"
  | "BRANCH_ARCHIVE"
  | "CALENDAR_CREATE"
  | "CALENDAR_UPDATE";

export interface AdminUserListItemDTO {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  displayName: string;
  gender: Gender | null;
  branch: string | null;
  admissionYear: number | null;
  graduationYear: number | null;
  leetcodeUsername: string | null;
  totalSolved: number;
  contestRating: number | null;
  currentStreak: number;
  lastSyncAt: Date | null;
  syncStatus: string | null;
  createdAt: Date;
}

export interface AdminUserQueryFilter {
  search?: string;
  branch?: string;
  batch?: number;
  gender?: Gender;
  status?: AccountStatus;
  role?: Role;
  page?: number;
  pageSize?: number;
}

export interface UpdateUserMetadataInput {
  displayName?: string;
  gender?: Gender;
  branch?: string | null;
  admissionYear?: number | null;
  graduationYear?: number | null;
}

export interface DuplicateConflictDTO {
  leetcodeUsername: string;
  accounts: {
    userId: string;
    email: string;
    displayName: string;
    status: AccountStatus;
    createdAt: Date;
    lastSyncAt: Date | null;
    totalSolved: number;
  }[];
}

export interface SyncHealthMetricsDTO {
  totalSyncedLast24h: number;
  currentQueueDepth: number;
  successRate: number;
  errorCounts: {
    usernameNotFound: number;
    rateLimited: number;
    networkTimeout: number;
    dataParsingError: number;
    other: number;
  };
  recentFailures: {
    id: string;
    userId: string;
    username: string;
    errorType: string;
    errorMessage: string;
    timestamp: Date;
  }[];
}

export interface AuditLogDTO {
  id: string;
  adminUserId: string;
  adminName: string;
  actionType: AuditActionType;
  targetType: string;
  targetId: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface AuditLogFilter {
  adminUserId?: string;
  actionType?: AuditActionType;
  targetType?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}
