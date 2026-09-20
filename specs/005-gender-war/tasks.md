# Implementation Tasks: R5 — Gender War (Male vs Female Coding Comparison)

**Roadmap Entry**: R5 — Gender War  
**Feature Directory**: `specs/005-gender-war/`  
**Specification**: `specs/005-gender-war/spec.md`  
**Implementation Plan**: `specs/005-gender-war/plan.md`  

---

## Phase 1: Setup & Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and data models for Gender War aggregation

- [x] T001 Update `prisma/schema.prisma` with `GenderWarAggregate` model
- [x] T002 Generate Prisma client via `npx prisma generate`
- [x] T003 [P] Create DTO interfaces and types for gender war aggregates in `src/types/gender-war.ts`
- [x] T004 Implement base aggregate computation service in `src/server/services/gender-war.service.ts`

---

## Phase 2: User Story 7 & 8 — Gender Assignment, Group Membership & Changes (Priority: P1/P2)

**Goal**: Ensure strict gender attribution without inference and handle gender changes cleanly in calculations.

- [x] T005 [US7] Implement participant query builder enforcing strict `UserProfile.gender` match in `src/server/services/gender-war.service.ts`
- [x] T006 [US8] Implement attribution re-calculation logic ignoring historical gender states in `src/server/services/gender-war.service.ts`
- [x] T007 Add hook to trigger `GenderWarAggregate` re-calculation post platform-wide sync batch in `src/server/services/leetcode/sync.service.ts`

---

## Phase 3: User Story 2 & 10 — Aggregate Metrics & Stale Data (Priority: P1/P2)

**Goal**: Compute all 15 required aggregate metrics (totals and averages) and track data freshness.

- [x] T008 [US2] Implement active coders and low sample size detection (<5 participants) logic in `src/server/services/gender-war.service.ts`
- [x] T009 [US2] Implement normalized metric (per-participant average) calculations avoiding division-by-zero in `src/server/services/gender-war.service.ts`
- [x] T010 [US10] Implement stale data detection and exclusion of unrated participants from rating averages in `src/server/services/gender-war.service.ts`

---

## Phase 4: User Story 3 & 9 — Time Period Filtering & Zero Participants (Priority: P2/P1)

**Goal**: Support multiple time windows for activity metrics and handle empty groups gracefully.

- [x] T011 [US3] Implement time-period windowing (Week/Month/Semester/Year/All) in `src/server/services/gender-war.service.ts`
- [x] T012 [US9] Implement zero-participant graceful fallback (returning "N/A" rather than errors) in `src/server/services/gender-war.service.ts`
- [x] T013 [P] [US3] Create time-period selector UI component in `src/components/gender-war/ComparisonHeader.tsx`
- [x] T014 Implement API route for fetching gender war aggregates in `src/app/api/gender-war/route.ts`

---

## Phase 5: User Story 5 — Within-Group Leaderboards (Priority: P2)

**Goal**: Provide a separate ranked list for Male and Female students.

- [x] T015 [US5] Implement within-group leaderboard query service with ties broken by Hard solved then college rank in `src/server/services/gender-war.service.ts`
- [x] T016 [US5] Implement API route for within-group leaderboards in `src/app/api/gender-war/leaderboard/route.ts`
- [x] T017 [P] [US5] Create within-group leaderboard UI component with top 10 inline and paginated expansion in `src/components/gender-war/WithinGroupLeaderboards.tsx`

---

## Phase 6: User Story 1, 4, & 6 — UI Visualizations, Symmetrical Layout, & Methodology (Priority: P1/P2)

**Goal**: Present the dashboard with complete neutrality, equivalent visuals, and transparent rules.

- [x] T018 [US4] Create metric comparison charts using normalized averages in `src/components/gender-war/MetricComparisonCharts.tsx`
- [x] T019 [US1] Create symmetrical Male/Female side-by-side metric display panels in `src/components/gender-war/SymmetricalPanels.tsx`
- [x] T020 [US6] Create transparent comparison methodology and attribution rules panel in `src/components/gender-war/MethodologyPanel.tsx`
- [x] T021 [US1] Assemble Gender War dashboard page combining header, panels, charts, and leaderboards in `src/app/(dashboard)/gender-war/page.tsx`
- [x] T022 Add navigation link to Gender War page in `src/components/layout/Navbar.tsx`

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T023 Optimize Redis caching for aggregate queries in `src/server/services/gender-war.service.ts`
- [x] T024 Perform responsive layout audit for side-by-side panels on mobile devices
- [x] T025 Run full production build validation via `npm run build`
