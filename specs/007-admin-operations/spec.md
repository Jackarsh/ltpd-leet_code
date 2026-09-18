# Feature Specification: Administration & Platform Operations

**Feature Branch**: `007-admin-operations`

**Created**: 2026-09-17  
**Last Updated**: 2026-09-17 (post-clarify)

**Status**: Draft

**Roadmap Entry**: R7 — Administration & Platform Operations  
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## Clarifications

### Session 2026-09-17

- Q: When an administrator resolves a LeetCode handle conflict by unlinking the handle from a duplicate account, what happens to that duplicate account's existing platform profile and historical statistics? → A: Unlink handle, clear synced metrics to 0/unlinked, and retain the account active in a "Pending LeetCode Link" state so the student can connect their correct handle without losing their platform login.
- Q: If an administrator updates the unlock conditions or archives an existing achievement, how are students who previously unlocked that badge affected? → A: Grandfather earned badges: existing recipients retain their earned achievement badge and unlock timestamp; future evaluations apply the new criteria. Archived badges remain in recipients' collections with an "Archived" badge status indicator.
- Q: When an administrator triggers a manual batch platform sync, how does it interact with the regular background cron synchronization schedule? → A: Manual batch sync pauses or merges with the scheduled cron queue, runs through throttled worker pools to avoid LeetCode IP rate-limiting, and broadcasts a live progress status bar in the admin dashboard.
- Q: What exact data retention and anonymization lifecycle applies when an administrator disables or soft-deletes a student account? → A: Soft-disable with immediate removal from all public leaderboards, Gender War totals, and search indices, retaining database records for audit logs and student appeal / re-activation.
- Q: Which specific administrative operations require step-up confirmation or Super Administrator privilege? → A: Batch platform synchronization, global academic year boundary updates, administrator role grants/revocations, and bulk account status modifications require Super Administrator privilege plus explicit text confirmation (e.g. typing "CONFIRM").

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — User Account Management and Moderation (Priority: P1)

An authorized administrator can search, inspect, update profile metadata, and disable abusive or inactive student accounts without compromising raw historical sync data.

**Why this priority**: Operational control is essential to maintain data quality, resolve student profile mistakes, handle student requests, and moderate malicious accounts.

**Independent Test**: Testable by logging in as an administrator, searching for a user, editing an editable profile field (such as correcting branch or display name), disabling the account, and confirming the student is immediately hidden from public leaderboards.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator with User Management permissions, **When** accessing the User Management dashboard, **Then** they can view a paginated, filterable, and searchable list of all registered users displaying: display name, email, LeetCode username, gender, branch, batch, registration date, account status (Active | Disabled), and last sync timestamp.

2. **Given** a user with incorrect profile details, **When** an administrator edits the user, **Then** they can modify: display name, branch, batch, and gender.

3. **Given** an administrator editing a user, **When** reviewing the interface, **Then** synchronized coding statistics (total problems solved, difficulty counts, contest rating, streak, contest history) are strictly READ-ONLY and cannot be manually overridden or falsified.

4. **Given** a problematic or deactivated student account, **When** an administrator toggles the account to "Disabled", **Then** the student's active sessions are terminated, login is blocked, and the student is removed from public college leaderboards and Gender War aggregates at the next computation cycle while retaining audit records.

---

### User Story 2 — Duplicate Account Detection and Resolution (Priority: P1)

An administrator can identify potential duplicate accounts (e.g. multiple registrations claiming the same LeetCode username or institutional email) and resolve them safely.

**Why this priority**: Multiple accounts sharing the same LeetCode username or duplicate student identities distort leaderboard accuracy and undermine fair competition.

**Independent Test**: Testable by inspecting the Duplicates & Conflicts queue, selecting conflicting accounts, and resolving the conflict via account deactivation or username unlinking.

**Acceptance Scenarios**:

1. **Given** the administrative dashboard, **When** a student attempts to register or link a LeetCode username already claimed by another active user, **Then** the platform flags the conflict in an administrative "Account Conflicts & Duplicates" queue.

2. **Given** an administrator reviewing a duplicate conflict, **When** inspecting the records, **Then** they can compare registration dates, emails, activity logs, and last sync timestamps of both accounts.

3. **Given** an administrator resolving a duplicate conflict, **When** they decide the rightful owner, **Then** they can unlink the contested LeetCode handle from the secondary account, resetting that secondary account's metrics to 0 and placing it in a "Pending LeetCode Link" state so the student can link their actual username.

---

### User Story 3 — Achievement Configuration Engine (Priority: P1)

An administrator can create, update, categorize, and activate configurable achievement badges with programmatic unlocking rules without modifying source code.

**Why this priority**: Configurable gamification incentives motivate student engagement over time. Administrators need flexibility to launch seasonal or milestone badges.

**Independent Test**: Testable by defining a new achievement with a specific condition (e.g. `total_solved >= 100 AND hard_solved >= 10`), verifying rule syntax validation, publishing the badge, and verifying eligible students receive it during the next achievement evaluation cycle.

**Acceptance Scenarios**:

1. **Given** an administrator in the Achievement Studio, **When** creating a new achievement, **Then** they must supply:
   - Achievement Name (unique, 3–50 chars)
   - Description (10–250 chars)
   - Category (e.g., Problem Solving, Difficulty Mastery, Contest Prowess, Consistency & Streaks)
   - Badge Icon / Visual Asset (vector icon identifier or uploaded SVG)
   - Unlock Condition (structured rule definition based on verified statistics)
   - Rarity Level / Points weighting
   - Active Status (Draft | Published | Archived)

2. **Given** an administrator entering an unlock condition, **When** saving the achievement, **Then** the system validates condition syntax against an allowed schema of verified metric variables (`total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `contest_rating`, `contests_attended`, `current_streak`, `longest_streak`) and rejects circular, undefined, or invalid expressions.

3. **Given** an achievement definition modified or archived, **When** saved, **Then** existing unlocked badges for historical recipients are permanently preserved (grandfathered with original unlock dates), while future evaluations use the updated criteria.

---

### User Story 4 — Synchronization Health Monitoring & Manual Operations (Priority: P1)

An administrator can monitor background synchronization performance, inspect rate-limiting and error logs, and trigger manual synchronization for specific users or batches.

**Why this priority**: LeetCode data sync is the lifeblood of the platform. Administrators must have operational visibility into queue health, API throttle limits, and failed sync jobs.

**Independent Test**: Testable by checking the Sync Operations console, inspecting failure logs, and manually triggering an on-demand sync for a test user.

**Acceptance Scenarios**:

1. **Given** the Sync Operations dashboard, **When** loaded, **Then** it presents live operational metrics:
   - Total users synchronized in the last 24 hours
   - Current queue depth and worker status
   - Success rate percentage
   - Recent synchronization errors (grouped by error type: Username Not Found, Rate Limited, Network Timeout, Data Parsing Error)
   - External API latency trends

2. **Given** a specific user reporting sync issues, **When** an administrator clicks "Trigger Manual Sync" on the user's record, **Then** a priority sync task is enqueued immediately and the administrator receives real-time execution feedback.

3. **Given** a platform-wide data refresh requirement, **When** a Super Administrator initiates a "Batch Platform Sync", **Then** the system requires explicit text confirmation ("CONFIRM"), throttles worker execution to prevent external API rate-limiting, and broadcasts a live progress bar.

---

### User Story 5 — Academic Calendar and Branch Configuration (Priority: P2)

An administrator can configure academic branches and define semester/academic year boundaries that drive platform time-filtered leaderboards.

**Why this priority**: Colleges operate on unique branch codes and changing semester schedules. Administrative configuration allows the platform to adapt without code changes.

**Independent Test**: Testable by adding a new branch (e.g., "AI & Data Science"), updating the Current Semester date range, and confirming the changes immediately reflect in onboarding dropdowns and time-period leaderboard filters.

**Acceptance Scenarios**:

1. **Given** the Branch Management panel, **When** an administrator manages branches, **Then** they can add new branch options (Name and Code), edit branch labels, and archive inactive branches (preventing new registrations while preserving historical student data).

2. **Given** the Academic Calendar settings, **When** an administrator defines the "Current Semester" or "Current Academic Year", **Then** they can set:
   - Semester Name (e.g. "Fall 2026")
   - Semester Start Date and End Date
   - Academic Year Label (e.g. "2026-2027")
   - Academic Year Start Date and End Date

3. **Given** saved semester/academic year dates, **When** public time-period leaderboards (R3) or Gender War filters (R5) are requested, **Then** the platform applies the configured date boundaries.

---

### User Story 6 — Administrator RBAC and Access Governance (Priority: P1)

The platform enforces role-based access control (Super Admin vs Platform Admin), prevents unauthorized escalation, and protects the system from accidental lockout.

**Why this priority**: Strong access control guarantees administrative integrity and prevents compromised or unauthorized users from altering system behavior.

**Independent Test**: Testable by attempting an administrative operation with a non-admin account (verifying HTTP 403 Forbidden) and attempting to delete the last Super Admin (verifying prevention).

**Acceptance Scenarios**:

1. **Given** user roles, **When** permissions are evaluated, **Then** the platform recognizes two administrative tiers:
   - **Super Administrator**: Full system access, including managing administrator invites, revoking admin roles, triggering batch platform syncs, and modifying global system configuration.
   - **Platform Administrator**: Operational access (user moderation, sync monitoring, manual single-user sync triggers, achievement management) without access to manage other administrators or global batch syncs.

2. **Given** an attempt to remove or demote the last remaining Super Administrator, **When** submitted, **Then** the system rejects the operation with an explicit error preventing administrative lockout.

3. **Given** any high-impact administrative action (e.g., batch sync, global calendar change, admin role grant/revoke), **When** initiated, **Then** step-up text confirmation (typing "CONFIRM") is required before execution.

---

### User Story 7 — Comprehensive Administrative Audit Logging (Priority: P1)

Every administrative action is recorded in an immutable audit log with full attribution, timestamps, and state diffs.

**Why this priority**: Auditability ensures accountability, supports forensic analysis during disputes, and meets institutional compliance standards.

**Independent Test**: Testable by executing an administrative action and verifying an audit record is created with matching admin ID, target ID, action type, IP address, and payload.

**Acceptance Scenarios**:

1. **Given** any administrative mutation (user edit, status change, achievement modification, branch update, calendar update, manual sync trigger, admin role grant/revoke), **When** executed, **Then** an immutable audit log entry is written containing:
   - Unique Log ID
   - Timestamp (UTC)
   - Administrator User ID and Display Name
   - Action Type (e.g. `USER_DISABLE`, `ACHIEVEMENT_CREATE`, `BRANCH_UPDATE`, `MANUAL_SYNC_TRIGGER`)
   - Target Entity Type and Target Entity ID
   - State Changes (structured JSON before/after diff)
   - Client IP Address and User-Agent

2. **Given** the Audit Log viewer, **When** an administrator searches audit history, **Then** logs can be filtered by Date Range, Administrator, Action Type, and Target Entity ID.

3. **Given** the audit log storage, **When** inspected, **Then** audit records are append-only and cannot be edited, modified, or deleted by any administrator via the interface.

---

### Edge Cases

- **Disabling an Administrator Account**: Only a Super Administrator can disable another administrator's account. A Super Admin cannot disable their own account while logged in.
- **Last Super Admin Safeguard**: The system blocks any action (deactivation, deletion, role revocation) that would result in zero active Super Administrators.
- **Invalid Achievement Condition Syntax**: The condition parser catches syntax errors (e.g. unbalanced parentheses, missing operators, unknown variable names) and rejects the save with a helpful inline syntax error.
- **Unverified Coding Stats Tampering**: If an administrator attempts to directly inject or modify statistics via direct API calls or forms, the request is rejected with HTTP 422 Unprocessable Entity.
- **Overlapping or Inverted Semester Dates**: The academic calendar validator rejects configurations where `start_date >= end_date` or where semester windows contain invalid date sequences.
- **External Sync API Ban / Severe Rate Limiting**: If external rate limits are exceeded during batch sync, the system enters an automatic circuit-breaker state, pauses the queue, logs an incident in the Admin Dashboard, and emits an alert banner.
- **Unauthorized Administrative Route Access**: Requests to administrative endpoints by non-admin students or unauthenticated users immediately yield HTTP 403 Forbidden or 401 Unauthorized and log a security alert.

---

## Requirements *(mandatory)*

### Functional Requirements

**User Management & Moderation**

- **FR-601**: The platform MUST provide a paginated, filterable User Management table allowing administrators to inspect all registered student profiles.
- **FR-602**: Administrators MUST be able to edit student profile metadata: display name, branch, batch, and gender.
- **FR-603**: The platform MUST strictly prohibit administrators from manually modifying, overriding, or fabricating synchronized coding statistics (problems solved, difficulties, contest rating, streaks, submission records).
- **FR-604**: Administrators MUST be able to disable and re-enable user accounts. Disabling an account MUST revoke active sessions, block future logins, and remove the student from leaderboards and aggregates.
- **FR-605**: The platform MUST maintain a duplicate account detection queue highlighting accounts sharing identical LeetCode usernames or institutional identifiers.
- **FR-606**: Administrators MUST be able to resolve duplicate account conflicts by unlinking LeetCode usernames (resetting stats to 0 and transitioning the secondary profile to "Pending LeetCode Link") or disabling duplicate profiles with a mandatory resolution note.

**Achievement Management**

- **FR-607**: The platform MUST provide an Achievement Studio allowing administrators to create, edit, categorize, and archive achievement definitions.
- **FR-608**: Each achievement definition MUST include: unique name, description, category, vector icon asset, unlock condition expression, point/rarity weighting, and publication status (Draft | Published | Archived).
- **FR-609**: The platform MUST validate achievement unlock conditions against a strict whitelist of verified metric variables (`total_solved`, `easy_solved`, `medium_solved`, `hard_solved`, `contest_rating`, `contests_attended`, `current_streak`, `longest_streak`) and standard comparison/logical operators (`>=`, `<=`, `>`, `<`, `==`, `AND`, `OR`).
- **FR-610**: Modifying or archiving an achievement definition MUST grandfather badges already earned by students under prior rules (preserving unlock history).

**Sync Operations & Platform Monitoring**

- **FR-611**: The platform MUST provide a real-time Synchronization Health dashboard displaying queue depth, worker state, 24-hour sync volume, success rates, and categorized failure logs.
- **FR-612**: Administrators MUST be able to trigger on-demand synchronization for individual users.
- **FR-613**: Super Administrators MUST be able to initiate batch platform synchronizations with step-up text confirmation, safety throttling, and rate-limit guardrails.
- **FR-614**: The platform MUST display platform-wide aggregate metrics (total registered students, active coders, total problems solved college-wide, sync health score).

**Academic Calendar & Branch Operations**

- **FR-615**: Administrators MUST be able to configure academic branches (Name, Code, Active status). Inactive branches MUST be hidden from onboarding while preserving existing user associations.
- **FR-616**: Administrators MUST be able to configure current semester and academic year date ranges (Name, Start Date, End Date).
- **FR-617**: Date range inputs MUST be validated to prevent inverted or invalid date windows.

**RBAC, Governance & Security**

- **FR-618**: The platform MUST enforce Role-Based Access Control distinguishing Super Administrators, Platform Administrators, and Students.
- **FR-619**: Super Administrators MUST be able to invite new administrators and assign/revoke administrator roles.
- **FR-620**: The platform MUST prevent the removal, deactivation, or demotion of the final remaining Super Administrator.
- **FR-621**: High-impact actions (batch sync, global calendar change, admin role grant/revoke, account deletion) MUST require explicit step-up confirmation (typing "CONFIRM").

**Auditability & Logging**

- **FR-622**: The platform MUST automatically generate an immutable audit log entry for every administrative action, capturing timestamp, administrator ID, action type, target entity, state diff (before/after), IP address, and user agent.
- **FR-623**: The platform MUST provide a searchable and filterable Audit Log viewer for Super Administrators.
- **FR-624**: Audit log entries MUST be append-only and mathematically protected against alteration or deletion through the user interface.

**Excluded Features**

- **FR-625**: The administration feature MUST NOT include Question of the Week (QOTW) management, First Blood management, Batch Wars management, enrollment-number management, or section management.

---

### Key Entities

- **Administrator Profile**: Role-augmented user record.
  - *Attributes*: user reference, role (`SUPER_ADMIN` | `PLATFORM_ADMIN`), granted_by, granted_at, active_status.
- **Achievement Definition**: Dynamic rule configuration for badges.
  - *Attributes*: id, name, description, category, icon_key, condition_expression, rarity, points, status (`DRAFT` | `PUBLISHED` | `ARCHIVED`), created_at, updated_at.
- **Branch Configuration**: Academic department metadata.
  - *Attributes*: id, name, code, is_active, display_order.
- **Academic Period Configuration**: Platform calendar boundaries.
  - *Attributes*: id, period_type (`SEMESTER` | `ACADEMIC_YEAR`), name, start_date, end_date, is_current.
- **Sync Log Entry**: Background synchronization execution record.
  - *Attributes*: id, user reference, sync_trigger (`SCHEDULED` | `MANUAL` | `WEBHOOK`), status (`SUCCESS` | `FAILED`), duration_ms, error_category, error_message, timestamp.
- **Audit Log Entry**: Immutable tracking record for administrative actions.
  - *Attributes*: id, admin_user_id, admin_name, action_type, target_type, target_id, before_state, after_state, ip_address, user_agent, timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-601**: Administrative search and user list queries return in under 1 second for datasets of up to 50,000 student records.
- **SC-602**: 100% of administrative mutations produce a complete, immutable audit log record with valid before/after diffs.
- **SC-603**: Zero ability for administrators to modify verified external stats (100% data integrity enforcement).
- **SC-604**: 100% prevention of administrator lockout scenarios (zero states with 0 Super Administrators).
- **SC-605**: Manual synchronization triggers dispatch and enqueue tasks within 500 milliseconds of admin action.
- **SC-606**: Achievement condition syntax validation catches 100% of malformed expressions before database persistence.
- **SC-607**: Disabled accounts are removed from all public leaderboards and aggregate metrics within 1 computation cycle.

---

## Assumptions

- Administrators authenticate via the same secure multi-factor or institutional single sign-on mechanisms as standard users, elevated by role flags.
- External sync data remains immutable and derived exclusively from verified LeetCode sync workers.
- The platform uses soft-deletion / deactivation for users to preserve referential integrity across audit logs and historical sync tables.
- System notifications or alerts for sync failures are delivered via the administrative console.
