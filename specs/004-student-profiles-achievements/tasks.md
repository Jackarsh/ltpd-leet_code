# Implementation Tasks: R4 — Student Profiles, Activity & Configurable Achievements

**Roadmap Entry**: R4 — Profiles & Achievements  
**Feature Directory**: `specs/004-student-profiles-achievements/`  
**Specification**: `specs/004-student-profiles-achievements/spec.md`  
**Implementation Plan**: `specs/004-student-profiles-achievements/plan.md`  
**Created**: 2026-09-19  
**Status**: Completed

---

## Overview & Implementation Strategy

- **Scope**: Build rich public student coding profiles featuring verified statistics, interactive 12-month submission activity heatmaps (accepted submissions only), active/longest streaks, contest histories (current & highest peak rating), chronological recent activity feed, and an automated rule-based achievement evaluation engine.
- **Architecture**:
  - Achievement Rule Engine (`src/server/services/achievement-rule.service.ts` & `achievement.service.ts`) with AST condition evaluator (`total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `contest_rating`, `contests_attended`, `current_streak`, `longest_streak`).
  - Activity & Heatmap Engine (`src/server/services/activity.service.ts`) aggregating daily accepted submission counts and computing the 6 key metrics.
  - Zero Email Exposure guarantee (Constitution compliant).
  - Modern Next.js App Router UI with responsive SVG/CSS activity heatmap, difficulty donut/bars, contest card, and achievement gallery.

---

## Phase 1: Setup & Data Model Expansion

- [x] T001 Update `prisma/schema.prisma` with `Achievement`, `UserAchievement`, and peak fields (`highestContestRating`, `longestStreak`), then regenerate Prisma client via `npx prisma generate`
- [x] T002 [P] Define TypeScript interfaces for profiles, 12-month heatmaps, achievement definitions, and user badges in `src/types/profile.ts`
- [x] T003 [P] Create default collegiate achievement catalog seed definitions in `src/lib/default-achievements.ts`

---

## Phase 2: Achievement Rule Engine & Activity Computation

- [x] T004 Implement condition AST rule parser in `src/server/services/achievement-rule.service.ts`
- [x] T005 Implement achievement evaluation and awarding service in `src/server/services/achievement.service.ts`
- [x] T006 [P] Implement 12-month activity heatmap builder and 6-metric summary calculator in `src/server/services/activity.service.ts`
- [x] T007 Integrate achievement evaluation and peak contest rating update into `syncUserLeetCodeData` in `src/server/services/leetcode/sync.service.ts`
- [x] T008 Implement achievement revocation handler for stat decreases and clearing on handle updates in `src/server/services/achievement.service.ts`

---

## Phase 3: Public Profile API & DTO Security

- [x] T009 Implement public profile data retrieval service in `src/server/services/profile.service.ts` ensuring strict zero email/auth leakage
- [x] T010 Implement `GET /api/profiles/[username]` API route handler in `src/app/api/profiles/[username]/route.ts`
- [x] T011 [P] Implement `GET /api/achievements` API route handler in `src/app/api/achievements/route.ts`

---

## Phase 4: UI Components

- [x] T012 [US1] Create `ProfileHeader.tsx` displaying student identity, rank badge, and branch/batch in `src/components/profile/ProfileHeader.tsx`
- [x] T013 [US2] Create `DifficultyDonutChart.tsx` displaying problem counts, percentages, and visual bars in `src/components/profile/DifficultyDonutChart.tsx`
- [x] T014 [US3] Create `ContestPerformanceCard.tsx` displaying current rating, peak rating, and rank in `src/components/profile/ContestPerformanceCard.tsx`
- [x] T015 [US4] Create `ActivityHeatmap.tsx` rendering a 12-month calendar grid with tooltip date/count inspection and the 6 summary metrics in `src/components/profile/ActivityHeatmap.tsx`
- [x] T016 [US5] Create `RecentActivityFeed.tsx` displaying chronological verified accepted problem solves and achievements in `src/components/profile/RecentActivityFeed.tsx`
- [x] T017 [US6] [US7] Create `AchievementGallery.tsx` displaying earned badges, category filters, and locked badges in `src/components/profile/AchievementGallery.tsx`

---

## Phase 5: Page Integration & Routing

- [x] T018 [US1] [US8] [US10] [US12] Update server-rendered page `src/app/(dashboard)/profiles/[username]/page.tsx` with complete profile layout, stale indicators, and owner detection
- [x] T019 [P] Add route alias/redirect from `/profile/[username]` to `/profiles/[username]` in `src/app/profile/[username]/page.tsx` for FR-301a compatibility

---

## Phase 6: Verification & Testing

- [x] T020 Write unit tests for achievement rule parser and 12-month activity heatmap calculations in `tests/achievement.test.ts`
- [x] T021 Execute unit tests and verify 100% passing status
- [x] T022 Run TypeScript typecheck and full production build validation via `npm run build`