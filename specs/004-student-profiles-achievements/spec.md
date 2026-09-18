# Feature Specification: Student Coding Profiles, Activity & Configurable Achievements

**Feature Branch**: `004-student-profiles-achievements`

**Created**: 2026-09-17

**Status**: Draft

**Roadmap Entry**: R4 — Student Profiles, Activity & Achievements
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## Clarifications

### Session 2026-09-17

- Q: Should the activity heatmap count all submissions or only accepted submissions? → A: Accepted submissions only — consistent with the streak definition; only successful solves count.
- Q: What should the public profile URL be based on? → A: LeetCode username (e.g., `/profile/leetcode-handle`). When a student changes their LeetCode username, the old URL becomes invalid and the new URL is based on the new username.
- Q: Should achievement unlock rules support time-based or streak-based conditions? → A: Both cumulative count-based conditions (e.g., total solved ≥ N) and streak/time-based conditions (e.g., current streak ≥ N days, longest streak ≥ N days).
- Q: Should the GitHub-style shareable profile card be part of R4 or a separate slice? → A: Separate slice — the shareable profile card is explicitly out of scope for R4.
- Q: When all achievement definitions are deleted, what happens to earned records? → A: Preserve as legacy badges — shown on the profile with name, earned date, and a "legacy" indicator; no live definition link required.

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — View a Student's Public Coding Profile (Priority: P1)

Any visitor can navigate to a student's public profile page and see their coding
identity, academic context, college rank, and a summary of their statistics.

**Why this priority**: The public profile is the student's primary presence on the
platform. It is the destination for leaderboard row clicks, search results, and
recognition card clicks. All downstream profile features (heatmap, feed, achievements)
live here.

**Independent Test**: Testable by visiting a student's public profile as a guest and
confirming all permitted fields are present and all prohibited fields are absent.

**Acceptance Scenarios**:

1. **Given** any visitor navigating to a student's public profile URL, **When** the
   page loads, **Then** the following are displayed where available: name, avatar,
   LeetCode username (as a clickable link to the student's LeetCode profile), LeetCode
   global rank, gender, branch (if provided), batch (if derivable), college rank,
   coding statistics, contest statistics, activity heatmap, recent activity feed, and
   earned achievements.

2. **Given** any visitor on a public profile page, **When** the page renders, **Then**
   the following are never displayed: email address, authentication information,
   enrollment number, roll number, or section.

3. **Given** a student whose LeetCode synchronization has not yet completed, **When**
   their profile is viewed, **Then** statistics sections show "Not yet available" or
   equivalent placeholders — not zeros.

4. **Given** a student whose data is stale (last successful sync exceeded the staleness
   threshold), **When** their profile is viewed, **Then** a visible stale-data
   indicator is shown alongside the last-synced timestamp.

5. **Given** a student with no optional academic fields (no batch, no branch), **When**
   their profile is viewed, **Then** those fields are simply absent — not shown as
   "N/A" or "Unknown".

---

### User Story 2 — View Coding Statistics and Difficulty Breakdown (Priority: P1)

A visitor viewing a student's profile can see a clear summary of total problems solved,
broken down by difficulty, including percentage shares.

**Why this priority**: The difficulty breakdown is the most informative coding metric
on the profile — it shows depth, not just quantity. This is a core building block for
all downstream comparisons (leaderboard, Gender War).

**Independent Test**: Testable by comparing displayed values against synchronized
statistics and independently computing the percentages.

**Acceptance Scenarios**:

1. **Given** a student with a successful synchronization, **When** their profile is
   viewed, **Then** the coding statistics section displays: total problems solved, easy
   solved, medium solved, and hard solved as absolute counts.

2. **Given** the coding statistics section, **When** rendered, **Then** difficulty
   percentages are also displayed: easy percentage, medium percentage, and hard
   percentage — each computed as (count for that difficulty ÷ total solved) × 100,
   rounded to one decimal place.

3. **Given** a student who has solved zero total problems, **When** their profile is
   viewed and a synchronization has confirmed the zero, **Then** all counts display
   as zero and percentages are shown as "—" or "0%" — not as a division error.

4. **Given** a student's coding statistics, **When** any visitor attempts to find an
   editable input for these values, **Then** no such input exists anywhere on the
   public or private profile view.

---

### User Story 3 — View Contest Statistics (Priority: P1)

A visitor can see a student's contest participation record, including current rating,
highest rating, and contests attended.

**Why this priority**: Contest performance is a key differentiator between students
with similar problem counts, and it is a required input for the leaderboard ranking.

**Independent Test**: Testable by comparing displayed contest values against synced
values, and by viewing a profile with no contest participation.

**Acceptance Scenarios**:

1. **Given** a student who has participated in at least one LeetCode contest, **When**
   their profile is viewed, **Then** the contest section displays: current rating,
   highest (all-time peak) rating, and total contests attended.

2. **Given** a student who has not participated in any contest, **When** their profile
   is viewed, **Then** the contest section shows "No contest participation yet" or
   equivalent — current rating and highest rating are shown as "—", not as zero.

3. **Given** a student whose contest rating has decreased since their last highest
   rating, **When** their profile is viewed, **Then** both current rating and highest
   rating are shown — the highest rating retains the historical peak, not the current
   value.

---

### User Story 4 — View the Activity Heatmap (Priority: P2)

A visitor can see a visual calendar of the student's LeetCode activity over the past
12 months, along with summary activity metrics.

**Why this priority**: The heatmap is the most engaging and shareable element of the
profile. It communicates consistency and effort over time in a single glance.

**Independent Test**: Testable by confirming that daily cell values match stored
activity counts for each calendar date, and that all six summary metrics are computed
correctly.

**Acceptance Scenarios**:

1. **Given** a student with at least some recorded LeetCode activity, **When** their
   profile is viewed, **Then** a 12-month calendar heatmap is displayed with each
   calendar day shaded proportionally to the number of submissions made on that day.

2. **Given** the heatmap, **When** a visitor hovers over or taps a specific day,
   **Then** the date and submission count for that day are displayed.

3. **Given** the activity summary section below or adjacent to the heatmap, **When**
   rendered, **Then** the following six metrics are displayed:
   - **Daily activity count**: submissions on the most recently active day
   - **Active-day count**: number of calendar days within the 12-month window with
     at least one submission
   - **Current streak**: consecutive calendar days up to today with at least one
     accepted submission
   - **Longest streak**: the longest such consecutive run within the 12-month window
   - **Total activity**: total submissions within the 12-month window
   - **Average activity on active days**: total submissions ÷ active-day count,
     rounded to one decimal place

4. **Given** a student who has no recorded activity in the 12-month window, **When**
   their profile is viewed, **Then** the heatmap shows an empty calendar (all days
   unshaded) and all six activity metrics show zero or "—" as appropriate.

5. **Given** a student whose historical activity data was only partially available
   from LeetCode (e.g., only the past 3 months were retrievable), **When** the heatmap
   is displayed, **Then** available data fills the corresponding days and unavailable
   days are shown as empty (not fabricated). A note indicates that data for the full
   period may not be available.

---

### User Story 5 — View the Recent Activity Feed (Priority: P2)

A visitor can see a chronological list of the student's recent verified coding events,
drawn from synchronized platform data.

**Why this priority**: The activity feed makes a student's profile feel alive and
gives context beyond raw statistics — it tells the story of recent engagement.

**Independent Test**: Testable by confirming each feed item maps to a verifiable
underlying sync event, and that prohibited event types do not appear.

**Acceptance Scenarios**:

1. **Given** a student with recent LeetCode activity, **When** their profile is viewed,
   **Then** a recent activity feed is displayed, listing events in reverse
   chronological order (most recent first).

2. **Given** the recent activity feed, **When** rendered, **Then** feed items may
   include any of the following event types where data is available:
   - Solved a problem (problem name, difficulty, timestamp)
   - Solved a Hard problem (highlighted variant)
   - Earned an achievement (achievement name, earned date)
   - Reached a coding milestone (e.g., total-solved threshold crossed)
   - Reached a contest-related milestone (e.g., contest rating threshold crossed)
   - Other verified coding activity sourced from synchronized data

3. **Given** the recent activity feed, **When** rendered, **Then** the feed MUST NOT
   contain any entries for Question of the Week events or First Blood events.

4. **Given** a student with no recent activity, **When** their profile is viewed,
   **Then** the feed displays an empty state (e.g., "No recent activity") — not a
   blank space or an error.

5. **Given** each feed item, **When** a visitor views it, **Then** the item includes a
   timestamp or date indicator showing when the event occurred.

---

### User Story 6 — View Earned Achievements (Priority: P2)

A visitor can see which achievements a student has earned, along with the date each
was earned.

**Why this priority**: Achievements are the primary gamification surface of the
platform. Displaying them on the profile creates motivation and recognition.

**Independent Test**: Testable by confirming all displayed achievements have a
corresponding earned-date record, and that unlocked achievements match the conditions
stored in the achievement framework.

**Acceptance Scenarios**:

1. **Given** a student who has earned at least one achievement, **When** their profile
   is viewed, **Then** each earned achievement is displayed with: name, icon,
   description, and the date it was earned.

2. **Given** a student who has earned zero achievements, **When** their profile is
   viewed, **Then** the achievements section shows an appropriate empty state (e.g.,
   "No achievements yet") — not a blank space.

3. **Given** earned achievements displayed on a profile, **When** a visitor views
   them, **Then** achievements are verifiably linked to the student's synchronized
   statistics — no achievement appears that the student's current or historical
   verified data does not support having earned.

---

### User Story 7 — View Locked Achievements (Priority: P3)

A student viewing their own profile can optionally see achievements they have not yet
earned, giving them visibility into what is achievable.

**Why this priority**: Locked achievement visibility drives engagement by showing
students what to work toward — but it is only relevant to the student themselves, not
to all visitors.

**Independent Test**: Testable by confirming locked achievements are visible to the
account owner but not shown to other visitors.

**Acceptance Scenarios**:

1. **Given** a logged-in student viewing their own profile, **When** the achievements
   section is rendered, **Then** they may see locked/unearned achievements clearly
   distinguished from earned ones (e.g., greyed out, with a lock icon), along with
   a description of the unlock condition.

2. **Given** a visitor viewing another student's public profile, **When** the
   achievements section is rendered, **Then** only earned achievements are shown —
   locked achievements are not exposed to other visitors.

3. **Given** a locked achievement displayed to the profile owner, **When** rendered,
   **Then** it shows: name, icon, description, and the unlock condition in a
   user-readable form — but not the underlying numerical threshold (the threshold
   is internal to the system).

---

### User Story 8 — Achievement Awarded When Condition Is Met (Priority: P1)

The system automatically evaluates achievement conditions after each synchronization
and awards achievements to students whose statistics meet the defined criteria.

**Why this priority**: Achievements must be granted by the system based on verified
data — never by user claim. This is a constitutional data-integrity requirement.

**Independent Test**: Testable by setting up an achievement definition with a known
threshold, providing a student whose synced stats cross that threshold, and confirming
the achievement is awarded after the next sync.

**Acceptance Scenarios**:

1. **Given** a student whose synchronized statistics newly satisfy an achievement's
   unlock condition after a sync, **When** the achievement evaluation runs, **Then**
   the achievement is awarded to the student with the earned date set to the date of
   the sync that confirmed the condition.

2. **Given** a student who already earned an achievement, **When** a subsequent sync
   runs, **Then** the achievement is not re-awarded and the original earned date is
   preserved.

3. **Given** a newly defined achievement (added by an administrator), **When** the
   next evaluation runs, **Then** any student whose existing synchronized statistics
   already satisfy the condition is awarded the achievement retroactively, with
   the earned date set to the evaluation date.

4. **Given** an achievement whose condition depends on a statistic not yet available
   for a student (e.g., no sync data yet), **When** evaluation runs, **Then** the
   achievement is neither awarded nor blocked — it remains in an unevaluated state
   for that student until the required data is available.

---

### User Story 9 — Statistics Decrease After Synchronization (Priority: P2)

When a synchronization returns lower statistics than a student previously had
(due to a suspicious sync result that passes review), previously earned achievements
are handled according to defined rules.

**Why this priority**: LeetCode can reset, delete, or revise user stats in rare
cases. The platform must define what happens to achievements when the underlying
condition is no longer met.

**Independent Test**: Testable by simulating a confirmed stat decrease and verifying
the achievement handling behaviour is as specified.

**Acceptance Scenarios**:

1. **Given** a student who earned an achievement based on a statistic threshold,
   **When** a subsequent confirmed synchronization shows the statistic has fallen
   below that threshold (a rare but valid scenario after suspicious-sync resolution),
   **Then** the achievement is marked as "revoked" or "no longer valid" rather than
   silently removed or retained. The revocation is visible on the student's profile.

2. **Given** a revoked achievement, **When** a later sync confirms the statistic
   has risen again above the threshold, **Then** the achievement is re-awarded with
   the new earned date.

3. **Given** a suspicious sync result (not yet confirmed), **When** evaluation runs
   while the suspicious flag is unresolved, **Then** no achievement is revoked until
   the suspicious result is resolved (either confirmed or dismissed).

---

### User Story 10 — LeetCode Account Change and Achievement History (Priority: P2)

When a student changes their connected LeetCode username, the system defines what
happens to their existing achievements and activity history.

**Why this priority**: A username change is a high-impact event — the student's entire
coding history is rebuilt. Achievement history must not be transferred from the old
username to the new one without verification.

**Independent Test**: Testable by changing a LeetCode username and confirming that
old achievements are cleared, and that new achievements are only awarded after the
new account's data is synced and conditions are confirmed.

**Acceptance Scenarios**:

1. **Given** a student who changes their LeetCode username, **When** the change is
   saved, **Then** all previously earned achievements are cleared and all historical
   activity data is cleared simultaneously with the old statistics (as defined in R2).

2. **Given** a student who has cleared achievements due to a username change, **When**
   the first successful synchronization of the new username completes, **Then**
   achievement evaluation runs against the new account's data and achievements are
   re-awarded only where the new account's statistics support them.

3. **Given** a student between the username change and the first successful sync
   of the new username, **When** their profile is viewed, **Then** the achievements
   section shows "Achievements pending sync" or equivalent — not the old achievements
   and not an empty error state.

---

### User Story 11 — Historical Activity Unavailable (Priority: P2)

When the external source did not provide full 12-month activity history, the heatmap
and activity metrics reflect only what is available, without fabrication.

**Why this priority**: The platform must never display fabricated data. A partial
heatmap is honest; a filled-in estimate would violate data integrity principles.

**Independent Test**: Testable by providing a student whose sync only returned
partial historical data and confirming only those dates are populated on the heatmap.

**Acceptance Scenarios**:

1. **Given** a student whose LeetCode sync returned activity data for only part of
   the 12-month window, **When** the heatmap is displayed, **Then** only the dates
   with available data are shaded. Dates outside the available window are shown as
   empty.

2. **Given** the activity summary metrics for a student with partial history,
   **When** displayed, **Then** metrics such as "longest streak" and "active-day count"
   are computed only from available data and the available-data window is noted.

3. **Given** a student whose activity history is entirely unavailable (no history
   returned by any sync), **When** the heatmap is displayed, **Then** an empty heatmap
   is shown with a note that activity data is not yet available — not a fabricated
   blank grid without explanation.

---

### User Story 12 — Stale Data on the Profile (Priority: P2)

When the time since the last successful sync exceeds the staleness threshold, the
profile clearly communicates that displayed statistics may not reflect the student's
most recent LeetCode activity.

**Why this priority**: A student or visitor relying on stale data to make comparisons
or academic decisions deserves a clear signal that the data may be outdated.

**Independent Test**: Testable by advancing the mock clock past the staleness
threshold and confirming the stale indicator appears on the profile.

**Acceptance Scenarios**:

1. **Given** a student whose last successful sync is older than the staleness
   threshold, **When** their profile is viewed, **Then** a stale-data indicator is
   shown — visible, not hidden in a tooltip — alongside the last-synced timestamp.

2. **Given** a profile with stale data, **When** achievement evaluation runs,
   **Then** no new achievements are awarded based on stale data. Evaluation is
   deferred until fresh sync data is available.

3. **Given** a student whose data was stale but whose sync has now completed
   successfully, **When** their profile reloads, **Then** the stale indicator is
   removed and the updated statistics and timestamp are displayed.

---

### Edge Cases

- **Zero total problems solved after confirmed sync**: All percentage fields show
  zero or "—" to avoid division-by-zero. The profile shows "0 problems solved" only
  after a sync has confirmed this, not for pending-sync students.

- **Current streak spanning the sync boundary**: If a student's last activity was
  yesterday and a sync has not yet run today, the streak is computed from the last
  available activity date. A day's passing without activity resets the streak only
  after a sync confirms the absence.

- **Longest streak longer than the 12-month window**: Longest streak is capped at
  what is computable from available data. If 12-month data confirms a 365-day streak,
  that is reported. Data outside the window is not extrapolated.

- **Achievement unlock condition spans multiple statistics**: An achievement whose
  condition requires e.g., "total ≥ N AND hard ≥ M" is evaluated atomically; partial
  satisfaction does not trigger a partial award.

- **Achievement definition disabled after award**: If an administrator disables an
  achievement definition (R7), students who already earned it retain the earned badge.
  No new awards are made from disabled definitions. The badge may be visually marked
  as "legacy" if the definition is hidden.

- **Achievement definition deleted after award**: When an administrator deletes an
  achievement definition, all earned records for it are preserved and transition to
  Legacy status. Each is shown on the profile with name, icon (if still renderable),
  earned date, and a "legacy" indicator. Legacy badges are never re-evaluated,
  re-revoked, or re-awarded. A username change clears legacy badges alongside all
  other achievement records.

- **Profile URL change on LeetCode username update**: When a student changes their
  LeetCode username, their public profile URL changes from `/profile/{old-username}`
  to `/profile/{new-username}`. The old URL returns a "profile not found" page.
  Any external links bookmarked to the old URL will break. This is an accepted
  consequence of the URL-based-on-LeetCode-username decision.

- **Two students with the same LeetCode username**: Prevented by R2 (Conflict Record).
  Only one platform account may hold a given LeetCode username at a time, so only
  one valid profile URL of that form can exist at any moment.

- **Two achievements with equivalent conditions**: Both are independently evaluated
  and awarded. Having earned one does not block the other.

- **Student's profile with no avatar uploaded**: The initials-based avatar (defined
  in R1) is displayed on the profile, consistent with all other surfaces.

- **LeetCode profile link for a renamed or deleted username**: If the student's stored
  LeetCode username no longer resolves on LeetCode (account deleted, renamed, or made
  private), the LeetCode profile link is shown but may lead to a 404 on LeetCode. The
  platform displays the last stored username with a "may be unavailable" indicator.

- **Activity count of zero for a specific day vs. missing data**: A day with zero
  accepted submissions (confirmed by sync) and a day with no data (sync did not cover
  that day) must be visually distinguishable on the heatmap. A rejected-only submission
  day (all attempts failed) is treated identically to a zero-accepted-submissions day.

- **Recent activity feed item referencing a problem that no longer exists on LeetCode**:
  The feed item retains the problem name as stored at sync time. The problem URL may
  be broken; the item is still shown without the URL if it cannot be confirmed.

- **Award date precision**: Achievement earned dates are stored to calendar-day
  precision, not sub-second. If two achievements are earned in the same sync, both
  share the same earned date.

- **Heatmap timezone edge case**: A submission recorded at 23:59 in one timezone and
  00:01 in another is attributed to a single calendar day based on the platform's
  configured reference timezone. This is consistent with the streak definition.

- **Profile of a deactivated student**: If a student's account is deactivated by an
  administrator, their public profile URL returns an appropriate "account not available"
  page — not a 404 and not a profile with data intact.

---

## Requirements *(mandatory)*

### Functional Requirements

**Public Profile Layout and Privacy**

- **FR-301**: The system MUST provide a public profile page for each registered
  student, accessible by a stable public URL.

- **FR-301a**: The public profile URL MUST be of the form `/profile/{leetcode-username}`,
  where `{leetcode-username}` is the student's currently stored LeetCode username. When
  a student changes their LeetCode username, the old profile URL becomes invalid and the
  new URL is derived from the new username. No redirect from the old URL is guaranteed.

- **FR-301b**: The shareable GitHub-style profile card is explicitly out of scope for
  this feature. It is a separate product slice and MUST NOT be included in R4.

- **FR-302**: The public profile MUST display, where data is available: name, avatar,
  LeetCode username (linked to the student's LeetCode profile), LeetCode global rank,
  gender, branch (if provided), batch (if derivable from academic years), college rank,
  coding statistics, contest statistics, activity heatmap, recent activity feed, and
  earned achievements.

- **FR-303**: The public profile MUST NEVER display: email address, authentication
  information, password, enrollment number, roll number, or section.

- **FR-304**: Optional academic fields (branch, batch) MUST be absent from the profile
  when the student has not provided them — not shown as "N/A" or any placeholder.

- **FR-305**: If a student's account is deactivated, their public profile URL MUST
  display an "account not available" page rather than the student's data.

- **FR-306**: The LeetCode username displayed on the profile MUST be a clickable link
  to the student's LeetCode profile page. If the username is known to be unresolvable,
  a "may be unavailable" indicator is shown alongside the link.

**Coding Statistics**

- **FR-307**: The coding statistics section MUST display: total problems solved, easy
  problems solved, medium problems solved, and hard problems solved as absolute counts.

- **FR-308**: The coding statistics section MUST also display difficulty percentages:
  easy percentage = (easy solved ÷ total solved) × 100, medium percentage, and hard
  percentage — each rounded to one decimal place. If total solved is zero, percentages
  MUST display as "—" or "0%", not as a division error.

- **FR-309**: Coding statistics MUST be sourced exclusively from verified synchronization
  data. No user-editable field for any statistic MUST exist on any profile view.

- **FR-310**: For a student with a pending or failed sync, all statistics MUST display
  as "Not yet available" or "—" rather than as zero.

**Contest Statistics**

- **FR-311**: The contest section MUST display, when available from synchronization:
  current contest rating, highest (all-time peak) contest rating, and total contests
  attended.

- **FR-312**: For a student with no contest participation, the contest section MUST
  display "No contest participation yet" or equivalent. Current and highest rating
  MUST show "—", not zero.

- **FR-313**: The highest contest rating MUST retain the historical peak value. If a
  student's current rating is lower than their historical peak, both values are shown
  independently — the highest rating is never overwritten by a lower current rating.

**Activity Heatmap**

- **FR-314**: The profile MUST display a 12-month coding activity heatmap showing each
  calendar day in the past 12 months. Days are shaded in proportion to the count of
  **accepted submissions** made on that day. Only accepted submissions are counted;
  rejected or non-accepted submissions do not contribute to heatmap cell values.

- **FR-315**: The heatmap MUST support a hover or tap interaction that displays the
  date and submission count for the selected day.

- **FR-316**: Days for which no activity data has been synchronized MUST be visually
  distinct from days confirmed to have zero accepted submissions. Unavailable data
  must not be displayed as zero activity.

- **FR-317**: The activity summary section MUST display the following six metrics
  computed from available synchronized data. All metrics use **accepted submissions
  only** — consistent with the heatmap and streak definitions:
  1. **Daily activity count**: accepted submission count on the most recently active
     calendar day within the 12-month window
  2. **Active-day count**: number of calendar days within the 12-month window with ≥ 1
     accepted submission
  3. **Current streak**: consecutive calendar days up to today with ≥ 1 accepted
     submission (resets to zero if any day passes with no accepted submission)
  4. **Longest streak**: longest consecutive run of days with ≥ 1 accepted submission
     within the available data window
  5. **Total activity**: total accepted submissions within the 12-month window
  6. **Average activity on active days**: total accepted submissions ÷ active-day count,
     rounded to one decimal place; shown as "—" if active-day count is zero

- **FR-318**: If only partial historical data is available, the heatmap and metrics
  MUST be computed from available data only, with a visible note stating the data
  coverage window. No activity is fabricated for unavailable periods.

**Recent Activity Feed**

- **FR-319**: The profile MUST display a recent activity feed in reverse chronological
  order (most recent event first).

- **FR-320**: The feed MUST include only events sourced from verified synchronization
  data or verified platform events. User-submitted claims MUST NOT appear in the feed.

- **FR-321**: The following event types MUST be supported in the feed where the
  underlying data is available:
  - Solved a problem (an accepted submission; includes problem name, difficulty,
    timestamp — only accepted solutions appear in the feed)
  - Solved a Hard problem (distinguished variant of the above, for accepted Hard
    submissions specifically)
  - Earned an achievement (achievement name and earned date)
  - Reached a coding milestone (e.g., total-solved count crossed a defined level)
  - Reached a contest-related milestone (e.g., contest rating crossed a defined level)
  - Other verified coding activity sourced from synchronization data

- **FR-322**: The feed MUST NOT include any entry for Question of the Week events or
  First Blood events under any circumstance.

- **FR-323**: Each feed item MUST display a date or timestamp indicator.

- **FR-324**: If the student has no recent activity, the feed MUST display an empty
  state message (e.g., "No recent activity") — not a blank space.

**Achievement Framework**

- **FR-325**: The system MUST provide a configurable achievement framework. Achievement
  definitions are created and managed exclusively by administrators (R7). No hardcoded
  achievement names, icons, or thresholds are included in this specification or
  in the initial implementation.

- **FR-326**: Each achievement definition MUST conceptually support the following
  attributes:
  - **Name**: a human-readable label for the achievement
  - **Description**: a plain-language explanation of what the achievement represents
  - **Icon**: a visual identifier for the achievement
  - **Category**: a grouping label for the achievement (e.g., "Problem Solving",
    "Contests", "Consistency") — categories are also configurable
  - **Unlock rule**: the logical condition that must be satisfied for the achievement
    to be awarded. Unlock rules MUST support two types of conditions:
    - **Count-based**: a threshold on a cumulative statistic (e.g., total solved ≥ N,
      hard solved ≥ N, contests attended ≥ N, contest rating ≥ N)
    - **Streak/time-based**: a threshold on a streak or time-window metric (e.g.,
      current streak ≥ N days, longest streak ≥ N days)
    Rules of both types may be combined within a single definition. Each rule type
    is evaluated against verified synchronized data only.
  - **Threshold / condition**: the measurable value(s) associated with the unlock rule

- **FR-327**: Achievement unlock conditions MUST be evaluated exclusively against
  verified synchronized statistics. No achievement may be awarded based on
  user-entered data or manual administrator override for individual students.

- **FR-328**: Achievement evaluation MUST run automatically after each successful
  synchronization cycle for all students.

- **FR-329**: When a student's statistics newly satisfy an achievement's unlock
  condition, the achievement MUST be awarded immediately after evaluation, with the
  earned date set to the calendar day of the confirming synchronization.

- **FR-330**: A student who already holds an achievement MUST NOT receive a duplicate
  award of the same achievement. The original earned date MUST be preserved.

- **FR-331**: When a new achievement definition is added by an administrator, the
  system MUST retroactively evaluate all students against the new definition during
  the next evaluation run. Students whose existing statistics satisfy the condition
  MUST be awarded the achievement with the evaluation date as the earned date.

- **FR-332**: The public profile MUST display all earned achievements for the student,
  each showing: name, icon, description, and the date earned.

- **FR-333**: The student's own profile (viewed while logged in) MUST additionally
  display locked/unearned achievements the student has not yet earned, clearly
  distinguished from earned achievements. Each locked achievement MUST show: name,
  icon, description, and the unlock condition in user-readable form.

- **FR-334**: Locked achievements MUST NOT be visible to visitors viewing another
  student's profile.

**Achievement Behaviour on Stat Decrease**

- **FR-335**: If a confirmed synchronization (after suspicious-sync resolution, as
  defined in R2) results in statistics that no longer satisfy an earned achievement's
  condition, the achievement MUST be marked as "revoked" and displayed with a
  revocation indicator on the profile. It MUST NOT be silently removed.

- **FR-336**: A revoked achievement MUST be re-awarded (with a new earned date) if a
  subsequent sync confirms the statistics have risen above the threshold again.

- **FR-337**: No achievement MUST be revoked while a suspicious sync result is
  pending resolution.

**Achievement Behaviour on Definition Deletion**

- **FR-341**: When an administrator deletes an achievement definition, all Student
  Achievement Records for that definition MUST be preserved. The achievement MUST
  continue to appear on all earning students' profiles as a legacy badge, displaying:
  name, icon (if still renderable), earned date, and a "legacy" indicator. No live
  definition link is required.

- **FR-342**: A legacy badge MUST NOT be re-evaluated or re-awarded. It exists solely
  as a historical record of the student's achievement at the time it was earned.

- **FR-343**: A legacy badge is NEVER re-revoked solely because its definition was
  deleted. Revocation applies only to active, enabled achievement definitions (FR-335).

**Achievement Behaviour on LeetCode Username Change**

- **FR-338**: When a student changes their LeetCode username (as defined in R2), all
  earned achievements MUST be cleared simultaneously with the clearing of statistics
  and activity data. Legacy badges (from deleted definitions) are also cleared — the
  LeetCode username change is a full profile reset.

- **FR-339**: After the first successful sync of the new LeetCode username, achievement
  evaluation MUST run and awards MUST be granted only where the new account's data
  supports them.

- **FR-340**: Between a username change and the first successful sync of the new
  username, the achievements section MUST show "Achievements pending sync" or
  equivalent — not the cleared achievements and not a blank error.

- **FR-344**: The public profile URL changes when a student changes their LeetCode
  username. The old URL (`/profile/{old-username}`) MUST return an "account not
  found" or "profile moved" page rather than serving another student's profile.
  The student's new profile is accessible at `/profile/{new-username}` immediately
  after the username is saved, even before the first sync of the new username completes.

### Key Entities

- **Public Profile**: A composed view of a student's identity, statistics, activity,
  and achievements for public display. Attributes: student name, avatar, LeetCode
  username, LeetCode profile URL, LeetCode global rank, gender, branch (optional),
  batch (optional), college rank, stale-data flag, last-synced timestamp.

- **Coding Statistics View**: The difficulty-breakdown display on a profile.
  Attributes: total solved, easy solved, medium solved, hard solved, easy percentage,
  medium percentage, hard percentage. All sourced from synchronization. Read-only.

- **Contest Statistics View**: The contest-performance display on a profile.
  Attributes: current rating, highest (peak) rating, contests attended. Shown as "—"
  when absent. Read-only.

- **Activity Heatmap**: A 12-month calendar view of daily accepted submission activity.
  Attributes: ordered list of (calendar date, accepted submission count) pairs within
  the available data window. Only accepted submissions are counted. Days with no data
  are distinguished from days with zero accepted submissions.

- **Activity Summary**: Computed metrics derived from the heatmap data. All metrics
  are based on accepted submissions only. Attributes: daily activity count (accepted
  submissions on most recent active day), active-day count (days with ≥1 accepted
  submission), current streak, longest streak, total accepted submissions in window,
  average accepted submissions on active days.

- **Activity Feed Item**: A single event entry in the recent activity feed.
  Attributes: event type (Solved Problem | Solved Hard Problem | Earned Achievement |
  Coding Milestone | Contest Milestone | Other Verified Activity), descriptive text,
  associated metadata (problem name, difficulty, achievement name, etc.), timestamp.
  Sourced from verified sync or platform data only.

- **Achievement Definition**: A configurable template for an achievement.
  Attributes: name, description, icon reference, category, unlock rule (expressed as
  a condition on one or more verified statistics), threshold/condition value(s),
  enabled flag. Managed by administrators (R7). No names or thresholds defined here.

- **Student Achievement Record**: A record that a specific student has earned a
  specific achievement. Attributes: student reference, achievement definition
  reference (nullable when definition is deleted), earned date, status (Active |
  Revoked | Legacy), revocation date (if applicable). A record transitions to Legacy
  status when its definition is deleted; Legacy records are never re-evaluated or
  re-revoked.

- **Achievement Evaluation Run**: A system record of a single achievement evaluation
  pass. Attributes: trigger (post-sync | admin-triggered | new-definition), run
  timestamp, count of new awards, count of revocations.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-301**: A student's public profile loads and renders all available sections
  (statistics, heatmap, feed, achievements) within 3 seconds under normal load
  conditions.

- **SC-302**: 100% of rendered public profiles contain no email address, enrollment
  number, roll number, section, or authentication information, verified by automated
  inspection of all public profile output.

- **SC-303**: Difficulty percentages displayed on a profile are computed correctly for
  100% of profiles: each percentage equals (count ÷ total) × 100 rounded to one
  decimal place, independently verifiable from the displayed counts.

- **SC-304**: An achievement is awarded to a student within one sync cycle of their
  statistics satisfying the unlock condition — with zero manual intervention required.

- **SC-305**: A student who changes their LeetCode username has all previous
  achievements cleared and profile sections showing "pending sync" within 60 seconds
  of saving the change, before any new sync runs.

- **SC-306**: Zero achievements are awarded based on user-entered data or manual
  claims — every awarded achievement is traceable to a specific synchronization
  record confirming the condition was met.

- **SC-307**: Locked achievements are visible on the student's own profile view for
  100% of defined enabled achievements, and are absent from all other visitors'
  views of the same profile.

- **SC-308**: The heatmap displays zero fabricated activity data — every populated
  day has a corresponding stored activity record from synchronization, verified by
  comparing rendered cells against stored activity entries.

- **SC-309**: A revoked achievement (due to confirmed stat decrease) is displayed with
  a visible revocation indicator rather than being silently removed — confirmed by
  inspecting the profile after a confirmed stat decrease scenario.

---

## Assumptions

- The profile page is publicly accessible without authentication (consistent with
  the leaderboard and search surfaces in R3). A student viewing their own profile
  while logged in sees additional locked achievements (FR-333).

- The "daily activity count" metric refers to the student's most recently active
  calendar day within the available data window, not necessarily today.

- The 12-month window for the heatmap is calculated as the 365 days ending today
  (inclusive) in the platform's configured reference timezone. This is consistent
  with the streak timezone reference defined in R3.

- Activity heatmap data coverage depends on what R2 synchronization can retrieve.
  The platform does not impose a minimum coverage requirement on the heatmap; it
  shows whatever is available.

- Achievement categories are configurable by administrators (R7) and are not
  predefined in this specification.

- The "enabled flag" on an achievement definition allows administrators to disable
  an achievement without deleting it. Students who already earned a disabled
  achievement retain it; no new awards are made from disabled definitions.

- The milestone thresholds that generate activity feed entries (e.g., "crossed 100
  problems solved") are configurable as part of the achievement framework or as
  platform-level configuration — not hardcoded. This is a detail for the
  implementation plan.

- Contest milestone feed events (e.g., "reached rating 1500") are generated from
  confirmed sync data, not from user-reported ratings.

- The specification does not define the number of items in the recent activity feed.
  The feed window (e.g., last 50 events, last 30 days) is a configuration detail
  for the implementation plan.
