# Implementation Plan: R4 — Student Profiles, Activity & Configurable Achievements

**Roadmap Entry**: R4 — Profiles & Achievements  
**Feature Directory**: [`specs/004-student-profiles-achievements/`](file:///C:/Users/devvrat/Projects/leet_code/specs/004-student-profiles-achievements/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Build rich public student coding profiles featuring verified statistics, interactive submission activity heatmaps, active streaks, contest histories, and an automated rule-based achievement evaluation engine.

---

## 2. Technical Architecture & Components

### 2.1. Achievement Evaluation Engine
- `src/server/services/achievement.service.ts`:
  - Condition Parser: Lightweight Abstract Syntax Tree (AST) evaluator parsing boolean rules (e.g. `total_solved >= 100 AND hard_solved >= 10`).
  - Supported variables: `total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `contest_rating`, `contests_attended`, `current_streak`, `longest_streak`.
  - Trigger: Dispatched post-sync for each updated user account.
  - Grandfathering: Evaluates eligibility; creates `UserAchievement` record with timestamp; never removes previously unlocked badges.

### 2.2. Submission Activity & Heatmap Generator
- `src/server/services/activity.service.ts`: Aggregates accepted submissions into calendar day buckets (`YYYY-MM-DD` -> `count`) for GitHub-style visual heatmaps.
- Stored in indexed `UserActivityLog` table to prevent full table scans over `SubmissionHistory`.

### 2.3. Frontend Routes & UI Components
- `src/app/(dashboard)/profiles/[username]/page.tsx`: Server-rendered public profile with SEO tags.
- `src/components/profile/ProfileHeader.tsx`: Avatar, display name, verified LeetCode link, college rank, branch badge.
- `src/components/profile/DifficultyDonutChart.tsx`: Easy / Medium / Hard visual breakdown.
- `src/components/profile/ActivityHeatmap.tsx`: 365-day SVG/CSS grid activity heatmap.
- `src/components/profile/AchievementGallery.tsx`: Unlocked badge showcase with category filtering and locked milestone tooltips.

---

## 3. Data Model & Prisma Schema Slice

```prisma
model Achievement {
  id                  String              @id @default(uuid())
  name                String              @unique
  slug                String              @unique
  description         String
  category            AchievementCategory
  iconKey             String
  conditionExpression String
  rarityLevel         String
  points              Int                 @default(10)
  status              AchievementStatus   @default(PUBLISHED)
  recipients          UserAchievement[]
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
}

model UserAchievement {
  id            String        @id @default(uuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievementId String
  achievement   Achievement   @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  unlockedAt    DateTime      @default(now())
  isFeatured    Boolean       @default(false)

  @@unique([userId, achievementId])
}
```

---

## 4. Privacy & API Contracts

- `GET /api/profiles/:username`:
  - Returns public payload: `{ displayName, avatarUrl, branch, batch, collegeRank, stats, streak, contest, heatmap, achievements }`.
  - **Zero Exposure**: Email, internal user IDs, and auth tokens are explicitly stripped by DTO mappers.

---

## 5. Verification & Testing Strategy

- **Unit Tests**: AST rule parser with complex AND/OR conditions, streak edge cases (leap years, timezone offsets).
- **Integration Tests**: Post-sync achievement unlocking, heatmap aggregation query speed.
- **E2E Tests**: Navigating to student profile from leaderboard, viewing badges, inspecting activity heatmap tooltips.
