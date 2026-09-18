# Implementation Plan: R2 — LeetCode Data Ingestion & Synchronization

**Roadmap Entry**: R2 — LeetCode Data Ingestion  
**Feature Directory**: [`specs/002-leetcode-sync/`](file:///C:/Users/devvrat/Projects/leet_code/specs/002-leetcode-sync/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Build an isolated, fault-tolerant background data ingestion pipeline to synchronize verified LeetCode statistics, submissions, contest ratings, and streaks without corrupting existing data or blocking web requests.

---

## 2. Technical Architecture & Components

### 2.1. Coding Provider Abstraction Layer
- `src/server/providers/base.provider.ts`: Interface `ICodingPlatformProvider`.
- `src/server/providers/leetcode.provider.ts`: LeetCode GraphQL client querying:
  - `matchedUser(username)`: Profile existence and avatar.
  - `submitStatsGlobal`: Total/Easy/Medium/Hard problem solved counts.
  - `userContestRanking` & `userContestRankingHistory`: Rating, global rank, and contest participation.
  - `recentAcSubmissionList`: Accepted submissions timestamped array.
- Provider errors: `UserNotFoundError`, `RateLimitError`, `ProviderUnavailableError`.

### 2.2. Background Queue & Worker Topology (BullMQ + Redis)
- `src/server/workers/sync.queue.ts`:
  - `sync-user-queue`: Individual on-demand and retry jobs with concurrency limit = 5.
  - `batch-sync-queue`: Scheduled cron jobs (every 6 hours) with throttled dispatch (2 requests/sec).
- `src/server/workers/sync.worker.ts`: Worker process executing jobs, saving snapshots, updating streak counters, and logging execution metrics.
- `src/server/workers/circuit-breaker.ts`: Exponential backoff and queue pausing on external HTTP 429 errors.

---

## 3. Data Model & Prisma Schema Slice

```prisma
model LinkedCodingAccount {
  id            String              @id @default(uuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform      PlatformType        @default(LEETCODE)
  username      String
  isVerified    Boolean             @default(false)
  syncStatus    SyncStatus          @default(IN_PROGRESS)
  lastSyncAt    DateTime?
  lastSyncError String?
  statistics    CodingStatistics?
  submissions   SubmissionHistory[]
  contests      ContestParticipation[]
  syncLogs      SyncLog[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@unique([platform, username])
  @@index([userId])
  @@index([lastSyncAt])
}

model CodingStatistics {
  id                  String              @id @default(uuid())
  accountId           String              @unique
  account             LinkedCodingAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  totalSolved         Int                 @default(0)
  easySolved          Int                 @default(0)
  mediumSolved        Int                 @default(0)
  hardSolved          Int                 @default(0)
  contestRating       Float?
  globalContestRank   Int?
  contestsAttended    Int                 @default(0)
  currentStreakDays   Int                 @default(0)
  longestStreakDays   Int                 @default(0)
  rawSnapshotJson     Json?
  updatedAt           DateTime            @updatedAt

  @@index([totalSolved(sort: Desc)])
}
```

---

## 4. API Endpoints & Contracts

- `POST /api/me/link-leetcode`: Link username, validate format, enqueue initial sync.
- `POST /api/me/sync`: Rate-limited user-triggered refresh (max 1 per 30 minutes).
- `GET /api/me/sync-status`: Real-time polling endpoint for onboarding progress.

---

## 5. Verification & Testing Strategy

- **Unit Tests**: Provider parser tests with recorded GraphQL fixtures; streak calculation algorithm tests.
- **Integration Tests**: BullMQ job submission, worker execution, Prisma upsert transaction rollbacks on network failure.
- **Mock Tests**: Simulating 429 Throttling, 404 User Not Found, and Cloudflare HTML challenge fallbacks.
