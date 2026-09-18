# Implementation Plan: R3 — College Leaderboard & Analytics

**Roadmap Entry**: R3 — College Leaderboard & Analytics  
**Feature Directory**: [`specs/003-college-leaderboard/`](file:///C:/Users/devvrat/Projects/leet_code/specs/003-college-leaderboard/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Deliver a high-performance, deterministic college leaderboard with instant filtering (branch, batch, time window), search, and transparent ranking formulas.

---

## 2. Technical Architecture & Components

### 2.1. Ranking Engine & Materialization Pipeline
- `src/server/services/ranking.service.ts`:
  - Formula: $\text{Weighted Score} = (1 \times E) + (3 \times M) + (6 \times H) + (0.5 \times \text{Contest Rating})$.
  - Deterministic Tie-Breaker: (1) Weighted Score DESC, (2) Hard Solved DESC, (3) Medium Solved DESC, (4) Easy Solved DESC, (5) Registration Date ASC.
  - Materializes `collegeRank` and `weightedScore` into `UserProfile` post-sync to eliminate dynamic SQL joins during page renders.
- `src/server/services/leaderboard.service.ts`: Query builder with composite index hints, branch filters, pagination, and search.

### 2.2. Frontend Routes & Components (RSC + Client Interactive Filters)
- `src/app/(dashboard)/leaderboard/page.tsx`: Server-rendered leaderboard shell for instant initial paint.
- `src/components/leaderboard/LeaderboardTable.tsx`: Virtualized/paginated table with student rank, avatar, name, branch badge, problem breakdown, and contest rating.
- `src/components/leaderboard/LeaderboardFilters.tsx`: Instant URL-synced search bar and dropdowns for Branch, Batch, and Period.
- `src/components/leaderboard/RankingFormulaModal.tsx`: Transparent methodology explanation modal.

---

## 3. Data Access & Indexing Strategy

```prisma
// Composite indexes in PostgreSQL ensuring sub-20ms queries:
@@index([collegeRank])
@@index([weightedScore(sort: Desc)])
@@index([branchId, weightedScore(sort: Desc)])
```

---

## 4. API Endpoints & Contracts

- `GET /api/leaderboard`:
  - Query Params: `page=1`, `limit=25`, `branch=CSE`, `batch=2024`, `search=john`, `period=ALL_TIME`.
  - Response: `{ students: LeaderboardRowDTO[], total: number, page: number, totalPages: number, lastSyncAt: string }`.

---

## 5. Verification & Testing Strategy

- **Unit Tests**: Deterministic tie-breaking tests with identical scores, negative/zero rating edge cases.
- **Integration Tests**: Database query performance on 10,000 seeded student records (<50ms execution).
- **E2E Tests**: Filter switching, student name search, pagination navigation, formula modal verification.
