# Technical Research & Architectural Decision Records (ADRs)

**Project**: College Coding Platform  
**Roadmap Scope**: R1 through R7  
**Date**: 2026-09-17  
**Status**: Approved / Locked

---

## ADR 1: Web Application Framework & Architecture

- **Decision**: Next.js 14+ (App Router) with TypeScript, React Server Components (RSC), and Tailwind CSS.
- **Rationale**:
  - React Server Components allow server-side rendering (SSR) of leaderboards and profiles with zero client-side JavaScript waterfall for read queries.
  - Server Actions and Next.js Route Handlers provide clean, type-safe API boundaries and collocated backend logic.
  - Tailwind CSS + Radix UI (or Shadcn UI primitives) guarantees accessible, responsive design with sub-second layout paint times.
- **Alternatives Considered**:
  - *Separate Vite SPA + Express/NestJS API*: Introduces CORS overhead, separate build pipelines, and duplicate TypeScript type declarations without substantial benefit at current scale.
  - *Remix / React Router v7*: Strong alternative, but Next.js has broader ecosystem support for Auth.js and deployment targets.

---

## ADR 2: Relational Database & ORM

- **Decision**: PostgreSQL with Prisma ORM.
- **Rationale**:
  - PostgreSQL provides robust ACID compliance, JSONB support for raw external sync snapshots, and advanced indexing (B-Tree, GiST/BRIN for timeseries activity logs).
  - Prisma generates end-to-end type-safe database clients, handles declarative migrations, and prevents SQL injection by default.
  - Database views and indexed computed columns can be utilized for complex rankings.
- **Alternatives Considered**:
  - *Drizzle ORM*: Lightweight with SQL-like syntax, but Prisma's mature migration engine, relation mapping, and team ergonomics provide higher development velocity.
  - *MongoDB / Document DB*: Poor fit for relational leaderboard tie-breaking, foreign key integrity, and audit logging.

---

## ADR 3: Authentication & Authorization Strategy

- **Decision**: Auth.js (NextAuth v5) with Prisma Adapter, Secure Email Magic Links + Verified Password Fallback, and HTTP-only Secure Cookies.
- **Rationale**:
  - Auth.js handles secure session management with standard Next.js middleware and route protection.
  - Email verification is built-in.
  - Role-Based Access Control (RBAC: `STUDENT`, `PLATFORM_ADMIN`, `SUPER_ADMIN`) is baked into the JWT/Session token for zero-roundtrip permission checks in middleware.
- **Alternatives Considered**:
  - *Third-party SaaS Auth (Clerk / Supabase Auth / Auth0)*: Adds monthly per-user costs and external data hosting dependencies that violate institutional data ownership principles.

---

## ADR 4: Background Job Queue & Synchronization Architecture

- **Decision**: BullMQ backed by Redis (or PgBoss for zero-extra-infrastructure deployments) with dedicated worker pool processes.
- **Rationale**:
  - Background worker isolation ensures external LeetCode synchronization never blocks interactive HTTP user requests.
  - BullMQ provides rate limiting, exponential backoff retries, dead-letter queues (DLQ), and job deduplication.
  - LeetCode public GraphQL endpoints are subject to rate limiting; worker concurrency can be capped at 5–10 requests/second with circuit breaker protection.
- **Alternatives Considered**:
  - *In-process `setInterval` / Cron inside Next.js*: Unreliable in serverless environments, lacks persistence during server restarts, and causes concurrency spikes.

---

## ADR 5: Multi-Platform Coding Provider Abstraction

- **Decision**: Define a strongly typed `ICodingPlatformProvider` interface.
- **Rationale**:
  - Encapsulates LeetCode-specific GraphQL queries, data parsing, and error handling behind a common provider contract.
  - Allows seamless addition of future platforms (Codeforces, HackerRank, GitHub, CodeChef) without changing user profile, ranking, or achievement domains.
  - Provider returns normalized DTOs: `ProfileMetadataDTO`, `SolvedCountsDTO`, `ContestRatingDTO`, `RecentSubmissionsDTO`.

---

## ADR 6: Deterministic Ranking & Leaderboard Calculation Engine

- **Decision**: Batch-computed materialization with deterministic tie-breaking and cached Redis sorted sets (or indexed PostgreSQL leaderboard tables).
- **Rationale**:
  - College ranking formula: Weighted Score = $(E \times 1) + (M \times 3) + (H \times 6) + (\text{Contest Rating} \times 0.5)$.
  - Tie-breaking sequence: (1) Weighted Score DESC, (2) Hard Solved DESC, (3) Medium Solved DESC, (4) Easy Solved DESC, (5) Earliest Registration Timestamp ASC.
  - Running ranking queries on-the-fly across thousands of users on every page load would cause database saturation. Precomputing ranks after each sync cycle provides sub-50ms reads.

---

## ADR 7: Achievement Evaluation Architecture

- **Decision**: Event-driven / post-sync Rule Evaluation Pipeline using AST-based condition expression parsing.
- **Rationale**:
  - Condition expressions (e.g. `total_solved >= 100 AND hard_solved >= 10`) are parsed via a lightweight, deterministic boolean expression evaluator (no unsafe `eval()`).
  - Evaluated immediately after a student's sync batch completes.
  - Historical unlocked badges are permanently stored in `UserAchievement` with an immutable `unlocked_at` timestamp (grandfathering rule).

---

## ADR 8: Privacy & Data Hygiene Guardrails

- **Decision**: Strict separation of Private Account Records from Public Profile DTOs via explicit TypeScript serialization mappers.
- **Rationale**:
  - Database schema isolates authentication secrets (`passwordHash`, `verificationTokens`) and private contact details (`email`) from public presentation layers.
  - Prohibited fields (enrollment number, roll number, section) are physically absent from the database schema and migration definitions.
  - Public profile card endpoint sanitizes all text to prevent SVG XML injection.
