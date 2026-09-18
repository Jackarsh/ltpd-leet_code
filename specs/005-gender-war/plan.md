# Implementation Plan: R5 — Gender War (Male vs Female Coding Comparison)

**Roadmap Entry**: R5 — Gender War  
**Feature Directory**: [`specs/005-gender-war/`](file:///C:/Users/devvrat/Projects/leet_code/specs/005-gender-war/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Create a dedicated, balanced, and transparent statistics-driven comparison dashboard between Male and Female students using strictly explicit gender records, normalized metrics, and symmetrical UI presentation without declaring a single binary winner.

---

## 2. Technical Architecture & Components

### 2.1. Aggregation Engine & Service
- `src/server/services/gender-war.service.ts`:
  - Computes 15 aggregate metrics for both Male and Female groups across 5 time windows (`CURRENT_WEEK`, `CURRENT_MONTH`, `SEMESTER`, `ACADEMIC_YEAR`, `ALL_TIME`).
  - Strict Gender Attribution: Group membership is derived strictly from `UserProfile.gender` (never inferred).
  - Normalization: Computes per-participant averages: $\text{Avg} = \frac{\text{Total Metric}}{\text{Participant Count}}$.
  - Contest Rating Denominator: Excludes unrated students from average contest rating calculations.
  - Active Coders: Counts participants with $\ge 1$ accepted submission or $\ge 1$ contest attended in the period window.
  - Low Sample Size Warning: Detects if a group has $< 5$ participants and flags `isLowSampleSize = true`.
- Caching: Materializes results into `GenderWarAggregate` table post-sync and caches in Redis for sub-10ms response times.

### 2.2. Frontend Routes & UI Components
- `src/app/(dashboard)/gender-war/page.tsx`: Server-rendered comparison dashboard.
- `src/components/gender-war/ComparisonHeader.tsx`: Time-period selector (Current Week, Month, Semester, Year, All Time).
- `src/components/gender-war/SymmetricalPanels.tsx`: Side-by-side balanced cards for Male vs Female with equal visual weight and low-sample-size disclaimer badges.
- `src/components/gender-war/MetricComparisonCharts.tsx`: Recharts/SVG bar comparisons using normalized per-student averages on uniform axes.
- `src/components/gender-war/WithinGroupLeaderboards.tsx`: Top 10 leaderboards for Male and Female students with paginated modal expansion.
- `src/components/gender-war/MethodologyPanel.tsx`: Full public formula and gender change attribution policy.

---

## 3. Data Model & Prisma Schema Slice

```prisma
model GenderWarAggregate {
  id                      String          @id @default(uuid())
  gender                  Gender
  timeWindow              String          // "CURRENT_WEEK" | "CURRENT_MONTH" | "SEMESTER" | "YEAR" | "ALL_TIME"
  periodId                String?
  period                  AcademicPeriod? @relation(fields: [periodId], references: [id], onDelete: SetNull)
  
  participantCount        Int             @default(0)
  totalSolved             Int             @default(0)
  avgSolvedPerStudent     Float           @default(0.0)
  totalHard               Int             @default(0)
  avgHardPerStudent       Float           @default(0.0)
  ratedParticipantCount   Int             @default(0)
  avgContestRating        Float?
  activeCodersCount       Int             @default(0)
  recentSubmissionsCount  Int             @default(0)
  avgStreakDays           Float           @default(0.0)
  
  computedAt              DateTime        @default(now())

  @@unique([gender, timeWindow, periodId])
}
```

---

## 4. API Endpoints & Contracts

- `GET /api/gender-war`:
  - Query Params: `period=CURRENT_WEEK`
  - Response: `{ male: GroupMetricsDTO, female: GroupMetricsDTO, maleTop10: LeaderboardRowDTO[], femaleTop10: LeaderboardRowDTO[], computedAt: string }`

---

## 5. Verification & Testing Strategy

- **Unit Tests**: Zero participant division-by-zero tests; unrated contestant exclusion tests; low sample size badge logic.
- **Integration Tests**: Gender change re-attribution verification (updating gender reflects in next aggregate run).
- **E2E Tests**: Switching time periods, comparing charts side-by-side, expanding within-group leaderboards.
