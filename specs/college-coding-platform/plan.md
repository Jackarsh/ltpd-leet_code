# Technical Implementation Plan: College Coding Platform

**Parent Roadmap**: [`specs/college-coding-platform/roadmap.md`](file:///C:/Users/devvrat/Projects/leet_code/specs/college-coding-platform/roadmap.md)  
**Scope**: Features R1 through R7 (Identity, Sync, Leaderboard, Profiles, Gender War, Profile Cards, Admin)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Technical Context & Stack Overview

- **Frontend & Web Application**: Next.js 14+ (App Router), React Server Components (RSC), TypeScript, Tailwind CSS, Radix UI component primitives.
- **Backend / API Layer**: Next.js Route Handlers and Server Actions with Zod validation.
- **Data Layer & ORM**: PostgreSQL 15+ with Prisma ORM.
- **Background Worker & Task Queue**: BullMQ backed by Redis for scheduled and on-demand LeetCode synchronization.
- **Authentication**: Auth.js (NextAuth v5) with Prisma Adapter, Email Verification + Magic Links / Passwords, and HTTP-only Secure Cookie sessions.
- **Caching Layer**: In-memory Redis cache for leaderboard rankings, Gender War aggregates, and public SVG cards.

---

## 2. Project Directory Structure

```text
leet_code/
├── .specify/                         # Spec-kit memory and configurations
├── prisma/
│   ├── schema.prisma                 # Master relational data model
│   ├── migrations/                   # Declarative SQL migrations
│   └── seed.ts                       # Initial branches, achievements, super-admin seed
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # /login, /register, /verify-email
│   │   ├── (dashboard)/              # /leaderboard, /profiles/[username], /gender-war
│   │   ├── (student)/                # /studio/card, /settings/profile
│   │   ├── (admin)/                  # /admin/users, /admin/sync, /admin/achievements, /admin/audit
│   │   ├── api/                      # Public & Protected Route Handlers
│   │   │   ├── auth/[...nextauth]/   # Auth.js handler
│   │   │   ├── cards/[id]/           # Dynamic SVG & PNG Card generator
│   │   │   ├── leaderboard/          # Paginated leaderboard API
│   │   │   └── admin/                # Admin operations endpoints
│   │   ├── layout.tsx                # Root layout & theme providers
│   │   └── page.tsx                  # Home / Landing page
│   ├── components/                   # Reusable UI component library
│   │   ├── ui/                       # Base accessible primitives (Buttons, Cards, Dialogs, Tables)
│   │   ├── leaderboard/              # Leaderboard table, filter bars, search box
│   │   ├── profile/                  # Heatmap, streak counter, difficulty breakdown, badge gallery
│   │   ├── gender-war/               # Symmetrical comparison panels, charts, within-group tables
│   │   ├── card-studio/              # Real-time SVG previewer, theme picker, Markdown copy button
│   │   └── admin/                    # User table, conflict resolver, achievement builder, sync stats
│   ├── lib/                          # Core utilities and shared configuration
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── redis.ts                  # Redis connection instance
│   │   ├── auth.ts                   # Auth.js options and role helpers
│   │   └── logger.ts                 # Structured Pino logger
│   ├── server/                       # Dedicated Server-Side Domain Services
│   │   ├── providers/                # External coding platform providers
│   │   │   ├── base.provider.ts      # ICodingPlatformProvider interface
│   │   │   ├── leetcode.provider.ts  # LeetCode GraphQL provider implementation
│   │   │   └── provider.factory.ts   # Multi-provider factory
│   │   ├── services/                 # Domain business logic
│   │   │   ├── user.service.ts       # Profile & account lifecycle
│   │   │   ├── ranking.service.ts    # Deterministic weighted ranking engine
│   │   │   ├── achievement.service.ts# Rule-based AST condition evaluator
│   │   │   ├── gender-war.service.ts # Per-period aggregation and normalization engine
│   │   │   ├── card-svg.service.ts   # Dynamic SVG markup synthesizer
│   │   │   └── audit.service.ts      # Immutable audit logging service
│   │   └── workers/                  # Background synchronization queue
│   │       ├── sync.queue.ts         # BullMQ queue definitions and cron schedule
│   │       └── sync.worker.ts        # Worker process consuming sync jobs with rate-limiting
│   └── types/                        # Global TypeScript interfaces and DTOs
└── tests/
    ├── unit/                         # Ranking, achievement parser, and SVG generator tests
    ├── integration/                  # Prisma queries, provider fallback, and sync pipeline tests
    └── e2e/                          # Playwright user journey specs
```

---

## 3. Core Architectural Subsystems

### 3.1. External Ingestion & Provider Boundary
- `LeetCodeProvider` queries the LeetCode GraphQL API (`matchedUser`, `submitStatsGlobal`, `userContestRanking`, `recentAcSubmissionList`).
- Normalizes raw responses into `PlatformProfileSnapshotDTO`.
- Implements circuit breaker: if LeetCode returns HTTP 429 / Cloudflare challenges, worker pauses the queue and logs an alert without corrupting database records.

### 3.2. Deterministic Ranking Engine
- Weighted Score Formula:
  $$\text{Score} = (1 \times \text{Easy}) + (3 \times \text{Medium}) + (6 \times \text{Hard}) + (0.5 \times \text{Contest Rating})$$
- Deterministic Tie-Breaking Order:
  1. `weighted_score DESC`
  2. `hard_solved DESC`
  3. `medium_solved DESC`
  4. `easy_solved DESC`
  5. `created_at ASC` (Earliest registration timestamp)
- Ranks are precalculated post-sync and materialized into indexed columns for sub-20ms queries.

### 3.3. Configurable Achievement Evaluation
- AST Expression Parser safely validates expressions like:
  `total_solved >= 100 AND hard_solved >= 10`
- Whitelisted variables: `total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `contest_rating`, `contests_attended`, `current_streak`, `longest_streak`.
- Unlocked badges are stored with an immutable `unlockedAt` timestamp, ensuring grandfathering on rule modifications.

### 3.4. Gender War Aggregation Service
- Aggregates metrics for `Male` and `Female` groups based strictly on explicitly chosen gender.
- Automatically calculates both raw totals and per-participant normalized averages.
- Handles edge cases: $<5$ participants render `"Low sample size"` badges; unrated contestants are excluded from average rating denominators.

### 3.5. Dynamic SVG Card Generator
- Route Handler `/api/cards/[id]` synthesizes clean vector SVG markup.
- Inlines SVG typography and theme color tokens (GitHub Dark, Modern Light, Cyberpunk, Midnight Navy, Minimalist).
- Serves with `Cache-Control: public, max-age=1800, s-maxage=1800` and CORS `*`.

### 3.6. Security, RBAC & Audit Trail
- Roles: `STUDENT`, `PLATFORM_ADMIN`, `SUPER_ADMIN`.
- Super Admin operations (batch sync, role change, calendar boundaries) require step-up text confirmation (`"CONFIRM"`).
- All admin mutations log structured before/after diffs in an append-only `AuditLog` table.
- Private fields (emails, roll numbers) are strictly excluded from public DTOs.

---

## 4. Testing & Verification Strategy

- **Unit Testing (Vitest)**:
  - Ranking formula calculations and tie-breaking edge cases.
  - Achievement condition AST parser syntax and evaluation.
  - SVG generation and character sanitization (XSS prevention).
- **Integration Testing**:
  - Prisma database queries, constraints, and cascading deletes.
  - LeetCode provider mock network responses and rate-limit backoffs.
  - Duplicate account conflict detection and unlinking workflows.
- **End-to-End Testing (Playwright)**:
  - User registration, LeetCode handle linking, profile card customization, and admin moderation.

---

## 5. Deployment & Production Considerations

- **Containerization**: Dockerfile with multi-stage Next.js standalone build.
- **Worker Process**: Run Next.js web application and BullMQ sync worker as separate containers sharing the PostgreSQL and Redis instances.
- **Database Indexing**: Comprehensive B-Tree composite indexes on `(totalSolved, hardSolved)`, `(collegeRank)`, `(gender, branchId)`.
- **Zero-Downtime Migrations**: Prisma migration scripts managed via CI/CD deployment pipelines.
