# Feature Specification: College Leaderboard & Student Discovery

**Feature Branch**: `003-college-leaderboard`

**Created**: 2026-09-17

**Status**: Draft

**Roadmap Entry**: R3 — College Leaderboard & Discovery
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — View the College Leaderboard (Priority: P1)

Any visitor (authenticated or not) can open the college leaderboard and see all
eligible students ranked by their overall college score.

**Why this priority**: The leaderboard is the primary value surface of the platform.
It is the reason most students register and the most frequently visited page.

**Independent Test**: Testable by loading the leaderboard as a guest and confirming
all eligible students appear with correct ranking and visible statistics.

**Acceptance Scenarios**:

1. **Given** a visitor on the leaderboard page, **When** the page loads, **Then** a
   ranked list of all eligible students is displayed, ordered by college rank
   (rank 1 at the top).

2. **Given** the leaderboard, **When** rendered, **Then** each row displays: rank,
   name, avatar, LeetCode username, total problems solved, easy/medium/hard
   breakdown, contest rating, contests attended, current streak, achievement count,
   and overall score. Optional batch and branch appear only when the student has
   provided them.

3. **Given** the leaderboard, **When** rendered, **Then** the college rank column
   is visually and labelled distinctly from the LeetCode global rank. If LeetCode
   global rank is displayed, it is clearly labelled "LeetCode Rank" and the college
   rank is labelled "College Rank".

4. **Given** a student who has not yet had a successful LeetCode synchronization,
   **When** the leaderboard is rendered, **Then** that student's row shows their name
   and profile fields but all statistics sourced from synchronization are shown as
   "—" or "Not yet available", not as zeros.

5. **Given** a student whose synchronized data is stale, **When** their leaderboard
   row is displayed, **Then** a stale-data indicator is shown on that row, along with
   the timestamp of the last successful sync.

---

### User Story 2 — Understand My College Rank (Priority: P1)

A logged-in student can see their own college rank prominently on the leaderboard and
on their profile, and can understand exactly what inputs produced that rank.

**Why this priority**: If students cannot understand how their rank is calculated,
they cannot trust or engage with the leaderboard.

**Independent Test**: Testable by locating a student's rank on the leaderboard, then
opening the ranking formula explanation and confirming all inputs match the student's
displayed statistics.

**Acceptance Scenarios**:

1. **Given** a logged-in student viewing the leaderboard, **When** the page loads,
   **Then** their own row is visually highlighted and their college rank is displayed
   prominently.

2. **Given** any visitor on the leaderboard or a student's public profile, **When**
   they view the overall score, **Then** a visible explanation or expandable detail
   shows exactly which statistics contribute to the score and their relative weight.

3. **Given** a student's rank display, **When** the visitor clicks or taps on the
   rank or score, **Then** a breakdown of the score components is shown: the
   individual contribution from problem count, difficulty weighting, contest rating,
   and activity, using the student's own numbers.

4. **Given** a student whose overall score ties with another student, **When** the
   leaderboard is displayed, **Then** the tie-breaking rules are applied (defined in
   FR-213) and the order is deterministic and consistent across page loads.

---

### User Story 3 — Sort the Leaderboard (Priority: P1)

A visitor can re-order the leaderboard by any supported sort dimension to compare
students along different axes.

**Why this priority**: Different users value different metrics — hard-problem count
for depth, contest rating for competitive rank, streak for consistency. Sorting
makes all of these discoverable.

**Independent Test**: Testable by sorting on each supported dimension and confirming
the resulting order matches the expected sort of that statistic.

**Acceptance Scenarios**:

1. **Given** the leaderboard, **When** a visitor selects "Overall Rank" as the sort
   dimension, **Then** rows are ordered by college rank ascending (rank 1 first).

2. **Given** the leaderboard, **When** a visitor selects "Problems Solved" as the
   sort dimension, **Then** rows are ordered by total problems solved descending.

3. **Given** the leaderboard, **When** a visitor selects "Hard Solved" as the sort
   dimension, **Then** rows are ordered by hard problems solved descending.

4. **Given** the leaderboard, **When** a visitor selects "Contest Rating" as the sort
   dimension, **Then** rows are ordered by current contest rating descending. Students
   with no contest rating appear at the bottom of this sort, not at the top.

5. **Given** the leaderboard, **When** a visitor selects "Recent Activity" as the
   sort dimension, **Then** rows are ordered by date of most recent accepted submission
   descending (most recently active first). Students with no recorded activity appear
   at the bottom.

6. **Given** the leaderboard, **When** a visitor selects "Streak" as the sort
   dimension, **Then** rows are ordered by current active streak descending. Students
   with no streak appear at the bottom.

7. **Given** a sort dimension is selected, **When** two students have identical values
   for that dimension, **Then** the secondary sort falls back to overall college rank
   to maintain a consistent and deterministic order.

---

### User Story 4 — Filter the Leaderboard (Priority: P2)

A visitor can apply one or more filters to narrow the leaderboard to a subset of
students.

**Why this priority**: Filters allow meaningful sub-community comparisons (e.g.,
"all second-year CSE students" or "students with at least 100 problems solved").

**Independent Test**: Testable by applying each filter and confirming only matching
students are shown and all non-matching students are hidden.

**Acceptance Scenarios**:

1. **Given** the leaderboard, **When** a visitor selects a specific batch year (e.g.,
   "2022"), **Then** only students who have provided that admission year or whose
   derived batch matches are shown.

2. **Given** the leaderboard, **When** a visitor selects a specific branch (e.g.,
   "CSE"), **Then** only students who have provided that branch are shown.

3. **Given** the leaderboard, **When** a visitor selects the "Male" or "Female"
   gender filter, **Then** only students with the matching gender are shown.

4. **Given** the leaderboard, **When** a visitor sets a minimum problems-solved
   threshold (e.g., "≥ 50"), **Then** only students with total problems solved ≥ 50
   are shown.

5. **Given** the leaderboard, **When** a visitor sets a minimum contest rating
   threshold, **Then** only students with a confirmed contest rating ≥ that threshold
   are shown. Students with no contest rating do not appear.

6. **Given** the leaderboard, **When** a visitor selects the "Active" activity
   status filter, **Then** only students with at least one accepted submission within
   the defined activity window are shown.

7. **Given** multiple filters applied simultaneously, **When** the leaderboard
   renders, **Then** only students matching all applied filters are displayed
   (filters combine as AND conditions).

8. **Given** a filter that results in zero matching students, **When** the leaderboard
   renders, **Then** a clear "No students match the selected filters" message is
   shown rather than an empty table with no explanation.

9. **Given** a filter is cleared, **When** the leaderboard re-renders, **Then**
   previously hidden students reappear and the ranking order is restored for the
   remaining active filters.

---

### User Story 5 — Search for Students (Priority: P1)

A visitor can search the platform to find a specific student by name, LeetCode
username, batch, or branch.

**Why this priority**: Search is how users navigate to a specific student's profile
and is the entry point to the public profile view.

**Independent Test**: Testable by searching each supported field and confirming
matching students are returned; and by confirming email search returns no results
and is not a supported field.

**Acceptance Scenarios**:

1. **Given** a visitor using the search interface, **When** they type a student's
   full or partial name, **Then** students whose name contains the search term
   (case-insensitive) are returned as results.

2. **Given** a visitor using the search interface, **When** they type a LeetCode
   username (partial or full), **Then** students with a matching LeetCode username
   are returned.

3. **Given** a visitor using the search interface, **When** they type a batch year
   (e.g., "2024"), **Then** students with a matching derived batch or admission year
   are returned.

4. **Given** a visitor using the search interface, **When** they type a branch name
   (e.g., "ECE"), **Then** students whose branch matches are returned.

5. **Given** any search query, **When** the results are rendered, **Then** no
   student's email address appears in any search result, regardless of whether the
   query would match an email.

6. **Given** a search query that matches no students, **When** results render,
   **Then** a clear "No students found" message is displayed.

7. **Given** a search result, **When** a visitor clicks on a student's result,
   **Then** they are navigated to that student's public profile page.

---

### User Story 6 — Recognition Cards (Priority: P2)

The leaderboard dashboard displays recognition cards highlighting the top-performing
students in specific categories.

**Why this priority**: Recognition cards surface exceptional students at a glance,
motivate engagement, and make the platform feel like an active community, not just
a data table.

**Independent Test**: Testable by confirming each card displays the correct student
for its category, and that the card updates when statistics change.

**Acceptance Scenarios**:

1. **Given** the leaderboard dashboard, **When** it loads, **Then** three recognition
   cards are displayed: "Most Solved", "Top Contest Rating", and "Most Hard Solved".

2. **Given** the "Most Solved" card, **When** rendered, **Then** it shows the student
   with the highest total problems solved, along with their name, avatar, and that
   statistic value.

3. **Given** the "Top Contest Rating" card, **When** rendered, **Then** it shows the
   student with the highest current contest rating, along with their name, avatar,
   and rating value. If no student has a contest rating, the card shows "No data yet".

4. **Given** the "Most Hard Solved" card, **When** rendered, **Then** it shows the
   student with the highest hard problems solved, along with their name, avatar, and
   that count.

5. **Given** a tie for a recognition card position, **When** the card is rendered,
   **Then** exactly one student is featured. Tie-breaking follows college rank
   (lower rank number wins); the tie-breaking rule is documented on the card.

6. **Given** a student featured on a recognition card, **When** a visitor clicks
   the card, **Then** they are navigated to that student's public profile.

---

### User Story 7 — Transparent Ranking Score (Priority: P1)

Any visitor can view the exact formula used to compute a student's overall college
score, and can trace how that formula produces each student's displayed score.

**Why this priority**: The constitution requires transparent rankings. An opaque score
is a trust and integrity failure regardless of how accurate the underlying data is.

**Independent Test**: Testable by applying the published formula to any student's
raw statistics and confirming the computed result matches the displayed overall score
exactly.

**Acceptance Scenarios**:

1. **Given** any visitor on the leaderboard or a student's profile, **When** they
   view the overall score display, **Then** a link or control is present that opens
   a full explanation of the ranking formula.

2. **Given** the ranking formula explanation, **When** viewed, **Then** it lists
   each input statistic (e.g., total solved, hard solved, contest rating, active
   streak), its contribution method, and the weighting or coefficient applied.

3. **Given** the ranking formula explanation, **When** the formula inputs or weights
   are changed by an administrator, **Then** the explanation on the public page is
   updated to reflect the current formula — no stale formula description is shown.

4. **Given** a student's overall score display, **When** a visitor expands the score
   breakdown, **Then** the breakdown shows each formula component with the student's
   actual input value and resulting contribution to the score.

---

### User Story 8 — Students with No Contest Rating (Priority: P1)

Students who have never participated in a LeetCode contest are still eligible for
the leaderboard and still receive a college rank.

**Why this priority**: Most students have no contest rating initially. Excluding them
from the leaderboard would make it useless for newcomers and unfair to students who
focus on problem solving over contests.

**Independent Test**: Testable by confirming a student with zero contests appears on
the leaderboard with a valid college rank, and by confirming the ranking formula
handles no-contest-rating gracefully.

**Acceptance Scenarios**:

1. **Given** a student with confirmed LeetCode data but no contest participation,
   **When** the leaderboard is viewed, **Then** the student appears with their rank
   and all other statistics. The contest rating column shows "—" or "N/A" (not zero).

2. **Given** the ranking formula applied to a student with no contest rating,
   **When** the score is computed, **Then** the formula applies a defined default
   for the contest-rating component (e.g., the component contributes zero, as if
   the rating were at baseline) and the student is not excluded from ranking.

3. **Given** a "Contest Rating" sort applied to the leaderboard, **When** it renders,
   **Then** students with no contest rating appear below all students who have a
   rating, not interleaved.

---

### User Story 9 — Students with Incomplete or Pending Sync Data (Priority: P1)

Students who have not yet had a successful synchronization, or whose sync is in an
error state, are still present on the leaderboard with appropriate indicators.

**Why this priority**: A student who just registered should appear on the leaderboard
immediately, even before their first sync, so they know the system recognised them.

**Independent Test**: Testable by registering a student and immediately viewing the
leaderboard — the student must appear with "pending" indicators.

**Acceptance Scenarios**:

1. **Given** a newly registered student whose first LeetCode sync has not yet
   completed, **When** the leaderboard is viewed, **Then** the student appears with
   their name, avatar, and profile fields, and statistic columns show "—" or
   "Pending".

2. **Given** a student in an error or unresolvable sync state, **When** the
   leaderboard is viewed, **Then** the student appears with an error indicator on
   their row. Their last successfully synced statistics (if any) are displayed,
   marked as stale.

3. **Given** a student with no successfully synced data, **When** the overall score
   ranking is applied, **Then** the student appears at the bottom of the ranked list
   (below all students with any score), not excluded entirely.

---

### User Story 10 — Students with No Optional Academic Information (Priority: P2)

Students who have not provided batch or branch information still appear on the
leaderboard without placeholder text.

**Why this priority**: Academic fields are optional by design. The leaderboard must
degrade gracefully without them.

**Independent Test**: Testable by viewing a student's leaderboard row when they
have no batch or branch, and confirming no placeholder text appears.

**Acceptance Scenarios**:

1. **Given** a student who has not provided admission or graduation year, **When**
   their leaderboard row is rendered, **Then** the batch column is blank or omitted —
   not shown as "N/A", "Unknown", or any other placeholder string.

2. **Given** a student who has not provided a branch, **When** their leaderboard
   row is rendered, **Then** the branch column is blank or omitted.

3. **Given** a batch filter applied to the leaderboard, **When** a student has no
   batch information, **Then** that student is excluded from the filtered results
   (they are not included in any batch filter match).

---

### User Story 11 — UI Refresh vs. External Synchronization (Priority: P2)

A user can refresh the leaderboard view to reload the latest data held by the platform,
and the platform clearly communicates that this is distinct from triggering a new
LeetCode synchronization.

**Why this priority**: Users may confuse "refresh the page" with "sync with LeetCode
now". This confusion leads to incorrect expectations about data freshness.

**Independent Test**: Testable by triggering a UI refresh and confirming: (a) data
displayed is current as of the last sync, and (b) no new external sync is initiated
as a result.

**Acceptance Scenarios**:

1. **Given** a visitor on the leaderboard, **When** they trigger a UI refresh,
   **Then** the displayed data is reloaded from the platform's current stored
   statistics. No external call to LeetCode is initiated.

2. **Given** the leaderboard, **When** a UI refresh completes, **Then** the "last
   data refresh" timestamp updates to the current time, while the "last synced from
   LeetCode" timestamp remains unchanged.

3. **Given** the leaderboard header or footer, **When** rendered, **Then** the last
   successful synchronization time is displayed (e.g., "Data last synced from
   LeetCode: 5 minutes ago") so users can judge data freshness independently of
   the UI refresh.

4. **Given** a visitor who clicks "Refresh", **When** a tooltip, help text, or
   adjacent label is visible, **Then** it clarifies that this action reloads the
   currently stored data and does not pull new data from LeetCode.

---

### User Story 12 — Inactive or Unavailable Students (Priority: P2)

Students who have not had any activity for an extended period, or whose accounts are
deactivated, are handled consistently on the leaderboard.

**Why this priority**: The leaderboard must reflect the active community; students
who have left or whose data is permanently unavailable should not crowd the ranking.

**Independent Test**: Testable by deactivating a student account and confirming
they no longer appear on the leaderboard; and by verifying that a student with no
recent activity still appears but is identifiable as inactive.

**Acceptance Scenarios**:

1. **Given** a student whose platform account has been deactivated by an
   administrator, **When** the leaderboard is viewed, **Then** that student does not
   appear on the leaderboard.

2. **Given** a student who has no recorded activity within the defined inactivity
   window (a configurable threshold), **When** the leaderboard is viewed without
   any activity filter applied, **Then** the student still appears with their
   statistics and rank, but may be tagged with an "Inactive" indicator.

3. **Given** the "Active" activity filter applied to the leaderboard, **When** a
   student is tagged as inactive, **Then** that student is excluded from the
   filtered results.

---

### Edge Cases

- **Two students with identical overall scores**: Tie is broken deterministically.
  Primary tie-breaker: higher hard problems solved. Secondary: higher contest rating.
  Tertiary: alphabetical order by name. The tie-breaking sequence is published on
  the ranking formula page.

- **Student with contest rating but zero problems solved**: The student receives a
  college rank factoring in their contest rating with a zero contribution from problem
  count. They are not excluded, but will rank near the bottom for overall score.

- **Student with problems solved but no contest rating**: The contest-rating component
  of the formula contributes zero (baseline). The student ranks purely on problem and
  activity components. This must not disqualify them.

- **Single eligible student on the platform**: That student is Rank 1 by default.

- **Student's statistics update mid-page-load**: Ranks are computed and cached at a
  defined interval; a visitor sees a consistent snapshot for the duration of their
  session view — ranks do not shift dynamically mid-render.

- **Student drops in ranking after a re-sync**: If a student's statistics decrease
  (e.g., suspicious sync result is later confirmed), their rank may legitimately
  decrease. The new rank is applied after the suspicious flag is resolved.

- **All students have zero problems solved**: Every student receives a valid rank
  (Rank 1 through N), ordered by secondary criteria (contest rating, then name).

- **Batch filter applied when no student has batch information**: The filter returns
  zero results. A clear "No students match" message is shown.

- **Branch name with variant spellings**: Branch matching in search and filter is
  case-insensitive (e.g., "cse" matches "CSE"). Exact stored value is displayed;
  comparison is normalised.

- **Search query matching both name and LeetCode username**: Results include all
  students where either field matches. A student matching on both fields appears
  once, not twice.

- **Leaderboard with very large student population**: Pagination or virtual scrolling
  must be implemented so the page does not attempt to render all students at once.
  The total count of eligible students is displayed.

- **Recognition card student is deactivated**: If the featured student is deactivated,
  the card shows the next eligible student rather than a blank or deactivated profile.

- **Student with an avatar that fails to load**: A fallback initials-based avatar
  is displayed in place of the broken image, consistent with the avatar policy
  defined in R1.

- **Current streak definition and reset**: The current streak is defined as the
  number of consecutive calendar days (in the student's local timezone per stored
  activity data) on which at least one accepted submission was made. A streak resets
  to zero if a calendar day passes with no accepted submission. The exact timezone
  reference is a configuration detail for the implementation plan.

- **Leaderboard accessed with filters that include gender**: The gender filter uses
  the student's explicitly selected gender (Male or Female) and never derives gender
  from any other source. If a student's gender field is somehow absent, they are
  excluded from all gender-filtered views.

---

## Requirements *(mandatory)*

### Functional Requirements

**Leaderboard Display**

- **FR-201**: The system MUST display a college-wide leaderboard listing all eligible
  students ordered by college rank.

- **FR-202**: A student is eligible for the leaderboard if and only if: their platform
  account is active (not deactivated), and their LeetCode username is connected.
  Students with no successful sync yet are eligible and appear with pending indicators.

- **FR-203**: Each leaderboard row MUST display: college rank, student name, avatar,
  LeetCode username, total problems solved, easy solved, medium solved, hard solved,
  contest rating, contests attended, current streak, achievement count, and overall
  score. Optional batch and branch MUST appear only when the student has provided them.

- **FR-204**: The leaderboard MUST clearly distinguish college rank from LeetCode
  global rank. If LeetCode global rank is displayed, it MUST be labelled "LeetCode
  Rank" and the college rank MUST be labelled "College Rank".

- **FR-205**: Students whose synchronized data is stale MUST display a stale-data
  indicator on their leaderboard row, along with the timestamp of their last
  successful synchronization.

- **FR-206**: Students with no successfully synced data MUST show "—" or equivalent
  for all statistics sourced from synchronization. Zero MUST NOT be shown for
  unsynced students.

- **FR-207**: The leaderboard MUST display the total count of eligible students.

- **FR-208**: The leaderboard MUST support pagination or virtual scrolling for large
  student populations. All students remain accessible; none are truncated.

**College Rank**

- **FR-209**: Every eligible student MUST receive a college rank, computed from the
  overall score formula defined in FR-210.

- **FR-210**: The overall college score MUST be computed from the following inputs,
  each with a defined contribution:
  - Problems solved, weighted by difficulty (hard contributions weighted more than
    medium, medium more than easy)
  - Contest rating (contributes zero if the student has no contest rating)
  - Activity component (based on current streak or recent activity)
  The exact weights and formula coefficients are configurable by administrators (R7)
  and MUST be published on a public-facing formula explanation page.

- **FR-211**: The ranking formula MUST NOT depend solely on raw total problem count.
  At minimum, difficulty weighting and an activity component must also contribute.

- **FR-212**: A student with no contest rating MUST receive a college rank. The
  contest-rating component of their score MUST be treated as zero (baseline), not
  as undefined or excluded.

- **FR-213**: When two students share an identical overall score, the tie MUST be
  broken by the following sequence:
  1. Higher hard problems solved (descending)
  2. Higher contest rating (descending; no rating treated as zero)
  3. Alphabetical order by name (ascending)
  This tie-breaking sequence MUST be documented on the public ranking formula page.

- **FR-214**: A student with incomplete or pending sync data MUST still receive a
  rank position. Students with no score (no sync data) MUST appear below all
  students with any score.

- **FR-215**: The college rank of each student MUST be recomputed after each
  synchronization cycle completes. Rank updates MUST NOT be applied mid-cycle;
  a full cycle must complete before ranks are updated.

- **FR-216**: A deactivated student MUST be removed from the leaderboard and their
  rank freed for recalculation.

**Ranking Formula Transparency**

- **FR-217**: The platform MUST provide a publicly accessible page or section that
  explains the ranking formula in full: each input, its contribution method, and
  its current weight.

- **FR-218**: When a visitor expands or inspects a student's overall score, the
  platform MUST show a score breakdown specific to that student: each formula
  component with the student's actual value and its computed contribution.

- **FR-219**: When an administrator changes formula weights (R7), the publicly
  displayed formula explanation MUST be updated immediately to reflect the current
  weights. No stale formula description may be shown.

**Sorting**

- **FR-220**: The leaderboard MUST support sorting by: overall rank, total problems
  solved, hard problems solved, contest rating, recent activity (date of last accepted
  submission), and current streak.

- **FR-221**: When sorted by a dimension, students with no value for that dimension
  (e.g., no contest rating, no streak) MUST appear at the bottom of the sorted list,
  not at the top or interleaved.

- **FR-222**: When two students have identical values for the selected sort dimension,
  the secondary sort MUST fall back to overall college rank to ensure deterministic
  ordering.

**Filtering**

- **FR-223**: The leaderboard MUST support filtering by: batch (derived from academic
  years), branch, gender (Male | Female), minimum total problems solved, minimum
  contest rating, and activity status (Active | Inactive).

- **FR-224**: Gender filtering MUST use only the student's explicitly selected gender
  field. Gender MUST NOT be inferred from any other source. A student with no gender
  value MUST be excluded from all gender-filtered views.

- **FR-225**: Multiple filters applied simultaneously MUST combine as AND conditions:
  only students satisfying all active filters are shown.

- **FR-226**: A filter that yields zero results MUST display a clear "No students
  match" message, not an empty table with no explanation.

- **FR-227**: Students with no batch information MUST be excluded from batch-filtered
  results. They MUST NOT be grouped into an "Unknown" batch category.

- **FR-228**: The "Active" activity filter MUST show only students with at least one
  accepted submission within a configurable activity window (default: last 30 days).

**Search**

- **FR-229**: The platform MUST provide a student search interface that searches
  across: student name (partial, case-insensitive), LeetCode username (partial,
  case-insensitive), batch (year match), and branch (case-insensitive).

- **FR-230**: Email MUST NOT be a searchable field. A search query that happens to
  match an email address MUST NOT return results matching that email.

- **FR-231**: A search query matching both name and LeetCode username of the same
  student MUST return that student exactly once.

- **FR-232**: Search results MUST link to the matching student's public profile page.

- **FR-233**: A search query matching no students MUST display a clear "No students
  found" message.

**Recognition Cards**

- **FR-234**: The leaderboard dashboard MUST display three recognition cards:
  "Most Solved" (highest total problems solved), "Top Contest Rating" (highest
  current contest rating), and "Most Hard Solved" (highest hard problems solved).

- **FR-235**: Each recognition card MUST display: the student's name, avatar, and
  the relevant statistic value.

- **FR-236**: If a recognition card position is a tie, the student with the lower
  college rank number (better rank) is featured. The tie-breaking rule MUST be
  documented on the card.

- **FR-237**: If no student qualifies for a card (e.g., no student has a contest
  rating), the card MUST display a "No data yet" message rather than a blank card.

- **FR-238**: If a recognition-card-featured student is deactivated, the card MUST
  immediately show the next eligible student.

- **FR-239**: Clicking a recognition card MUST navigate to the featured student's
  public profile.

**Sync Time Display and UI Refresh**

- **FR-240**: The leaderboard MUST display the timestamp of the last successful
  platform-wide synchronization from LeetCode in a visible location.

- **FR-241**: The platform MUST provide a UI refresh action that reloads the
  leaderboard from the platform's current stored data without initiating any
  external synchronization call.

- **FR-242**: The UI refresh action MUST be accompanied by a clear label or tooltip
  distinguishing it from an external LeetCode sync (e.g., "Reload displayed data"
  vs "Sync with LeetCode").

- **FR-243**: After a UI refresh, the "data last refreshed" display updates to the
  current time. The "last synced from LeetCode" timestamp MUST remain unchanged by
  a UI refresh.

**Student Profile Navigation**

- **FR-244**: Each leaderboard row MUST be navigable to the corresponding student's
  public profile page.

**Excluded Features**

- **FR-245**: The leaderboard MUST NOT include Question of the Week, First Blood, or
  Batch Wars features in any form.

### Key Entities

- **Leaderboard Entry**: A computed view record for a single eligible student.
  Attributes: student reference, college rank, overall score, score breakdown (per
  formula component), stale-data flag, last-synced timestamp, activity status
  (Active | Inactive).

- **Overall Score**: A numeric value computed by the ranking formula from a student's
  statistics. Attributes: total value, easy-contribution, medium-contribution,
  hard-contribution, contest-rating contribution, activity contribution. Recomputed
  after each sync cycle.

- **Ranking Formula Configuration**: The active set of formula weights and thresholds.
  Attributes: hard-weight, medium-weight, easy-weight, contest-rating weight,
  activity weight, tie-breaking sequence, effective-from timestamp. Managed by
  administrators (R7). Publicly readable by all visitors.

- **Recognition Card**: A highlighted display slot for a top-performing student in
  a specific category. Attributes: category (Most Solved | Top Contest Rating |
  Most Hard Solved), featured student reference, featured statistic value,
  tie-breaking rule description.

- **Search Result**: A lightweight student record returned by a search query.
  Attributes: student name, avatar, LeetCode username, batch (if available), branch
  (if available), college rank. Excludes email.

- **Sort State**: The currently active sort dimension and direction for the leaderboard.
  Attributes: dimension (Overall Rank | Problems Solved | Hard Solved | Contest
  Rating | Recent Activity | Streak), direction (ascending | descending).

- **Filter State**: The currently active filter criteria applied to the leaderboard.
  Attributes: batch (optional), branch (optional), gender (optional: Male | Female),
  min problems solved (optional), min contest rating (optional), activity status
  (optional: Active | Inactive).

- **Streak**: The number of consecutive calendar days on which a student made at
  least one accepted submission, counted up to and including today. Attributes:
  student reference, current streak length (in days), streak start date, last active
  date. A streak resets to zero on the first calendar day with no accepted submission.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-201**: The leaderboard loads and displays the full ranked list of eligible
  students within 3 seconds under normal load conditions, for a student population
  of up to 1,000 students.

- **SC-202**: 100% of displayed overall score values can be independently reproduced
  by applying the published ranking formula to the student's displayed statistics —
  no student's score is a black box.

- **SC-203**: 100% of leaderboard rows and search results contain no student email
  address, verified by automated inspection of all rendered output.

- **SC-204**: Sorting by any supported dimension produces a correctly ordered list
  with zero out-of-order rows, verified by comparing the rendered order against an
  independent sort of the same dataset.

- **SC-205**: A filter producing zero matches displays a "No students match" message
  within 1 second of the filter being applied — the leaderboard never shows an empty
  table with no explanation.

- **SC-206**: A student registers and appears on the leaderboard (with pending
  indicators) within 60 seconds of completing email verification, without any
  administrator action.

- **SC-207**: Recognition cards always display a non-empty, non-deactivated student
  for each category as long as at least one eligible student with data exists for
  that category. No recognition card shows a deactivated student.

- **SC-208**: A UI refresh completes and the leaderboard re-renders within 2 seconds
  without initiating any external network call to LeetCode, verified by inspecting
  network activity during a refresh action.

- **SC-209**: The college rank of every eligible student is recomputed and published
  within 5 minutes of each synchronization cycle completing.

- **SC-210**: A search query returns all matching students (name, username, batch, or
  branch) with zero false negatives for exact-match queries, and zero email leakage
  in any result, verified by searching each supported field type.

---

## Assumptions

- The leaderboard is publicly accessible to any visitor (authenticated or not). No
  login is required to view the leaderboard or search for students.

- "Current streak" is computed from the activity data synchronized by R2. Its
  calendar-day boundary is based on a reference timezone configured at the platform
  level (to be defined in the implementation plan).

- The "activity window" for the Active filter defaults to 30 calendar days but is
  configurable by administrators (R7).

- The ranking formula weights are initially set to sensible defaults at launch and
  are configurable by administrators without a code change (R7). The spec defines
  the inputs; the exact weights are a deployment configuration.

- Batch matching in filters and search uses the derived batch label (from admission
  and graduation years as defined in R1). If a student has only one or no academic
  year, they do not match any batch filter.

- Branch matching is case-insensitive and uses the stored branch string from R1.
  No normalisation of branch names (e.g., "computer science" vs "CS") is applied
  beyond case folding; that normalisation is an implementation-plan decision.

- Deactivated students are excluded immediately from the leaderboard. The definition
  of "deactivated" is determined by the administrator action (R7).

- The "LeetCode global rank" display on the leaderboard is optional and only shown
  if reliably available from the synchronised data (R2). If not available, it is
  omitted — it is not a required column.

- The platform does not assign college ranks to students from other colleges. All
  users of this deployment are assumed to belong to the same college. Multi-college
  support is out of scope.
