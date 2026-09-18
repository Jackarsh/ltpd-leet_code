# College Coding Leaderboard & Developer Community Platform — Product Roadmap

**Version:** 1.0.0
**Date:** 2026-09-17
**Status:** Draft

---

## Purpose

This roadmap decomposes the college coding leaderboard and developer community platform into a small number of independently deliverable, independently testable product slices. It is a shallow product decomposition — not a technical architecture or implementation plan. Framework selection, database decisions, API choices, and library picks are explicitly deferred to per-slice implementation plans.

---

## Guiding Constraints

- Any valid email address is accepted for registration; college-email-only gating is **out of scope**.
- Gender has exactly **two selectable values**: Male and Female. No inference, derivation, or additional categories.
- The platform must **never** collect enrollment number, roll number, or section.
- The following features are **permanently out of scope**: Question of the Week, First Blood, Batch Wars.
- LeetCode is the only integrated coding platform in the initial build. The architecture must not preclude future additions.
- A user's email address must **never** appear on public profiles or public search results.

---

## Roadmap Slices

### R1 — Identity, Authentication & Profile

**ID:** R1
**Intent:**
Establish the trust boundary for the platform. Allow any student to register with a valid email, complete required onboarding fields, optionally provide academic context, and manage their own profile. This slice defines what a "user" is and what data the system owns about them.

**Scope:**
- User registration with email and password
- Email verification flow (confirm address before full access)
- Login and logout
- Password reset
- Required onboarding fields: name, email, LeetCode username, gender (Male / Female selector)
- Optional profile fields: admission year, graduation year, branch
- Profile editing (own profile)
- Public profile visibility rules (email is never exposed publicly)
- Basic profile page (no coding stats yet)
- Session management and authentication state

**Explicitly Out of Scope for R1:**
- LeetCode username validation or synchronization
- Any display of coding statistics
- Leaderboard or ranking
- Gender War
- Achievements
- GitHub card
- Admin dashboard

**Dependencies:**
- None. This is the foundational slice; all other slices depend on it.

**Can be developed independently after delivery:**
- R1 is a prerequisite for all other slices but has no dependencies itself.

---

### R2 — LeetCode Integration & Coding Data

**ID:** R2
**Intent:**
Connect a verified user account to LeetCode, validate that the LeetCode username exists, and synchronize coding statistics reliably on a schedule. This slice owns all raw coding data and is the exclusive source of truth for statistics used everywhere else on the platform.

**Scope:**
- LeetCode username connection from the user's own profile
- Validation that the provided LeetCode username resolves to a real, public account
- Scheduled background synchronization of:
  - Total problems solved (by difficulty: Easy, Medium, Hard)
  - Acceptance rate
  - Contest participation count
  - Contest rating and peak rating
  - Global LeetCode rank
  - Submission activity data (for heatmap)
  - Recent submissions (for activity feed)
- Synchronization status display to the user (last synced, pending, error)
- Stale-data handling: surface age of data to user when sync has not run recently
- Error-state handling: failed sync must not destroy existing valid data; fallback to last known good state
- Rate-limit resilience: sync must not fail catastrophically when LeetCode is unavailable or throttling
- Deleted/renamed account handling: flag account for review rather than destroying data

**Explicitly Out of Scope for R2:**
- Leaderboard UI
- Gender War UI
- Achievement evaluation (data is available; evaluation belongs to R4)
- GitHub card generation
- Admin synchronization controls (belongs to R7)
- Any coding platform other than LeetCode

**Dependencies:**
- R1 (user identity and authenticated profile must exist)

**Can be developed independently after delivery:**
- R3, R4, R5 all consume data produced by R2 and can proceed once R2 is stable.

---

### R3 — College Leaderboard & Discovery

**ID:** R3
**Intent:**
Give students a ranked, searchable, filterable view of the entire college coding community based on LeetCode statistics. Ranking must be transparent: users must be able to see exactly which statistics contribute to their college rank and how.

**Scope:**
- College-wide leaderboard listing all opted-in users
- Ranking calculation with an explicit, documented formula
  - Formula inputs and weights must be visible to all users
  - College rank is distinct from LeetCode global rank (both may be shown)
- Sorting by: total problems, difficulty breakdown, contest rating, college rank
- Filtering by: branch, admission year, graduation year
- Search by: name, LeetCode username (email is never searchable publicly)
- Top performer highlight cards (e.g., top N positions)
- Pagination or infinite scroll for the full list
- Rank badge on a user's public profile ("College Rank #N")
- Distinction between "has no data yet" and "ranked last"

**Explicitly Out of Scope for R3:**
- Gender War aggregate competition (belongs to R5)
- GitHub card generation (belongs to R6)
- Admin configuration of ranking formula (belongs to R7)
- Any platform other than LeetCode driving the rank

**Dependencies:**
- R1 (users must exist)
- R2 (coding statistics must be synchronized)

**Can be developed independently after delivery:**
- R5 reuses the grouping and ranking mechanics established here.
- R4 is largely independent of R3 and can proceed in parallel after R2.

---

### R4 — Student Profiles, Activity & Achievements

**ID:** R4
**Intent:**
Give every student a rich, individually navigable coding profile that surfaces their statistics in detail, visualizes activity over time, shows recent submissions, and awards configurable badges when defined criteria are met.

**Scope:**
- Detailed public student profile page (accessible by username or profile URL)
- Difficulty breakdown display: Easy / Medium / Hard solved counts and percentages
- Contest statistics presentation: rating, peak rating, contest count, badge tier if applicable
- Submission activity heatmap (calendar-style, driven by R2 activity data)
- Recent activity feed (last N submissions with problem name, difficulty, verdict, timestamp)
- Achievement/badge framework:
  - Configurable achievement definitions (criteria defined by administrators in R7)
  - Automatic evaluation of achievements against live statistics after each sync
  - Achievement display on profile (earned badges with name and description)
  - Progress toward unearned achievements (optional display)
- Own-profile view vs. public-profile view (private fields hidden publicly)

**Explicitly Out of Scope for R4:**
- Gender War (belongs to R5)
- GitHub card generation (belongs to R6)
- Admin interface for defining achievements (belongs to R7, though it must be possible by the time R4 is live)

**Dependencies:**
- R1 (user identity)
- R2 (coding and activity data)
- R7 (achievement definitions must be configurable; R4 and R7 can be delivered in parallel if a seed set of default achievements is hard-coded initially)

**Can be developed independently after delivery:**
- R4 and R3 are independently useful and can be delivered in either order after R2 is complete.

---

### R5 — Gender War

**ID:** R5
**Intent:**
Provide a transparent, normalized aggregate comparison between the Male and Female groups as defined by each user's explicitly selected gender at registration. The comparison must account for unequal group sizes and must never infer gender from any source other than the user's own selection.

**Scope:**
- Male group and Female group defined exclusively by the user-selected gender field (no inference)
- Aggregate metrics per group (all normalized to account for group size differences):
  - Average problems solved (total and by difficulty)
  - Average contest rating
  - Participation rate (percentage of group members with at least one solved problem)
  - Average acceptance rate
- Time-period comparisons (e.g., this month vs. last month per group)
- Aggregate charts visualizing the comparison
- Individual Male leaderboard (ranked list within the Male group)
- Individual Female leaderboard (ranked list within the Female group)
- Transparent scoring methodology page: explains exactly which metrics are used and how group size normalization works
- Display of raw participant counts alongside normalized metrics (never conflate the two)

**Explicitly Out of Scope for R5:**
- Any gender inference, derivation, or additional gender categories
- Any competition format other than Male vs. Female aggregate
- Batch Wars, Question of the Week, or First Blood (permanently out of scope)

**Dependencies:**
- R1 (gender is set at registration)
- R2 (aggregate statistics sourced from LeetCode sync data)
- R3 (individual leaderboards within each group share ranking mechanics)

**Can be developed independently after delivery:**
- R5 is self-contained after its dependencies are met. It does not block R4, R6, or R7.

---

### R6 — GitHub Developer Card

**ID:** R6
**Intent:**
Let students generate a shareable, visually styled developer card that summarizes their coding statistics and can be embedded in a GitHub profile README or shared as a standalone URL.

**Scope:**
- Shareable card page at a stable public URL per user
- Card content: name, college rank, LeetCode stats summary (total solved, difficulty breakdown, contest rating)
- Configurable card themes (at least two distinct visual styles)
- Markdown snippet for embedding in a GitHub profile README (`![card](url)`)
- Card content refreshes automatically when underlying statistics change (driven by R2 sync)
- No authentication required to view a card at its public URL

**Explicitly Out of Scope for R6:**
- General social networking functionality
- Cards for platforms other than LeetCode in the initial build
- Card for users who have not yet completed LeetCode synchronization (show a "stats not yet available" placeholder)

**Dependencies:**
- R1 (user identity and profile)
- R2 (coding statistics to display)
- R3 (college rank to display)

**Can be developed independently after delivery:**
- R6 is a self-contained consumer slice. It can be delivered at any point after R1, R2, and R3 are stable.

---

### R7 — Administration & Operations

**ID:** R7
**Intent:**
Give authorized administrators visibility into platform health and control over user management, achievement configuration, synchronization operations, and platform-wide settings — without exposing administrative capabilities to regular users.

**Scope:**
- Administrative role distinct from regular user role
- Admin dashboard overview (user count, sync health, recent errors)
- User management: view all users, deactivate accounts, flag suspected duplicates or fraud
- Achievement configuration: create, edit, enable/disable achievement definitions (criteria + display metadata)
- Platform configuration: synchronization schedule, leaderboard formula weights, ranking parameters
- Synchronization monitoring: per-user sync status, last sync timestamp, error log
- Manual synchronization trigger: force a sync for a specific user or all users
- Error visibility: surface failed syncs with reason and affected user
- Operational metrics: problems solved trend, registration rate, active users

**Explicitly Out of Scope for R7:**
- College management unrelated to this platform (e.g., attendance, grades, timetables)
- Public-facing admin pages

**Dependencies:**
- R1 (admin is a user role)
- R2 (sync monitoring requires sync infrastructure)
- R4 (achievement configuration is consumed by R4's evaluation engine)

**Can be developed independently after delivery:**
- R7 is largely independent of R3, R5, and R6 and can be developed in parallel with those slices.

---

### R8 — Future Integration Architecture

**ID:** R8
**Intent:**
Ensure the platform's user and profile data model can accommodate additional coding platforms (e.g., Codeforces, CodeChef, AtCoder, HackerRank, GitHub contributions) as first-class integrations without requiring a redesign of the core user model or leaderboard engine.

**Scope:**
- Audit of the data model introduced in R1–R7 against multi-platform requirements
- Definition of a platform-agnostic coding profile abstraction:
  - A user may have zero or more platform connections
  - Each platform connection has: platform identifier, external username, sync status, last synced timestamp, raw stats blob
- Extension points documented for adding a new platform provider:
  - How to register a new provider
  - How sync is triggered for a new provider
  - How stats from a new provider contribute to (or are kept separate from) the college rank
- Safe provider-specific synchronization isolation: a failure in one provider's sync must not affect another provider's data
- No additional coding platforms are implemented during the initial build

**Explicitly Out of Scope for R8:**
- Implementing Codeforces, CodeChef, AtCoder, HackerRank, or GitHub stat integration
- Changing the college ranking formula to incorporate non-LeetCode data

**Dependencies:**
- R1 through R7 (architecture review is most useful once the initial build is complete or near-complete)

**Can be developed independently after delivery:**
- R8 is a preparatory architecture slice; it can run in parallel with late R7 work or immediately after initial launch.

---

## Dependency Order Summary

```
R1  (no dependencies)
 └─> R2  (depends on R1)
      ├─> R3  (depends on R1, R2)
      │    └─> R5  (depends on R1, R2, R3)
      │    └─> R6  (depends on R1, R2, R3)
      ├─> R4  (depends on R1, R2; achievement display needs R7 config)
      └─> R7  (depends on R1, R2; achievement config feeds R4)
R8  (depends on R1–R7; architecture review after initial build)
```

**Suggested delivery order:**

| Wave | Slices | Rationale |
|------|--------|-----------|
| 1 | R1 | Foundation; unblocks everything |
| 2 | R2 | Data pipeline; unblocks all consumer slices |
| 3 | R3, R4, R7 | Can proceed in parallel; all consume R2 |
| 4 | R5, R6 | Depend on R3; R5 and R6 are independent of each other |
| 5 | R8 | Architecture review and extension-point definition after initial launch |

---

## What Is Not In This Roadmap

The following are confirmed out of scope and will not appear in any roadmap slice:

| Feature | Status |
|---------|--------|
| Question of the Week | Permanently out of scope |
| First Blood | Permanently out of scope |
| Batch Wars | Permanently out of scope |
| Enrollment/roll-number collection or verification | Permanently out of scope |
| College-email-only registration | Permanently out of scope |
| Section management | Permanently out of scope |
| Gender inference or additional gender categories | Permanently out of scope |
| Non-LeetCode platform integrations (initial build) | Deferred to post-R8 |

---

## Roadmap Governance

- This roadmap is a product decomposition, not a technical specification.
- Each slice (R1–R8) will receive its own feature specification (`/speckit-specify`) before implementation begins.
- Implementation plans, framework selections, and architectural decisions belong in per-slice implementation plans, not here.
- When requirements change, update the affected slice's specification first, then reconcile this roadmap if scope boundaries are affected.
- New features must be added as new roadmap slices or explicit scope expansions to existing slices — never silently introduced.
