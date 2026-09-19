# Implementation Tasks: R7 — Administration & Platform Operations

**Roadmap Entry**: R7 — Administration & Platform Operations  
**Feature Directory**: [`specs/007-admin-operations/`](file:///C:/Users/devvrat/Projects/leet_code/specs/007-admin-operations/)  
**Specification**: [`specs/007-admin-operations/spec.md`](file:///C:/Users/devvrat/Projects/leet_code/specs/007-admin-operations/spec.md)  
**Implementation Plan**: [`specs/007-admin-operations/plan.md`](file:///C:/Users/devvrat/Projects/leet_code/specs/007-admin-operations/plan.md)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## Overview & Implementation Strategy

- **MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundations) + Phase 3 (US1 User Moderation) + Phase 7 (US6 RBAC Governance) + Phase 8 (US7 Audit Logging).
- **Parallel Opportunities**: UI components and server services within each user story can be developed in parallel once foundational models are in place.
- **Strict Guardrails**: Zero manual editing of external coding stats; step-up `"CONFIRM"` modal for destructive actions.

---

## Phase 1: Setup & Project Scaffolding

- [x] T001 Setup administrative route groups and layout structure in `src/app/(admin)/admin/layout.tsx`
- [x] T002 [P] Create admin navigation sidebar and breadcrumbs in `src/components/admin/AdminSidebar.tsx`
- [x] T003 [P] Configure administrative RBAC type definitions and action enums in `src/types/admin.ts`

---

## Phase 2: Foundational Prerequisites

- [x] T004 Define `AuditLog`, `Achievement`, `AcademicBranch`, and `AcademicPeriod` models in `prisma/schema.prisma`
- [x] T005 [P] Create Prisma database migration and generate client via `prisma/migrations/`
- [x] T006 [P] Implement base audit logger service in `src/server/services/audit.service.ts`
- [x] T007 Implement RBAC middleware and role assertion guards in `src/server/auth/rbac.ts`
- [x] T008 [P] Create step-up confirmation modal dialog primitive in `src/components/ui/StepUpConfirmModal.tsx`

---

## Phase 3: User Story 1 — User Account Management & Moderation (Priority: P1)

*Goal: Enable administrators to search, filter, update profile metadata, and disable problematic student accounts without modifying raw statistics.*

- [x] T009 [P] [US1] Create unit tests for user moderation and read-only stats guard in `tests/unit/admin-user.test.ts`
- [x] T010 [US1] Implement administrative user query and update service in `src/server/services/admin-user.service.ts`
- [x] T011 [P] [US1] Create administrative user list API Route Handler with pagination in `src/app/api/admin/users/route.ts`
- [x] T012 [US1] Create user status mutation API Route Handler (toggle active/disabled) in `src/app/api/admin/users/[id]/status/route.ts`
- [x] T013 [P] [US1] Implement user search and filter table component in `src/components/admin/UserManagementTable.tsx`
- [x] T014 [US1] Implement user edit modal (name, branch, batch, gender) in `src/components/admin/EditUserModal.tsx`
- [x] T015 [US1] Build User Management page assembling table and modals in `src/app/(admin)/admin/users/page.tsx`

---

## Phase 4: User Story 2 — Duplicate Account Detection & Resolution (Priority: P1)

*Goal: Detect contested LeetCode usernames across multiple accounts and provide a resolution workflow that unlinks handles safely.*

- [x] T016 [P] [US2] Create unit tests for duplicate resolution and "Pending LeetCode Link" state transition in `tests/unit/admin-duplicates.test.ts`
- [x] T017 [US2] Implement duplicate detection query service in `src/server/services/duplicate.service.ts`
- [x] T018 [P] [US2] Create duplicate conflicts API Route Handler in `src/app/api/admin/duplicates/route.ts`
- [x] T019 [US2] Create conflict resolution API Route Handler (unlinking handle and resetting stats) in `src/app/api/admin/duplicates/resolve/route.ts`
- [x] T020 [P] [US2] Build conflict inspection and comparison component in `src/components/admin/DuplicateConflictCard.tsx`
- [x] T021 [US2] Build Duplicate Accounts queue page in `src/app/(admin)/admin/duplicates/page.tsx`

---

## Phase 5: User Story 3 — Achievement Configuration Engine (Priority: P1)

*Goal: Enable administrators to define, categorize, and activate achievements with validated boolean condition rules.*

- [x] T022 [P] [US3] Create unit tests for achievement condition AST parser and syntax validator in `tests/unit/achievement-validator.test.ts`
- [x] T023 [US3] Implement achievement rule AST validator and whitelist parser in `src/server/services/achievement-validator.ts`
- [x] T024 [US3] Implement achievement administrative CRUD service with grandfathering preservation in `src/server/services/admin-achievement.service.ts`
- [x] T025 [P] [US3] Create achievement management API Route Handler in `src/app/api/admin/achievements/route.ts`
- [x] T026 [P] [US3] Build visual achievement condition builder and syntax linter component in `src/components/admin/AchievementBuilderForm.tsx`
- [x] T027 [US3] Build Achievement Studio dashboard page in `src/app/(admin)/admin/achievements/page.tsx`

---

## Phase 6: User Story 4 — Synchronization Health Monitoring & Manual Operations (Priority: P1)

*Goal: Provide real-time visibility into queue health, error logs, and enable on-demand individual or batch sync triggers.*

- [x] T028 [P] [US4] Create integration test for manual sync dispatch and rate-limit circuit breaker in `tests/integration/admin-sync.test.ts`
- [x] T029 [US4] Implement sync queue health metrics and error log aggregator in `src/server/services/admin-sync.service.ts`
- [x] T030 [P] [US4] Create sync health metrics API Route Handler in `src/app/api/admin/sync/health/route.ts`
- [x] T031 [US4] Create single-user on-demand sync trigger API Route Handler in `src/app/api/admin/users/[id]/sync/route.ts`
- [x] T032 [US4] Create batch platform sync API Route Handler with step-up auth validation in `src/app/api/admin/sync/batch/route.ts`
- [x] T033 [P] [US4] Build live queue health stats and error categorization charts in `src/components/admin/SyncHealthDashboard.tsx`
- [x] T034 [US4] Build Sync Operations control panel page in `src/app/(admin)/admin/sync/page.tsx`

---

## Phase 7: User Story 6 — Administrator RBAC & Access Governance (Priority: P1)

*Goal: Enforce two-tier administrative RBAC, prevent last Super Admin lockout, and protect administrative actions.*

- [x] T035 [P] [US6] Create unit tests for lockout prevention (zero Super Admin defense) in `tests/unit/admin-rbac.test.ts`
- [x] T036 [US6] Implement administrator role grant and revocation service in `src/server/services/admin-role.service.ts`
- [x] T037 [P] [US6] Create admin role management API Route Handler in `src/app/api/admin/roles/route.ts`
- [x] T038 [US6] Build admin invite and role assignment component in `src/components/admin/AdminRoleManager.tsx`
- [x] T039 [US6] Build Administrator Access Governance page in `src/app/(admin)/admin/governance/page.tsx`

---

## Phase 8: User Story 7 — Comprehensive Administrative Audit Logging (Priority: P1)

*Goal: Maintain an immutable audit log capturing 100% of administrative mutations with JSON before/after state diffs.*

- [x] T040 [P] [US7] Create unit tests for before/after state diff generator in `tests/unit/audit-diff.test.ts`
- [x] T041 [US7] Implement audit log query and filtering service in `src/server/services/admin-audit.service.ts`
- [x] T042 [P] [US7] Create audit log search API Route Handler in `src/app/api/admin/audit/route.ts`
- [x] T043 [P] [US7] Build audit log table with filter bar and JSON state diff viewer in `src/components/admin/AuditLogViewer.tsx`
- [x] T044 [US7] Build Audit Log Explorer page in `src/app/(admin)/admin/audit/page.tsx`

---

## Phase 9: User Story 5 — Academic Calendar & Branch Configuration (Priority: P2)

*Goal: Enable administrators to manage academic branches and configure semester/year boundaries for time-filtered leaderboards.*

- [x] T045 [P] [US5] Create unit tests for date sequence validator in `tests/unit/calendar-validator.test.ts`
- [x] T046 [US5] Implement branch and academic calendar service in `src/server/services/calendar.service.ts`
- [x] T047 [P] [US5] Create branch management API Route Handler in `src/app/api/admin/branches/route.ts`
- [x] T048 [P] [US5] Create academic period API Route Handler in `src/app/api/admin/calendar/route.ts`
- [x] T049 [US5] Build branch editor and semester date picker in `src/components/admin/CalendarManager.tsx`
- [x] T050 [US5] Build Academic Calendar & Department Configuration page in `src/app/(admin)/admin/calendar/page.tsx`

---

## Phase 10: Polish & Cross-Cutting Concerns

- [x] T051 Run end-to-end validation suite covering full admin workflows in `tests/e2e/admin-journeys.spec.ts`
- [x] T052 [P] Optimize database query performance with composite index verification in `tests/integration/admin-perf.test.ts`
- [x] T053 [P] Perform responsive layout polish and dark/light mode consistency review across all administrative pages
- [x] T054 Conduct interactive UI/UX frontend review with the user to collect and apply design recommendations across all admin screens, ensuring human-crafted polish and bespoke aesthetics that do not feel AI-generated

