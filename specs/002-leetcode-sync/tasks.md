# Implementation Tasks: R2 â€” LeetCode Integration & Coding Data

**Roadmap Entry**: R2 â€” LeetCode Data Ingestion  
**Feature Directory**: `specs/002-leetcode-sync/`  
**Specification**: `specs/002-leetcode-sync/spec.md`  
**Implementation Plan**: `specs/002-leetcode-sync/plan.md`  
**Created**: 2026-09-19  
**Status**: Ready for Implementation

---

## Overview & Implementation Strategy

- **MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational Models & Provider) + Phase 3 (US1/US6 Connect & Validate) + Phase 4 (US3/US4 Core Sync & Error Resilience) + Phase 6 (US7 Stats Display).
- **Architecture**: Isolated LeetCode GraphQL provider abstraction (`ICodingPlatformProvider`), sync worker pipeline, robust retry & circuit breaker, and Prisma persistence.
- **Strict Guardrails**: Non-destructive sync (never wipe existing stats on failure), rate-limiting protection, and zero user-editable stats.

---

## Phase 1: Setup & Project Scaffolding

- [x] T001 Scaffold LeetCode provider and sync services directory structure in `src/server/providers/` and `src/server/services/leetcode/`
- [x] T002 [P] Define TypeScript interfaces for LeetCode raw response and parsed statistics in `src/types/leetcode.ts`
- [x] T003 [P] Configure LeetCode GraphQL endpoint constants and query documents in `src/lib/leetcode-queries.ts`

---

## Phase 2: Foundational Prerequisites

- [x] T004 Define `LinkedCodingAccount`, `CodingStatistics`, `SubmissionHistory`, and `SyncStatus` models in `prisma/schema.prisma`
- [x] T005 Generate Prisma client with new models via `npx prisma generate`
- [x] T006 [P] Implement `ICodingPlatformProvider` base interface and error definitions in `src/server/providers/base.provider.ts`
- [x] T007 Implement LeetCode GraphQL API provider client in `src/server/providers/leetcode.provider.ts`
- [x] T008 [P] Implement rate-limiter and circuit-breaker utility in `src/lib/rate-limiter.ts`

---

## Phase 3: User Stories 1 & 6 â€” LeetCode Username Connection & Validation (Priority: P1)

**Goal**: Validate that a student's LeetCode username resolves to an active, public account, and link it to their user profile.

- [x] T009 [US1] Create validation schema for LeetCode username connection in `src/lib/validations/leetcode.ts`
- [x] T010 [US1] Implement username verification service check against LeetCode GraphQL in `src/server/services/leetcode/verify.service.ts`
- [x] T011 [US1] Implement server action to link and verify LeetCode account in `src/server/actions/link-leetcode.ts`
- [x] T012 [P] [US6] Add non-existent and private account error handlers in `src/server/providers/leetcode.provider.ts`
- [x] T013 [P] [US1] Create LeetCode account connection UI component in `src/components/profile/LeetCodeConnectCard.tsx`

---

## Phase 4: User Stories 3 & 4 â€” Core Ingestion Engine & Fault-Tolerant Sync (Priority: P1)

**Goal**: Execute background data synchronization fetching solved counts, contest rating, and ranking, guaranteeing non-destructive behavior on error.

- [x] T014 [US3] Implement sync engine service parsing problems solved, contest rating, and global rank in `src/server/services/leetcode/sync.service.ts`
- [x] T015 [US4] Implement non-destructive database upsert transaction preserving last-known-good stats in `src/server/services/leetcode/sync.service.ts`
- [x] T016 [US3] Implement on-demand sync server action `syncNow` in `src/server/actions/sync-leetcode.ts`
- [x] T017 [US3] Implement scheduled periodic synchronization worker in `src/server/workers/leetcode-sync.ts`
- [x] T018 [US4] Implement sync error classification (rate-limit, network, 404) and failure logging in `src/server/services/leetcode/sync-log.service.ts`

---

## Phase 5: User Stories 2 & 10 â€” Sync Status & Stale-Data Monitoring (Priority: P1/P2)

**Goal**: Display synchronization status (IN_PROGRESS, SUCCESS, FAILED, STALE) and last synced timestamp to the student.

- [x] T019 [US2] Create sync status and last-synced time helper utility in `src/lib/sync-utils.ts`
- [x] T020 [US10] Implement stale data detection (>24 hours threshold) in `src/server/services/leetcode/sync.service.ts`
- [x] T021 [P] [US2] Create `SyncStatusBadge` component with animated pulse and timestamp in `src/components/ui/SyncStatusBadge.tsx`
- [x] T022 [US2] Add sync status header and "Sync Now" trigger button in `src/components/dashboard/SyncControlBar.tsx`

---

## Phase 6: User Story 7 â€” Coding Statistics Display (Priority: P1)

**Goal**: Render solved counts (Easy, Medium, Hard, Total), contest rating, and rank on student dashboard and public profile.

- [x] T023 [US7] Create statistics summary DTO mapper in `src/server/services/leetcode/stats.service.ts`
- [x] T024 [US7] Create `SolvedDifficultyCards` component showing Easy/Medium/Hard breakdown in `src/components/dashboard/SolvedDifficultyCards.tsx`
- [x] T025 [P] [US7] Create `ContestRatingCard` component showing rating and global ranking in `src/components/dashboard/ContestRatingCard.tsx`
- [x] T026 [US7] Update student dashboard in `src/app/(dashboard)/dashboard/page.tsx` with live LeetCode stats grid
- [x] T027 [US7] Update public profile page in `src/app/(dashboard)/profiles/[username]/page.tsx` with synced coding stats and non-editable guards

---

## Phase 7: User Stories 8, 9, 11 â€” Activity Heatmap, Recent Submissions & Deduplication (Priority: P2)

**Goal**: Fetch, deduplicate, and persist recent submissions and daily activity counts for heatmap visualization.

- [x] T028 [US11] Implement submission deduplication algorithm by timestamp and titleSlug in `src/server/services/leetcode/submission.service.ts`
- [x] T029 [US8] Implement calendar activity aggregation (daily solve counts) in `src/server/services/leetcode/activity.service.ts`
- [x] T030 [P] [US8] Create `ActivityCalendar` heatmap UI component in `src/components/dashboard/ActivityCalendar.tsx`
- [x] T031 [P] [US9] Create `RecentSubmissionsList` UI component in `src/components/dashboard/RecentSubmissionsList.tsx`

---

## Phase 8: User Story 5 â€” LeetCode Username Change (Priority: P2)

**Goal**: Allow a student to update their connected LeetCode username and reset sync state cleanly.

- [x] T032 [US5] Implement username update server action with re-verification in `src/server/actions/change-leetcode-username.ts`
- [x] T033 [US5] Update `LeetCodeConnectCard.tsx` to allow updating handle and confirm data reset

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T034 Add API route for webhook/cron trigger in `src/app/api/cron/sync/route.ts`
- [x] T035 Verify responsive layouts across mobile and desktop for all coding stats components
- [x] T036 Run TypeScript check and production build validation (`npm run build`)