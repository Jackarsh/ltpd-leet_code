# Implementation Plan: R7 — Administration & Platform Operations

**Roadmap Entry**: R7 — Administration & Operations  
**Feature Directory**: [`specs/007-admin-operations/`](file:///C:/Users/devvrat/Projects/leet_code/specs/007-admin-operations/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Deliver an administrative management console for user moderation, duplicate account resolution, achievement definition authoring, sync monitoring, academic calendar configuration, RBAC governance, and immutable audit logging without allowing manual stats falsification.

---

## 2. Technical Architecture & Components

### 2.1. Admin RBAC & Middleware Security
- `src/server/auth/rbac.ts`: Enforces role boundaries:
  - `SUPER_ADMIN`: Full system control, admin role grants/revocations, batch platform syncs, global calendar updates.
  - `PLATFORM_ADMIN`: User moderation, manual user syncs, achievement management.
  - `STUDENT`: Blocked from `/admin/*` routes with HTTP 403.
- Last Super Admin Safeguard: Middleware/service layer blocks role revocation if active Super Admin count $= 1$.
- Step-Up Verification: Modal requiring text entry (`"CONFIRM"`) for destructive/batch actions.

### 2.2. Immutable Audit Logging Subsystem
- `src/server/services/audit.service.ts`:
  - Automatically hooks into all admin mutations.
  - Records: `id`, `adminUserId`, `actionType`, `targetType`, `targetId`, `beforeState`, `afterState`, `ipAddress`, `userAgent`, `timestamp`.
  - Append-only PostgreSQL table without `UPDATE` or `DELETE` permissions granted.

### 2.3. Frontend Administrative Views
- `src/app/(admin)/admin/users/page.tsx`: Paginated user table with search, edit modal, and disable toggle.
- `src/app/(admin)/admin/duplicates/page.tsx`: Conflict resolution queue for contested LeetCode usernames.
- `src/app/(admin)/admin/achievements/page.tsx`: Achievement Studio with visual condition builder and syntax linter.
- `src/app/(admin)/admin/sync/page.tsx`: Real-time queue health, error logs, and manual sync triggers.
- `src/app/(admin)/admin/calendar/page.tsx`: Academic branch and semester boundary date manager.
- `src/app/(admin)/admin/audit/page.tsx`: Searchable audit log explorer with JSON diff viewer.

---

## 3. Data Model & Prisma Schema Slice

```prisma
model AuditLog {
  id              String        @id @default(uuid())
  adminUserId     String
  adminUser       User          @relation("AdminAuditActions", fields: [adminUserId], references: [id], onDelete: Restrict)
  actionType      String
  targetType      String
  targetId        String
  beforeState     Json?
  afterState      Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime      @default(now())

  @@index([adminUserId, createdAt])
  @@index([actionType, createdAt])
  @@index([targetType, targetId])
}

model AcademicPeriod {
  id            String                @id @default(uuid())
  name          String
  periodType    String                // "SEMESTER" | "ACADEMIC_YEAR"
  startDate     DateTime
  endDate       DateTime
  isCurrent     Boolean               @default(false)
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt
}
```

---

## 4. API Endpoints & Contracts

- `GET /api/admin/users`: Search and filter user accounts.
- `PATCH /api/admin/users/:id`: Edit user metadata or toggle `ACTIVE`/`DISABLED` status.
- `POST /api/admin/duplicates/resolve`: Unlink handle or soft-disable duplicate account.
- `POST /api/admin/achievements`: Create/update achievement with validated condition expression.
- `POST /api/admin/sync/batch`: Trigger platform batch sync (Super Admin only).
- `GET /api/admin/audit-logs`: Search and inspect audit trail entries.

---

## 5. Verification & Testing Strategy

- **Unit Tests**: Achievement condition expression syntax validator (detects invalid operators/variables); lockout prevention guard test.
- **Integration Tests**: Immutable audit log creation on every admin mutation; duplicate handle unlinking reset test.
- **E2E Tests**: Disabling user account verifies immediate removal from leaderboard; batch sync trigger with confirmation prompt.
