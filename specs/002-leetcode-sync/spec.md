# Feature Specification: LeetCode Integration & Coding Data Synchronization

**Feature Branch**: `002-leetcode-sync`

**Created**: 2026-09-17

**Status**: Draft

**Roadmap Entry**: R2 — LeetCode Integration & Coding Data
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — Connect a LeetCode Username (Priority: P1)

A registered, verified student provides their LeetCode username on the platform so
that the system can begin retrieving their coding statistics. This connection is the
gateway to all coding data on the platform.

**Why this priority**: Without a connected LeetCode username, no coding data can be
retrieved. This is the prerequisite for every subsequent feature in R2 and for the
student's appearance on the leaderboard (R3).

**Independent Test**: Testable by submitting a LeetCode username and confirming the
system stores it and schedules an initial synchronization.

**Acceptance Scenarios**:

1. **Given** a logged-in student who has not yet connected a LeetCode username,
   **When** they navigate to their profile or settings, **Then** they are presented
   with an option to connect a LeetCode username.

2. **Given** a logged-in student who submits a LeetCode username, **When** the
   username is syntactically valid (non-empty, within length limits), **Then** the
   system stores the username and marks the student's LeetCode connection as pending
   initial synchronization.

3. **Given** a student who submits a LeetCode username that cannot be resolved on
   LeetCode (does not exist or is private), **When** the first synchronization
   attempt runs, **Then** the system marks the connection status as "unresolvable"
   and surfaces the error to the student without storing any fabricated statistics.

4. **Given** a student who has not yet had a successful synchronization, **When**
   their public profile is viewed, **Then** coding statistics are shown as "Not yet
   available" — not as zeros.

---

### User Story 2 — View Synchronization Status (Priority: P1)

A student can see the current state of their LeetCode data synchronization: whether
it is pending, in progress, successful, stale, or in an error state.

**Why this priority**: Students need to understand whether their displayed statistics
are current, outdated, or unavailable due to a problem — without this, they cannot
trust the data shown on the leaderboard or their own profile.

**Independent Test**: Testable by inspecting a student's profile or settings view
after each possible sync state transition.

**Acceptance Scenarios**:

1. **Given** a student whose sync has never run successfully, **When** they view
   their profile or settings, **Then** the sync status is shown as "Pending" or
   "Never synced".

2. **Given** a student whose last sync completed successfully, **When** they view
   their profile or settings, **Then** the status shows "Last synced [timestamp]"
   indicating when the most recent successful sync occurred.

3. **Given** a student whose last sync attempt failed, **When** they view their
   profile or settings, **Then** the status shows "Sync error" or equivalent, along
   with the timestamp of the last successful sync if one exists. The reason for the
   error is surfaced in a user-friendly form (e.g., "LeetCode username not found",
   "LeetCode service unavailable").

4. **Given** a student whose last successful sync was more than a defined staleness
   threshold ago, **When** they view their profile or settings, **Then** the status
   shows a "Data may be outdated" indicator alongside the last-synced timestamp.

5. **Given** a student whose sync is currently in progress, **When** they view their
   profile or settings, **Then** the status shows "Sync in progress" or equivalent.

---

### User Story 3 — Automatic Periodic Synchronization (Priority: P1)

The system automatically retrieves updated LeetCode statistics for all connected
students on a recurring schedule without any user action required.

**Why this priority**: The leaderboard, Gender War, and achievements must reflect
reasonably current data. Manual-only sync would make the platform unusable at scale.

**Independent Test**: Testable by observing that a student's statistics update without
any user-initiated action, within the expected sync window.

**Acceptance Scenarios**:

1. **Given** a student with a connected, resolvable LeetCode username, **When** the
   scheduled synchronization runs, **Then** the system fetches updated statistics
   from LeetCode and stores them, updating the student's coding profile.

2. **Given** the synchronization schedule, **When** operating under normal conditions,
   **Then** each student's data is refreshed at an interval of approximately 15 minutes
   (the interval may vary due to rate limiting, queue depth, or upstream availability,
   but MUST not be shorter than the minimum safe polling interval).

3. **Given** a student who has just had a successful sync, **When** the next scheduled
   sync runs, **Then** the statistics are updated to reflect any changes since the
   last sync.

4. **Given** the synchronization system, **When** it runs a sync cycle for all
   students, **Then** the total number of successfully synchronized profiles in that
   cycle is tracked and available for administrative review (R7 scope for display).

---

### User Story 4 — Failed Sync Does Not Destroy Valid Data (Priority: P1)

When a synchronization attempt fails for any reason, the student's previously
successful synchronization data must remain intact and continue to be displayed.

**Why this priority**: This is a constitutional data-integrity requirement. A
transient upstream failure must never corrupt or blank a student's standing data.
This is the most critical resilience rule in the entire sync system.

**Independent Test**: Testable by simulating a sync failure and confirming that
previously stored statistics are unchanged and still displayed.

**Acceptance Scenarios**:

1. **Given** a student with valid, previously synced statistics, **When** a sync
   attempt fails due to LeetCode being unreachable, **Then** the student's stored
   statistics remain exactly as they were before the failed attempt.

2. **Given** a student with valid, previously synced statistics, **When** a sync
   attempt returns a malformed or incomplete response, **Then** the student's stored
   statistics remain unchanged and the malformed response is discarded.

3. **Given** a student with valid, previously synced statistics, **When** a sync
   attempt returns an empty result (e.g., LeetCode returns zero problems solved for a
   student who previously had hundreds), **Then** the system does not overwrite the
   stored statistics with the empty result. Instead, it flags the result as suspicious
   and retains the last known valid values until a consistent result is confirmed.

4. **Given** a student with valid, previously synced statistics, **When** a sync
   attempt is rate-limited by LeetCode, **Then** the sync is rescheduled according
   to the rate-limit signal and the existing statistics remain displayed.

---

### User Story 5 — LeetCode Username Change (Priority: P2)

A student updates their connected LeetCode username after discovering they entered the
wrong one, or after legitimately changing their LeetCode handle.

**Why this priority**: Usernames can be mistyped at registration. Without a correction
mechanism, a student with the wrong username cannot participate in the leaderboard.

**Independent Test**: Testable by changing a LeetCode username and confirming old
data is cleared, a new sync is triggered, and new statistics are fetched.

**Acceptance Scenarios**:

1. **Given** a student who changes their LeetCode username in their profile, **When**
   the change is saved, **Then** all previously synchronized statistics associated
   with the old username are cleared, the new username is stored, and an initial
   synchronization for the new username is scheduled.

2. **Given** a student who changes their LeetCode username to one that does not exist,
   **When** the synchronization attempt runs for the new username, **Then** the sync
   marks the connection as unresolvable and the student's statistics are shown as
   "Not yet available" (not populated with stale data from the previous username).

3. **Given** a student who changes their LeetCode username to the same value it was
   before, **When** the change is saved, **Then** the system treats it as a no-op:
   existing statistics are preserved and no unnecessary re-sync is triggered.

4. **Given** a student who changes their LeetCode username, **When** viewing their
   profile between the username change and the first successful sync of the new
   username, **Then** statistics show "Pending sync" rather than the old username's
   data.

---

### User Story 6 — Non-Existent or Deleted LeetCode Account (Priority: P1)

The system must handle gracefully the case where a student's LeetCode username does
not resolve to a valid, accessible public account — whether due to a typo, a deleted
account, or a private account.

**Why this priority**: This scenario is common (typos during registration, accounts
later deleted or made private) and must not cause data corruption or misleading
displays.

**Independent Test**: Testable by connecting a non-existent LeetCode username and
confirming the error state is surfaced without fabricating data.

**Acceptance Scenarios**:

1. **Given** a student with a connected LeetCode username that no longer resolves
   (account deleted, renamed, or made private), **When** a synchronization attempt
   runs, **Then** the system records the failure reason as "account unavailable" and
   marks the connection status accordingly.

2. **Given** a student whose LeetCode connection is in the "account unavailable"
   state, **When** their public profile is viewed, **Then** coding statistics that
   were last successfully synced continue to be shown, marked with a stale indicator,
   until the student updates their username or the account becomes available again.

3. **Given** a student whose LeetCode connection is in the "account unavailable"
   state, **When** subsequent sync cycles run, **Then** the system continues retrying
   at a reduced frequency (rather than retrying at full rate) and does not discard
   previously valid data.

4. **Given** a student whose LeetCode connection has been in the "account unavailable"
   state for an extended period, **When** an administrator reviews the platform,
   **Then** such accounts are visible in the admin sync-error dashboard (R7 scope for
   display).

---

### User Story 7 — Coding Statistics Display (Priority: P1)

A student's synchronized LeetCode statistics are displayed accurately on their public
profile, and these statistics cannot be manually edited by the student.

**Why this priority**: The leaderboard and profile views are the primary value surface
of the platform; they must show real, externally verified data.

**Independent Test**: Testable by verifying displayed statistics match externally
retrieved values, and by confirming no user-editable field exists for these stats.

**Acceptance Scenarios**:

1. **Given** a student with a successful synchronization, **When** their public
   profile is viewed, **Then** the following statistics are displayed where available:
   total problems solved, easy/medium/hard breakdown, acceptance rate (if retrievable),
   global LeetCode rank, contest rating, highest contest rating, and contest count.

2. **Given** a student's profile page, **When** any visitor attempts to find an
   editable field for synchronized statistics, **Then** no such field exists in any
   user-facing interface.

3. **Given** a student with a successful synchronization, **When** any of their
   statistics are updated by a subsequent sync, **Then** the updated values are
   reflected on the profile and leaderboard without requiring any user action.

4. **Given** a statistic that is not available for a particular student (e.g., no
   contest participation), **When** their profile is viewed, **Then** that statistic
   is shown as "N/A" or omitted — not as zero.

---

### User Story 8 — Activity Heatmap Data (Priority: P2)

The system preserves historical daily activity data sufficient to render a submission
activity calendar (heatmap) on a student's profile.

**Why this priority**: The activity heatmap is a core profile feature (R4 scope for
rendering) and requires historical per-day submission counts that must be accumulated
over time, not computed on demand.

**Independent Test**: Testable by confirming that daily submission counts for past
dates are stored and retrievable, and that successive syncs accumulate (not overwrite)
historical entries.

**Acceptance Scenarios**:

1. **Given** a student with historical LeetCode activity, **When** the first
   synchronization runs, **Then** available historical daily submission counts are
   retrieved and stored per calendar day.

2. **Given** a student with already-stored activity history, **When** a subsequent
   synchronization runs, **Then** new activity entries are added for new dates and
   existing entries are updated if the source provides revised counts — historical
   entries for past dates that were not returned by the latest sync are preserved,
   not deleted.

3. **Given** a student's activity data stored by the system, **When** the profile's
   activity heatmap is rendered (R4), **Then** the data covers at least the past
   12 months of calendar days where submission activity was recorded.

---

### User Story 9 — Recent Submissions Feed (Priority: P2)

The system stores recent submission records sufficient to populate a "recent activity
feed" showing individual problem attempts.

**Why this priority**: The recent activity feed (R4 scope for rendering) requires
per-submission records with problem name, difficulty, verdict, and timestamp.

**Independent Test**: Testable by confirming recent submission records are stored with
the required attributes after a sync.

**Acceptance Scenarios**:

1. **Given** a student with recent LeetCode activity, **When** a synchronization
   runs, **Then** available recent submission records are stored with: problem name,
   problem difficulty, problem URL, submission verdict (accepted/rejected), and
   submission timestamp.

2. **Given** a student with an existing set of stored submission records, **When** a
   subsequent sync returns submissions that overlap with already-stored records,
   **Then** the system deduplicates: existing records are not duplicated if the
   same submission (identified by a stable external identifier or by the combination
   of problem + timestamp) is returned again.

3. **Given** a student whose LeetCode account has no recent submissions, **When** a
   sync runs and returns no recent activity, **Then** existing stored submission
   records are preserved (not cleared).

---

### User Story 10 — Stale Data Handling (Priority: P2)

The system communicates to users and consumers when displayed statistics are older than
a defined staleness threshold.

**Why this priority**: Consumers of statistics (leaderboard, Gender War, achievements)
must know whether to treat data as current or potentially outdated — this is required
for transparent ranking.

**Independent Test**: Testable by preventing syncs for a defined period and confirming
the stale indicator appears after the threshold is crossed.

**Acceptance Scenarios**:

1. **Given** a student whose last successful sync is older than the staleness
   threshold, **When** their profile or leaderboard entry is viewed, **Then** a
   visible "data may be outdated" indicator is shown alongside the last-synced
   timestamp.

2. **Given** a student whose data is stale, **When** the ranking system computes
   their college rank, **Then** stale data is still used for ranking (ranking is not
   withheld solely because data is stale), but the stale indicator is surfaced.

3. **Given** a student whose data was stale but has now been successfully re-synced,
   **When** their profile is viewed, **Then** the stale indicator is removed and the
   updated last-synced timestamp is shown.

---

### User Story 11 — Duplicate Submission and Record Handling (Priority: P2)

The system explicitly defines how it handles duplicate data returned by the external
source across successive synchronization runs.

**Why this priority**: Sync cycles can return overlapping data windows. Without
explicit deduplication rules, statistics and activity counts can be inflated, corrupting
rankings and achievement calculations.

**Independent Test**: Testable by running two consecutive syncs against the same
static data set and confirming aggregate statistics and record counts do not change.

**Acceptance Scenarios**:

1. **Given** two consecutive synchronization runs that return identical aggregate
   statistics (same total solved, same contest rating), **When** both syncs complete,
   **Then** the stored aggregate statistics are identical to a single sync — no
   duplication of counts.

2. **Given** two consecutive sync runs where the second returns a submission record
   already stored from the first, **When** both syncs complete, **Then** the
   submission appears exactly once in the stored records.

3. **Given** two consecutive sync runs where the second returns updated aggregate
   totals (e.g., total solved increased from 50 to 52), **When** both syncs complete,
   **Then** the stored totals reflect the latest values (52), not the sum (102).

---

### Edge Cases

- **LeetCode username with leading or trailing whitespace**: Usernames submitted with
  surrounding whitespace must be trimmed before storage and sync. A username composed
  entirely of whitespace must be rejected.

- **LeetCode username case sensitivity**: The system must store and use the username
  in the casing provided by the user. If LeetCode treats usernames case-insensitively,
  this must not cause a failed lookup; the stored casing is preserved for display.

- **Sync returns partial data for some fields**: If a sync response includes some
  fields but omits others (e.g., returns total solved but not contest rating), the
  system must update only the fields that were returned and preserve the last known
  values for fields that were absent. It must not null-out fields missing from a
  partial response.

- **Sync returns a dramatic drop in statistics**: If a sync reports significantly
  fewer problems solved than the previous sync (e.g., 200 → 0 or 200 → 10), the
  system must treat this as a suspicious result, retain the last valid values, flag
  the record for review, and not overwrite stored statistics until a consistent
  result is seen across a defined number of consecutive syncs.

- **Rate limiting mid-cycle**: If rate limiting occurs partway through a sync cycle
  (after some students have been synced but before others), the system must record
  which students were successfully synced and resume the remaining students in the
  next cycle without re-syncing already-completed students unnecessarily.

- **LeetCode API returns HTTP error codes**: HTTP 4xx and 5xx responses must be
  treated as transient or permanent failures (depending on the code) and must never
  trigger overwriting of valid data.

- **Student with zero legitimate activity**: A student who has genuinely solved zero
  problems on LeetCode must be distinguishable from a student whose sync has never
  run. "Zero problems solved" is only stored after a successful sync confirms this.

- **Duplicate LeetCode username across two platform accounts**: If two registered
  platform students submit the same LeetCode username, the system must detect the
  conflict and flag both accounts for review without silently associating one
  student's statistics with another. Each LeetCode username must be associated with
  at most one platform account at a time.

- **Sync during username change**: If a sync cycle begins for a student at the same
  time the student changes their LeetCode username, the system must ensure the sync
  result is applied only to the username that was active when the sync began. The
  new username's sync must be a separate, subsequent operation.

- **Historical activity data beyond what the source returns**: If the LeetCode source
  only returns activity for the last N days, activity older than that window is
  preserved from previous syncs and not deleted.

- **Submission record with no problem URL**: If a submission record does not include
  a problem URL, it is still stored with all other available fields. The URL field
  is treated as optional within a submission record.

- **Contest rating of zero**: A contest rating of zero is a valid value for a student
  who has never participated in a contest. It must not be treated as missing data.
  However, it must not be stored from a sync that returned no contest data — only
  from a sync that explicitly confirmed no contest participation.

- **Clock skew between sync timestamps**: Submission timestamps from LeetCode may
  differ from the platform's clock. The platform must store LeetCode-reported
  timestamps as-is, without adjusting for time zones beyond any mapping required for
  consistent calendar-day assignment.

- **Network timeout during sync**: A sync that times out partway through must be
  treated as a failed attempt. No partial writes to the stored statistics are made;
  the previously valid data remains.

---

## Requirements *(mandatory)*

### Functional Requirements

**LeetCode Username Association**

- **FR-101**: The system MUST allow a registered, verified student to associate a
  LeetCode username with their platform account. This association is stored on the
  student's profile.

- **FR-102**: A LeetCode username, once submitted, MUST be trimmed of leading and
  trailing whitespace before storage. A whitespace-only username MUST be rejected.

- **FR-103**: Each LeetCode username MUST be associated with at most one platform
  account at any given time. If a username is already associated with another account,
  the system MUST flag the conflict and surface it for administrative review without
  silently overwriting the existing association.

- **FR-104**: A student MUST be able to update their LeetCode username. When a
  username is changed, all statistics and activity data associated with the old
  username MUST be cleared. An initial synchronization MUST be scheduled for the
  new username immediately.

- **FR-105**: If a student changes their LeetCode username to the same value (no
  change), the system MUST treat this as a no-op and preserve existing data.

**Synchronization Scheduling**

- **FR-106**: The system MUST automatically synchronize LeetCode statistics for all
  students with a connected username on a recurring schedule. The target interval is
  approximately 15 minutes per student, subject to rate-limit constraints.

- **FR-107**: The synchronization schedule MUST NOT be shorter than the minimum safe
  polling interval required to avoid being blocked by the external source. This
  minimum interval takes precedence over the 15-minute target.

- **FR-108**: The system MUST schedule an initial synchronization for a student
  immediately after they connect or update their LeetCode username.

**Synchronization Resilience**

- **FR-109**: A failed synchronization attempt MUST NOT overwrite or clear any
  previously successfully synchronized statistics. The last known valid data MUST
  be preserved in its entirety.

- **FR-110**: A synchronization attempt that returns a malformed, unparseable, or
  structurally invalid response MUST be discarded without modifying stored data.

- **FR-111**: A synchronization attempt that returns an empty result (zero for all
  fields) for a student who previously had non-zero statistics MUST be treated as
  suspicious. The system MUST retain previous values and flag the result for review.

- **FR-112**: A synchronization attempt that returns a dramatically lower total
  (a reduction exceeding a defined threshold, e.g., more than 20% decrease in total
  problems solved) MUST be treated as suspicious, retained as a candidate value,
  and the previous value preserved until a consistent result is confirmed over a
  defined number of successive syncs.

- **FR-113**: When the external source returns a rate-limit signal, the system MUST
  back off for the indicated or a safe default duration before retrying. The
  backoff MUST be recorded as a sync event.

- **FR-114**: When the external source is unreachable due to network failure or service
  unavailability, the system MUST retry with exponential backoff. The retry schedule
  is a configuration detail for the implementation plan.

- **FR-115**: A synchronization attempt that returns a partial response (some fields
  present, others absent) MUST update only the fields that were returned. Fields
  absent from the response MUST retain their last known valid values.

- **FR-116**: A synchronization that times out before receiving a complete response
  MUST be treated as a failed attempt. No partial writes to stored statistics are
  permitted.

**Synchronization Status Tracking**

- **FR-117**: The system MUST record the following for each student's LeetCode
  connection:
  - timestamp of the last synchronization attempt (successful or failed)
  - timestamp of the last successful synchronization
  - current synchronization status: one of Pending, In Progress, Synced, Stale,
    Error, Unresolvable
  - the error reason for the most recent failed attempt (in user-readable form)

- **FR-118**: The system MUST track, per synchronization cycle, the count of
  student profiles that were successfully synchronized. This metric MUST be
  available for administrative review (R7 scope for display).

- **FR-119**: A student's sync status MUST be visible to the student on their own
  profile or account settings page.

- **FR-120**: A student's data MUST be marked as stale when the time elapsed since
  the last successful synchronization exceeds a defined staleness threshold. The
  staleness threshold is a configurable value (default: 1 hour).

**Statistics Tracked**

- **FR-121**: Upon each successful synchronization, the system MUST store the
  following aggregate statistics where they are obtainable from the external source:
  - total problems solved
  - easy problems solved
  - medium problems solved
  - hard problems solved
  - global LeetCode rank
  - contest rating (current)
  - highest contest rating (all-time peak)
  - total contests attended

- **FR-122**: A statistic that is absent from a successful sync response MUST be
  stored as "not available" rather than zero, so that genuine zeroes can be
  distinguished from missing data.

- **FR-123**: A student MUST NOT be able to manually edit, override, or delete any
  synchronized statistic through any user-facing interface.

**Historical Activity Data**

- **FR-124**: The system MUST store per-calendar-day submission activity counts
  (number of submissions per day) as returned by the external source. This data
  is used for the activity heatmap (rendered in R4).

- **FR-125**: Historical activity entries for past dates MUST be preserved across
  successive synchronizations. A sync that does not return data for a past date
  MUST NOT delete or zero the stored entry for that date.

- **FR-126**: New activity entries returned by a sync MUST be merged with the
  existing activity history, not replace it.

**Submission Records**

- **FR-127**: The system MUST store individual recent submission records as returned
  by the external source, including where available: problem name, problem difficulty,
  problem URL (optional), submission verdict (accepted or not), and submission
  timestamp.

- **FR-128**: Submission records MUST be deduplicated: if a sync returns a submission
  that is already stored (identified by a stable external submission identifier, or
  by the combination of LeetCode username + problem identifier + timestamp), the
  existing record is preserved and not duplicated.

- **FR-129**: Stored submission records MUST NOT be deleted when a sync returns an
  empty recent-submissions list.

**Non-Existent and Unavailable Accounts**

- **FR-130**: If a synchronization attempt cannot resolve the LeetCode username
  (account not found, account private, or account deleted), the system MUST:
  - record the failure reason as "account unavailable"
  - mark the connection status as "Unresolvable"
  - preserve all previously synchronized data
  - reduce the retry frequency for this student to avoid unnecessary external calls

- **FR-131**: A student whose LeetCode connection is in the "Unresolvable" state MUST
  be shown a user-readable message on their profile or settings indicating that their
  LeetCode username could not be found, along with a prompt to update it.

- **FR-132**: When a student updates their LeetCode username from an unresolvable one
  to a new value, the connection status MUST be reset to Pending and a new initial
  synchronization scheduled.

**Stale Data**

- **FR-133**: When a student's data is marked stale, their statistics continue to be
  used in all calculations (ranking, Gender War, achievements) until fresher data
  is available. Staleness must not exclude a student from the leaderboard.

- **FR-134**: Stale data MUST be visibly indicated on the student's public profile
  and on any leaderboard or comparison view that surfaces their statistics.

**Data Integrity**

- **FR-135**: All synchronized statistics MUST be attributed to the external source
  (LeetCode). The system must never store statistics sourced from user input in the
  statistics fields reserved for external data.

- **FR-136**: The system must clearly separate the following data concerns in its
  data model:
  - user-entered identity (LeetCode username, stored on profile — editable)
  - externally synchronized statistics (immutable by users)
  - synchronization metadata (status, timestamps, error log)
  - historical activity records
  - submission records

### Key Entities

- **LeetCode Connection**: Represents a student's association with a LeetCode account.
  Attributes: platform account reference, LeetCode username (trimmed, stored as
  provided), connection status (Pending | In Progress | Synced | Stale | Error |
  Unresolvable), last sync attempt timestamp, last successful sync timestamp, last
  error reason.

- **Coding Snapshot**: The latest aggregate statistics for a student retrieved from
  LeetCode. Attributes: total solved, easy solved, medium solved, hard solved,
  global LeetCode rank, contest rating, highest contest rating, contests attended.
  Each field stores either a numeric value or a "not available" sentinel. Snapshots
  are immutable by users.

- **Sync Record**: A log entry for a single synchronization attempt. Attributes:
  student reference, attempt timestamp, outcome (success | failure), failure reason
  (if failed), number of fields updated.

- **Activity Entry**: A per-calendar-day record of submission activity. Attributes:
  student reference, calendar date, submission count for that date. Activity entries
  are accumulated across sync runs; existing entries are preserved and updated, not
  deleted.

- **Submission Record**: A record of an individual LeetCode submission. Attributes:
  student reference, external submission identifier (if available), problem name,
  problem difficulty (Easy | Medium | Hard | Unknown), problem URL (optional),
  submission verdict (Accepted | Not Accepted), submission timestamp (as reported
  by external source).

- **Sync Cycle**: A system-level record of a complete synchronization pass across
  all students. Attributes: cycle start timestamp, cycle end timestamp, count of
  students attempted, count of students successfully synced, count of failures.

- **Staleness Marker**: A derived status attached to a Coding Snapshot or LeetCode
  Connection indicating that the data has not been refreshed within the configured
  staleness threshold. Not a separate stored entity — derived from the last successful
  sync timestamp vs. the current time.

- **Conflict Record**: Created when two platform accounts submit the same LeetCode
  username. Attributes: conflicting username, account references of both claimants,
  detection timestamp, resolution status (Unresolved | Resolved). Used for
  administrative review (R7 scope for display).

- **Suspicious Sync Flag**: A flag applied when a sync returns data that diverges
  significantly from the previous snapshot (e.g., dramatic drop in solved count or
  empty result for a previously active student). Attributes: student reference,
  sync record reference, candidate values returned, previous values retained,
  flag timestamp, resolution (auto-resolved after consistent confirmations |
  manually cleared).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-101**: A student's LeetCode statistics are updated within 20 minutes of a
  successful solve under normal operating conditions (accounting for the 15-minute
  sync interval plus processing time).

- **SC-102**: Zero previously valid statistics are overwritten with empty, null, or
  dramatically lower values as a direct result of a failed or suspicious sync
  attempt, verified by testing sync failure scenarios against students with
  existing data.

- **SC-103**: 100% of displayed coding statistics on public profiles and leaderboard
  rows are attributable to a recorded, timestamped successful synchronization — no
  user-entered values appear in statistics fields.

- **SC-104**: A student's synchronization status (pending, synced, stale, error) is
  accurately reflected on their profile within 60 seconds of a status change.

- **SC-105**: When two consecutive sync cycles return identical data, the stored
  statistics and submission record count remain unchanged — duplication is zero,
  verified by comparing stored records before and after the second sync.

- **SC-106**: A student whose LeetCode account becomes unavailable (deleted or made
  private) has their last valid statistics preserved and displayed with a stale
  indicator; no statistics are blanked as a result of the account becoming
  unavailable.

- **SC-107**: Historical activity data accumulated over at least 12 months is
  preserved across successive sync cycles without loss, confirmed by verifying that
  activity entries for dates older than the current sync window are not deleted.

- **SC-108**: A LeetCode username conflict (same username on two platform accounts)
  is detected within one sync cycle and flagged without silently associating the
  username's statistics with either account.

- **SC-109**: The system continues to display last-known valid statistics for all
  students when the LeetCode service is fully unavailable for up to 2 hours — no
  student is removed from the leaderboard or shown zeroed statistics during the
  outage.

---

## Assumptions

- The LeetCode data source is a public or semi-public interface. The specific API
  (REST, GraphQL, scraping) is not assumed here and will be confirmed during the
  implementation plan research phase for R2.

- The fields listed in FR-121 are retrievable from the LeetCode source under normal
  conditions. If any field is discovered to be unavailable during implementation
  research, the specification will be updated before implementation begins.

- Synchronization of all connected students within a 15-minute window assumes
  that the total student population is within a volume that the rate limits permit.
  If the population grows beyond this, the sync strategy (batching, priority queuing)
  will be addressed in the implementation plan.

- Activity data availability from LeetCode is bounded by what the source exposes.
  The system will store what is available; it will not backfill data that the
  source does not provide.

- Submission records are stored as a rolling window of recent activity (exact window
  size to be determined in implementation plan based on source availability), not as
  an exhaustive all-time history. Historical aggregate statistics (total solved, etc.)
  are stored as current snapshots.

- The staleness threshold (default: 1 hour) and suspicious-drop threshold (default:
  20% reduction in total solved) are configurable values defined in the implementation
  plan. The spec defines the behaviour; the exact thresholds are tunable.

- The determination of whether a sync response constitutes a "consistent confirmation"
  of a suspicious result (FR-112) — i.e., how many consecutive confirmations are
  required before accepting a dramatic drop — is a configurable parameter to be
  defined in the implementation plan.

- Administrative visibility into sync errors, conflict records, and cycle metrics
  is defined as R7 scope. R2 only produces the data; R7 provides the admin UI.
