# Implementation Tasks: R3 — College Leaderboard & Analytics

**Roadmap Entry**: R3 — College Leaderboard & Analytics  
**Feature Directory**: `specs/003-college-leaderboard/`  
**Specification**: `specs/003-college-leaderboard/spec.md`  
**Implementation Plan**: `specs/003-college-leaderboard/plan.md`  
**Created**: 2026-09-19  
**Status**: Completed

---

## Overview & Implementation Strategy

- **Scope**: Deliver a blazing-fast, deterministic college leaderboard with instant URL-synced filtering (branch, batch, gender, min solved, min rating, active status), multi-field search (name, handle, branch, batch), recognition cards, transparent ranking formula breakdown, and client UI data reload distinct from external LeetCode sync.
- **Architecture**:
  - Ranking materialization engine (`src/server/services/ranking.service.ts`) computing weighted score $= 1 \cdot E + 3 \cdot M + 6 \cdot H + 0.5 \cdot \text{Contest Rating}$ with deterministic tie-breaking: (1) Weighted Score DESC, (2) Hard Solved DESC, (3) Contest Rating DESC, (4) Display Name ASC.
  - High-performance query engine (`src/server/services/leaderboard.service.ts`) with composite index hints, branch/batch filtering, search deduplication, and zero email exposure (Constitution compliant).
  - Modern Next.js App Router UI with RSC initial load, responsive glassmorphic table, recognition cards, and interactive formula popover.

---

## Phase 1: Setup & Data Contracts

- [x] T001 Define leaderboard DTO interfaces and filter query parameter types in `src/types/leaderboard.ts`
- [x] T002 [P] Define ranking formula weights, coefficients, and default thresholds in `src/lib/ranking-config.ts`
- [x] T003 [P] Add branch and ranking indexes to `prisma/schema.prisma` and regenerate Prisma client via `npx prisma generate`

---

## Phase 2: Foundational Ranking & Recognition Services

- [x] T004 Implement ranking calculation engine with weighted score formula and deterministic tie-breaking in `src/server/services/ranking.service.ts`
- [x] T005 [P] Implement streak and 30-day activity calculation helper from submission history in `src/lib/activity-utils.ts`
- [x] T006 Connect ranking recalculation hook to `syncUserLeetCodeData` in `src/server/services/leetcode/sync.service.ts`
- [x] T007 Implement core leaderboard query service with pagination, composite filtering, and search in `src/server/services/leaderboard.service.ts`
- [x] T008 [P] Implement recognition cards query service for top solvers and contest leaders in `src/server/services/recognition.service.ts`

---

## Phase 3: API Route Handlers

- [x] T009 Implement `GET /api/leaderboard` route handler with query parameters validation in `src/app/api/leaderboard/route.ts`
- [x] T010 [P] Implement `GET /api/leaderboard/recognition` route handler in `src/app/api/leaderboard/recognition/route.ts`
- [x] T011 [P] Implement `GET /api/leaderboard/formula` route handler in `src/app/api/leaderboard/formula/route.ts`

---

## Phase 4: UI Components & User Stories

- [x] T012 [US6] Create recognition cards UI component displaying top performers in `src/components/leaderboard/RecognitionCards.tsx`
- [x] T013 [US4] [US5] Create interactive leaderboard filter & search bar with branch, batch, gender, min-problems, and min-rating in `src/components/leaderboard/LeaderboardFilters.tsx`
- [x] T014 [US8] [US9] [US10] Create individual leaderboard row component with fallback states and score details in `src/components/leaderboard/LeaderboardRow.tsx`
- [x] T015 [US1] [US2] [US3] Create responsive leaderboard table component with pagination, sorting, and row highlights in `src/components/leaderboard/LeaderboardTable.tsx`
- [x] T016 [US2] [US7] Create student ranking formula breakdown modal / popover in `src/components/leaderboard/RankingFormulaModal.tsx`
- [x] T017 [US11] Implement client-side UI data reload button with distinct timestamps for UI reload vs LeetCode sync in `src/components/leaderboard/LeaderboardRefreshButton.tsx`

---

## Phase 5: Page Integration & Navigation

- [x] T018 Add navigation link to Leaderboard in `src/components/layout/Navbar.tsx`
- [x] T019 [US1] Implement server-rendered leaderboard page shell with preloaded initial data in `src/app/(dashboard)/leaderboard/page.tsx`
- [x] T020 [US12] Verify deactivated accounts are excluded and email addresses are never returned in public DTOs

---

## Phase 6: Testing & Verification

- [x] T021 Implement database seed utility for mock leaderboard data in `src/server/scripts/seed-leaderboard.ts`
- [x] T022 Execute ranking calculation service on test data to verify deterministic ranks
- [x] T023 Run typecheck and full production build validation via `npm run build`