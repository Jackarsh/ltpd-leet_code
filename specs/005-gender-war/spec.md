# Feature Specification: Gender War — Male vs Female Coding Comparison

**Feature Branch**: `005-gender-war`

**Created**: 2026-09-17  
**Last Updated**: 2026-09-17 (post-clarify)

**Status**: Draft

**Roadmap Entry**: R5 — Gender War  
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## Clarifications

### Session 2026-09-17

- Q: How frequently should Gender War aggregate metrics and within-group rankings be recomputed and cached? → A: Recomputed asynchronously after every platform-wide sync batch completion (and at least once every 6 hours), cached with instant invalidation upon admin configuration changes.
- Q: How should the platform handle group comparisons when one group has very low sample size (<5 participants)? → A: Display normalized metrics with a prominent "Low sample size (<5 participants)" informational badge next to the aggregate, without disabling comparison views.
- Q: What default display limit and pagination behavior applies to the within-group leaderboards? → A: Display top 10 students by default per panel, with a "View Full Group Leaderboard" action supporting standard pagination (25/50 per page).
- Q: What precise activity criteria qualifies a student as an "Active Coder" for a selected time window? → A: Any participant who recorded ≥1 accepted submission or participated in ≥1 contest within the selected time window.
- Q: How should comparative standing be presented between the two groups? → A: Multi-dimensional metric dashboard highlighting metric-by-metric category leads without declaring a single binary "Winner" badge.

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — View the Gender War Page (Priority: P1)

Any visitor can navigate to the Gender War page and see a side-by-side statistical
comparison of Male and Female students on the platform.

**Why this priority**: Gender War is a named, dedicated feature of the platform. It
must be immediately accessible and present a clear, balanced view without implying
superiority of either group.

**Independent Test**: Testable by loading the Gender War page as a guest and confirming
both groups are shown with equivalent layout, equivalent metric sets, and visible
participant counts.

**Acceptance Scenarios**:

1. **Given** any visitor navigating to the Gender War page, **When** the page loads,
   **Then** two clearly labelled panels are displayed — one for Male students, one for
   Female students — in a side-by-side or equivalent symmetrical layout.

2. **Given** the Gender War page, **When** rendered, **Then** both groups display the
   same set of metrics (no metric appears for one group but not the other), ensuring
   the comparison is visually and structurally equal.

3. **Given** the Gender War page, **When** rendered, **Then** the participant count
   for each group is displayed prominently alongside the aggregate metrics so that
   visitors can interpret raw totals in the context of group size.

4. **Given** the Gender War page, **When** rendered, **Then** neither group's panel
   uses language, colour, or visual emphasis that implies it is inherently better or
   superior to the other.

5. **Given** a visitor on the Gender War page, **When** they view the page, **Then**
   a link or visible control is present to access the full explanation of the scoring
   and comparison methodology.

---

### User Story 2 — View Aggregate Metrics for Each Group (Priority: P1)

A visitor can see the required aggregate statistics for each gender group, both as raw
totals and as normalized values adjusted for group size.

**Why this priority**: Raw totals alone are misleading when group sizes differ
substantially. Normalised metrics (averages, rates per participant) are required to
make the comparison meaningful and fair.

**Independent Test**: Testable by computing each displayed metric independently from
the underlying student statistics and confirming the displayed values match.

**Acceptance Scenarios**:

1. **Given** the Gender War page with a selected time period, **When** rendered,
   **Then** the following aggregate metrics are displayed for each group:
   - Participant count (number of students in the group)
   - Total problems solved
   - Average problems solved per participant
   - Total Hard problems solved
   - Average Hard problems solved per participant
   - Total Medium problems solved
   - Average Medium problems solved per participant
   - Total Easy problems solved
   - Average Easy problems solved per participant
   - Average contest rating (among participants with a rating)
   - Total contests attended
   - Average contests attended per participant
   - Active coders (participants with ≥1 accepted submission or ≥1 contest attended in the period)
   - Recent submissions (total accepted submissions in the period)
   - Average current streak (averaged across all participants)

2. **Given** the aggregate metrics displayed, **When** rendered for any metric that
   is a raw total (e.g., total problems solved), **Then** the corresponding
   per-participant average for that metric MUST also be displayed on the same panel.

3. **Given** the participant counts for both groups are different, **When** the
   normalized metrics (averages, rates) are displayed, **Then** the normalized values
   are the basis for the primary comparison — not raw totals alone.

4. **Given** a group with fewer than 5 active participants, **When** aggregate metrics
   are rendered, **Then** a prominent "Low sample size (<5 participants)" informational
   badge is displayed alongside that group's aggregate values.

---

### User Story 3 — Filter by Time Period (Priority: P2)

A visitor can change the time period used to compute Gender War metrics, switching
between predefined windows.

**Why this priority**: A platform-wide "current week" leaderboard drives short-term
engagement; "all time" is the canonical measure. Both must be accessible from the
same page.

**Independent Test**: Testable by switching time periods and confirming the metrics
change to reflect data from the selected window.

**Acceptance Scenarios**:

1. **Given** the Gender War page, **When** rendered, **Then** a time-period selector
   is present with the following options: Current Week, Current Month, Current
   Semester, Current Academic Year, All Time.

2. **Given** a selected time period, **When** the metrics are computed, **Then** all
   activity-based metrics (recent submissions, active coders, average current streak)
   are scoped to the selected window. Cumulative metrics (total problems solved,
   contest rating) use all available synchronized data for "All Time" and the
   appropriate window for other periods.

3. **Given** the "Current Semester" or "Current Academic Year" time period selected,
   **When** metrics are displayed, **Then** the definition of the current semester or
   academic year (start and end dates) is shown alongside the metric values so visitors
   understand the window being applied.

4. **Given** a time period selected, **When** the page renders, **Then** the selected
   period is consistently applied to all metrics — no metric silently uses a different
   window.

5. **Given** a time period for which no activity data exists (e.g., "Current Week"
   on the platform's first day), **When** metrics are computed, **Then** activity-based
   metrics show zero or "—" appropriately — not an error.

---

### User Story 4 — View Comparison Visualizations (Priority: P2)

A visitor can view visual comparisons of the two groups across multiple metric
dimensions, rendered equivalently for both groups.

**Why this priority**: Visual representations (charts, progress bars, comparison
cards) communicate group differences more intuitively than raw numbers alone.

**Independent Test**: Testable by confirming each visualized metric is rendered using
the same chart type and scale for both groups.

**Acceptance Scenarios**:

1. **Given** the Gender War page, **When** visualizations are rendered, **Then**
   at minimum the following dimensions are visualized with equivalent representations
   for both groups: problems solved, hard problems solved, contest rating, active
   users, coding activity, streaks, and contest participation.

2. **Given** a visualization displaying a metric for both groups, **When** rendered,
   **Then** both groups use the same scale, chart type, and visual encoding — no group
   receives a visual advantage through scale manipulation.

3. **Given** a visualization using raw totals, **When** displayed alongside normalised
   metrics, **Then** both representations are labelled clearly so visitors know which
   is total and which is per-participant.

4. **Given** one group having significantly fewer participants than the other,
   **When** visualizations are rendered, **Then** the primary visual encoding uses the
   normalized metric (e.g., average per participant), not the raw total, to avoid
   systematically favouring the larger group.

5. **Given** comparative standing between groups, **When** rendered, **Then** metric-by-metric
   category leaders are visually highlighted without displaying a single binary "Winning Group"
   verdict.

---

### User Story 5 — View Individual Within-Group Leaderboards (Priority: P2)

A visitor can view a ranked list of individual students within each gender group,
sorted by their performance within the group.

**Why this priority**: The within-group leaderboard provides personal ranking context
for each student within their own group, complementing the aggregate comparison.

**Independent Test**: Testable by confirming a student's group rank matches their
position in the within-group sorted list, and that no student appears in the wrong
group's leaderboard.

**Acceptance Scenarios**:

1. **Given** the Gender War page, **When** the within-group leaderboards are rendered,
   **Then** two separate leaderboards are shown — one for Male students, one for
   Female students — each listing only students who belong to that group.

2. **Given** a within-group leaderboard, **When** rendered by default, **Then** the
   top 10 students are displayed on each group panel, with a "View Full Group Leaderboard"
   option supporting paginated navigation (25 or 50 entries per page).

3. **Given** a within-group leaderboard row, **When** rendered, **Then** it displays:
   group rank, student name, avatar, optional batch (if provided), optional branch (if
   provided), total problems solved, Hard problems solved, current contest rating, and
   college rank. Optional fields appear only when the student has provided them.

4. **Given** a within-group leaderboard, **When** rendered, **Then** students are
   ordered by total problems solved descending by default. Ties are broken by Hard
   problems solved (descending), then by college rank (ascending rank number).

5. **Given** a student who is in the Male group, **When** either leaderboard is
   viewed, **Then** the student appears only in the Male leaderboard — not in the
   Female leaderboard, and vice versa.

6. **Given** a within-group leaderboard, **When** a visitor clicks on a student row,
   **Then** they are navigated to that student's public profile page.

---

### User Story 6 — Understand the Comparison Methodology (Priority: P1)

Any visitor can view the exact methodology used to compare the two groups, including
how normalisation is applied and what inputs contribute to each metric.

**Why this priority**: The constitution requires transparent comparisons. An opaque
comparison that favours one group without explanation would be a trust and
integrity failure. The methodology must be as visible as the numbers themselves.

**Independent Test**: Testable by reading the methodology page and independently
reproducing the comparison values from the published formula and the displayed metrics.

**Acceptance Scenarios**:

1. **Given** any visitor on the Gender War page, **When** they access the methodology
   explanation (via link or inline panel), **Then** the explanation lists: which
   metrics are included in the comparison, their calculation definitions, and how
   normalisation is applied.

2. **Given** the methodology explanation, **When** viewed, **Then** it explicitly
   states that the comparison is based on per-participant normalized metrics and does
   not rely solely on raw totals.

3. **Given** the methodology explanation, **When** viewed, **Then** it explicitly
   states that group membership is based exclusively on the student's explicitly
   selected gender and is never inferred.

4. **Given** an administrator changing comparison settings in R7, **When** the page
   is viewed, **Then** the updated methodology is reflected immediately — no stale
   formula is shown.

---

### User Story 7 — Gender Assignment and Group Membership (Priority: P1)

The system assigns students to Gender War groups based exclusively on their
explicitly selected gender value — never by inference, derivation, or any external
signal.

**Why this priority**: The constitution prohibits gender inference. Any violation
here would be a fundamental product integrity failure that cannot be corrected
retroactively.

**Independent Test**: Testable by inspecting every student's group assignment against
their explicitly stored gender field and confirming there are no mismatches.

**Acceptance Scenarios**:

1. **Given** a student who selected "Male" during onboarding, **When** Gender War
   aggregates are computed, **Then** that student's statistics are counted in the
   Male group exclusively.

2. **Given** a student who selected "Female" during onboarding, **When** Gender War
   aggregates are computed, **Then** that student's statistics are counted in the
   Female group exclusively.

3. **Given** any computation, inference, or derivation process within the platform,
   **When** group membership is determined for Gender War, **Then** the process uses
   only the student's stored gender field — never their name, email, avatar, LeetCode
   profile, or any other signal.

4. **Given** a student who changes their gender selection on their profile, **When**
   Gender War aggregates are next computed, **Then** the student's statistics are
   counted entirely in the new group. All time periods reflect the new group
   assignment, including historical periods.

---

### User Story 8 — Gender Change and Historical Attribution (Priority: P2)

When a student changes their gender selection, the platform applies a defined policy
for how historical contributions are attributed.

**Why this priority**: The attribution policy for gender changes must be explicitly
defined — an undocumented assumption here would create unpredictable leaderboard
behaviour and could be perceived as unfair.

**Independent Test**: Testable by having a student change gender and confirming the
old group's aggregates decrease and the new group's aggregates increase by the
student's current statistics, for all time periods simultaneously.

**Acceptance Scenarios**:

1. **Given** a student who was in Group A (e.g., Male) and changes to Group B (Female),
   **When** the next Gender War computation runs, **Then** the student's statistics
   are counted entirely in Group B for all time periods — including Current Week,
   Current Month, Current Semester, Current Academic Year, and All Time.

2. **Given** the same gender change, **When** the next Gender War computation runs,
   **Then** Group A's aggregates no longer include that student's statistics for any
   time period.

3. **Given** the same gender change, **When** viewing the within-group leaderboards,
   **Then** the student appears only in Group B's leaderboard and is absent from
   Group A's leaderboard.

4. **Given** the same gender change, **When** the Gender War page is viewed before
   the next computation runs, **Then** the displayed metrics reflect the state as of
   the last computation — the change takes effect at the next computation cycle, not
   instantaneously mid-display.

---

### User Story 9 — One Group Has Zero Participants (Priority: P1)

The Gender War page displays correctly when one group has no registered participants.

**Why this priority**: This is a guaranteed real-world scenario at platform launch
(before students of both genders have registered). The page must not crash, display
misleading data, or show division-by-zero errors.

**Independent Test**: Testable by viewing the Gender War page when one group has zero
registered students and confirming the page renders gracefully.

**Acceptance Scenarios**:

1. **Given** the Male group has zero participants, **When** the Gender War page is
   viewed, **Then** the Male panel displays "No participants yet" or equivalent for
   all aggregate metrics — no division-by-zero error, no zero displayed as data.

2. **Given** the Female group has zero participants, **When** the Gender War page is
   viewed, **Then** the Female panel displays "No participants yet" or equivalent for
   all aggregate metrics.

3. **Given** one group has zero participants, **When** any normalized metric (average,
   rate per participant) would require dividing by zero, **Then** the metric is shown
   as "—" or "N/A" — not as zero or as an error message.

4. **Given** one group has zero participants, **When** the within-group leaderboard
   for that group is rendered, **Then** an empty state is shown (e.g., "No participants
   yet") — not an empty table with no explanation.

---

### User Story 10 — Stale and Incomplete Data on Gender War (Priority: P2)

The Gender War page communicates clearly when the underlying statistics are stale or
incomplete for one or both groups, without hiding the comparison or showing
fabricated values.

**Why this priority**: Gender War aggregates are derived from student-level
synchronized statistics. Stale or missing data at the student level propagates to the
group level. Visitors must be able to assess data freshness.

**Independent Test**: Testable by deliberately making one group's data stale and
confirming the stale indicator appears on the Gender War page.

**Acceptance Scenarios**:

1. **Given** one or more students in a group whose synchronized data is stale,
   **When** the Gender War page is viewed, **Then** a stale-data indicator is shown
   for the affected group, noting that some participant statistics may not be current.

2. **Given** a student with no successful synchronization (statistics pending),
   **When** Gender War aggregates are computed, **Then** that student is counted in
   their group's participant count but their statistics contribute zero to all
   aggregate totals (rather than being excluded from participant count). A note
   indicates the percentage of participants with pending data if significant.

3. **Given** a student with no contest rating, **When** the average contest rating
   for their group is computed, **Then** that student is excluded from the contest
   rating average denominator — the average is computed only over participants who
   have a confirmed contest rating. The count of rated participants is shown alongside
   the average.

---

### Edge Cases

- **One group has zero participants**: All aggregate metrics for that group show
  "No participants yet" or "—". No division-by-zero errors are permitted. The
  within-group leaderboard shows an empty-state message.

- **Low sample size (<5 participants)**: When a group has fewer than 5 active students,
  a "Low sample size (<5 participants)" informational badge is rendered to warn that
  per-student averages may be disproportionately influenced by outlier individuals.

- **Significantly unequal participant counts**: The comparison methodology MUST use
  normalized metrics (per-participant averages, rates) as the primary comparison basis.
  Raw totals are shown alongside but MUST NOT be the only or primary comparison
  dimension. The participant count disparity MUST be visually prominent.

- **New users joining during an active period**: When a student registers and their
  data has been synchronized during the current week or month, they are included in
  the aggregate for the current period at the next computation cycle. They are not
  retroactively inserted into metrics that have already been displayed — computation
  is batch-based.

- **Gender change — historical attribution**: When a student changes their gender,
  their statistics are attributed entirely to the new group for all time periods at
  the next computation. There is no gender history stored; the platform does not
  attempt to re-attribute historical activity to the old group. This is the defined
  policy (see US8). It is explicitly documented on the methodology page.

- **Gender change — within-group rank**: After a gender change, the student's
  within-group rank is assigned de novo in the new group. Their former rank in the
  old group ceases to exist.

- **Student with no contest rating in average contest rating**: Excluded from the
  denominator of the average contest rating metric. The count of rated participants
  is shown alongside the average (e.g., "Average: 1420 across 12 rated participants").

- **All participants in one group have no contest rating**: The average contest rating
  for that group shows "—" or "No rated participants". It does not show zero.

- **All participants in both groups have no contest rating**: Both panels show "—"
  for contest rating.

- **Ties in the within-group leaderboard**: Primary sort: total problems solved
  (descending). Secondary: hard problems solved (descending). Tertiary: college rank
  (ascending rank number). The tie-breaking rule is documented on the leaderboard.

- **Stale data for a subset of participants**: Stale participants are still counted
  in aggregates using their last known valid statistics. A stale indicator is shown
  for the group if any participant's data is stale.

- **Missing historical data for time-period metrics**: If activity records for a
  selected time period (e.g., Current Week) are unavailable for some participants
  (because sync history does not go back far enough), those participants contribute
  zero to the period's activity metrics, not "unknown".

- **"Current Semester" boundary ambiguity**: The definition of "Current Semester"
  and "Current Academic Year" is a platform-level configuration (start and end dates).
  These dates are displayed to users whenever the period is selected.

- **Gender War page with a single participant in one group**: Valid. That participant's
  individual statistics equal the group's aggregate (average = individual value). A low
  sample size badge is displayed.

- **Student deactivated mid-comparison-period**: A deactivated student is removed from
  all Gender War aggregates immediately. Their statistics are subtracted from the
  group's totals at the next computation cycle.

---

## Requirements *(mandatory)*

### Functional Requirements

**Group Membership and Gender Attribution**

- **FR-401**: The Gender War feature MUST recognise exactly two groups: Male and
  Female. No additional groups or categories MUST be added or implied.

- **FR-402**: Group membership MUST be determined exclusively by the student's
  explicitly stored gender field. Gender MUST NEVER be inferred from name, email,
  avatar, LeetCode profile, or any other source.

- **FR-403**: When a student changes their gender selection, their statistics MUST
  be attributed entirely to the new group for all time periods at the next computation
  cycle. No gender history is stored. All historical period metrics (current week,
  month, semester, academic year, all time) reflect the student's current gender at
  the time of computation.

- **FR-404**: The gender change attribution policy defined in FR-403 MUST be
  documented on the publicly accessible methodology explanation page.

- **FR-405**: A deactivated student MUST be removed from all Gender War aggregates
  at the next computation cycle. Their statistics are no longer included in any group.

**Page Layout and Neutrality**

- **FR-406**: The Gender War page MUST display both groups in a symmetrical layout:
  the same metrics, the same visual structure, and the same level of visual emphasis
  for both groups. Neither group MUST receive a layout, colour scheme, or visual
  weight that implies superiority.

- **FR-407**: The participant count for each group MUST be displayed prominently
  alongside every set of aggregate metrics so that visitors can interpret raw totals
  in the context of group size.

- **FR-408**: The Gender War page MUST NOT contain any of the following features:
  Question of the Week, First Blood, or Batch Wars.

**Aggregate Metrics & Computation Schedule**

- **FR-409**: The following aggregate metrics MUST be computed and displayed for each
  group:
  1. Participant count
  2. Total problems solved
  3. Average problems solved per participant
  4. Total Hard problems solved
  5. Average Hard problems solved per participant
  6. Total Medium problems solved
  7. Average Medium problems solved per participant
  8. Total Easy problems solved
  9. Average Easy problems solved per participant
  10. Average contest rating (over rated participants only; count of rated participants
      shown)
  11. Total contests attended
  12. Average contests attended per participant
  13. Active coders (participants with ≥1 accepted submission or ≥1 contest attended in the selected period)
  14. Recent submissions (total accepted submissions in the selected period)
  15. Average current streak (averaged across all participants in the group)

- **FR-410**: For every metric that is a raw total, the corresponding per-participant
  average MUST also be displayed on the same panel. Raw totals MUST NOT be shown in
  isolation without their normalized counterpart.

- **FR-411**: When a participant's statistics are pending (no successful sync yet),
  that participant is counted in the participant total but contributes zero to all
  statistic aggregates. If a meaningful proportion of participants have pending data,
  a note MUST be shown indicating this.

- **FR-412**: Average contest rating MUST exclude participants with no confirmed
  contest rating from both the numerator and denominator. The count of rated
  participants MUST be displayed alongside the average.

- **FR-413**: When the denominator for any average is zero, the metric MUST be displayed
  as "—" or "N/A" — not as zero and not as a division error.

- **FR-414**: The comparison between groups MUST be based primarily on normalized
  metrics (per-participant averages, rates, percentages). Raw totals MUST be shown
  alongside but MUST NOT be the sole or primary comparison basis.

- **FR-415**: If a group has fewer than 5 active participants, a prominent "Low sample
  size (<5 participants)" informational badge MUST be displayed to contextualize normalized averages.

- **FR-416**: Gender War aggregates and within-group leaderboards MUST be recomputed
  asynchronously after every platform-wide sync batch completion (and at least once every 6 hours),
  with cached results served to users and cache invalidated immediately upon administrator configuration updates.

**Time Period Filtering**

- **FR-417**: The Gender War page MUST provide a time-period selector with the
  following options: Current Week, Current Month, Current Semester, Current Academic
  Year, All Time.

- **FR-418**: The selected time period MUST be applied consistently to all
  activity-based metrics (active coders, recent submissions, average current streak).
  Cumulative statistics (total problems solved, contest rating) always reflect the
  full synchronized dataset.

- **FR-419**: For "Current Semester" and "Current Academic Year", the start and end
  dates defining the period MUST be displayed to users whenever those options are
  selected.

- **FR-420**: When the selected time period yields no activity data for any metric,
  that metric MUST display zero or "—" as appropriate — not an error.

**Comparison Methodology and Multi-Dimensional Presentation**

- **FR-421**: The Gender War page MUST present comparative standing via a multi-dimensional
  category dashboard highlighting metric-by-metric leaders (e.g., higher average problems,
  higher contest rating) without declaring a single binary "Winning Group" verdict.

- **FR-422**: The Gender War page MUST provide a publicly accessible methodology
  explanation documenting metric calculations, normalisation formulas, low-sample-size
  policies, and gender change attribution rules.

- **FR-423**: When an administrator changes comparison configuration in R7, the
  methodology explanation MUST update immediately.

- **FR-424**: The methodology explanation MUST explicitly state that group membership
  is based exclusively on the student's explicitly selected gender field and is never inferred.

**Visualizations**

- **FR-425**: The Gender War page MUST include visual representations of the
  comparison for at minimum: problems solved, hard problems solved, contest rating,
  active users, coding activity, streaks, and contest participation.

- **FR-426**: All visualizations MUST render both groups using the same chart type,
  scale, and visual encoding.

- **FR-427**: Visualizations using raw totals and visualizations using normalized
  metrics MUST be clearly labelled.

**Within-Group Leaderboards**

- **FR-428**: The Gender War page MUST display two within-group leaderboards — one
  for each gender group — showing the Top 10 students by default per panel, with a
  "View Full Group Leaderboard" option supporting paginated navigation (25 or 50 entries per page).

- **FR-429**: Each within-group leaderboard row MUST display: group rank, student
  name, avatar, optional batch (when provided), optional branch (when provided),
  total problems solved, Hard problems solved, current contest rating (shown as "—"
  if absent), and college rank.

- **FR-430**: Within-group leaderboard rows MUST be ordered by total problems solved
  descending. Ties MUST be broken by: (1) hard problems solved descending, (2) college
  rank ascending.

- **FR-431**: A student MUST appear in exactly one within-group leaderboard — the
  one corresponding to their currently stored gender.

- **FR-432**: Each within-group leaderboard row MUST be navigable to the corresponding
  student's public profile page.

- **FR-433**: If a within-group leaderboard contains zero students, an empty-state
  message MUST be shown — not an empty table.

**Stale Data & Excluded Features**

- **FR-434**: If any student in a group has stale synchronized data, the group's panel
  MUST display a stale-data indicator. Stale students remain included in aggregates using
  last known valid data.

- **FR-435**: The Gender War feature MUST NOT include additional gender categories beyond
  Male and Female, automatic gender detection or inference, Question of the Week, First
  Blood, or Batch Wars.

- **FR-436**: The Gender War feature MUST NOT contain any language, visual design, or
  scoring mechanism that implies or asserts that one gender group is inherently better
  than the other.

### Key Entities

- **Gender Group**: A logical grouping of students sharing the same explicitly
  selected gender value (Male | Female). Attributes: gender value, participant count,
  computed aggregate metrics (per time period).

- **Gender War Aggregate**: A computed record of aggregate metrics for one gender
  group in one time period. Recomputed on sync completion and periodically cached.

- **Within-Group Leaderboard Entry**: A ranked record for a single student within
  their gender group. Top 10 rendered inline with paginated expanded view.

- **Time Period**: A named computation window (Current Week | Current Month | Current
  Semester | Current Academic Year | All Time).

- **Low Sample Size Badge**: Informational annotation rendered when group active participant
  count is below 5.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-401**: The Gender War page loads and renders all aggregate metrics, visualizations,
  and within-group leaderboards for both groups within 3 seconds under normal load
  conditions.

- **SC-402**: 100% of aggregate metric values can be independently reproduced by
  computing from the underlying student statistics according to the published formula.

- **SC-403**: For every raw total metric displayed, the corresponding per-participant
  average is also displayed on the same panel — zero raw totals are shown in isolation.

- **SC-404**: All visualizations for both groups use the same scale and chart type.

- **SC-405**: When a student changes their gender, both groups' aggregate metrics
  reflect the change within one computation cycle of the change being saved.

- **SC-406**: The Gender War page renders without error when either group has zero
  participants.

- **SC-407**: Average contest rating is computed only over rated participants, and
  the count of rated participants is displayed alongside the average.

- **SC-408**: The methodology explanation page accurately reflects current calculation
  rules within 60 seconds of any admin configuration change.

- **SC-409**: Within-group leaderboards contain exclusively students belonging to the
  correct gender group — zero cross-group contamination.

---

## Assumptions

- The Gender War page is publicly accessible without authentication.
- "Accepted submissions" is the activity unit for "recent submissions".
- "Active coders" includes any participant with ≥1 accepted submission OR ≥1 contest attended in the period.
- Aggregates are computed in batch and cached, invalidated after synchronization batches.
- The platform does not declare a single binary "winner", presenting multi-dimensional comparisons instead.
- Gender change attribution re-attributes all statistics to the new group at calculation time without storing historical gender states.
