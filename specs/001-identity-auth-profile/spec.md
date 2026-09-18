# Feature Specification: Identity, Authentication & Student Profile

**Feature Branch**: `001-identity-auth-profile`

**Created**: 2026-09-17

**Status**: Draft

**Roadmap Entry**: R1 — Identity, Authentication & Profile
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## Clarifications

### Session 2026-09-17

- Q: What password strength rules must a student's password satisfy? → A: Minimum 6 characters, no other constraints.
- Q: Should the system limit failed login attempts before blocking further attempts? → A: Lock account for 15 minutes after 5 consecutive failed attempts for that account.
- Q: How long may an unverified account exist before the email is freed for re-registration? → A: 24 hours — unverified accounts are purged after 24 hours, freeing the email.
- Q: What is the maximum time the system may take to deliver a verification email? → A: Delivered within 60 seconds of registration submission under normal conditions.
- Q: What should a profile display when a student has not uploaded an avatar? → A: Auto-generate an avatar from the student's initials (coloured circle with initials, e.g., "AK").

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — New Student Registration (Priority: P1)

A new student visits the platform for the first time and wants to create an account.
They provide their full name, a valid email address they own, a LeetCode username, and
explicitly select their gender (Male or Female). They submit the form and receive a
verification email.

**Why this priority**: Registration is the entry point to the entire platform. No other
user story is reachable without a working account. This is the irreducible MVP.

**Independent Test**: Fully testable by creating an account end-to-end and confirming
a verification email is dispatched within 60 seconds.

**Acceptance Scenarios**:

1. **Given** a visitor on the registration page, **When** they submit a valid name, a
   valid email, a LeetCode username, a password of at least 6 characters, and explicitly
   select "Male" or "Female", **Then** the system creates an unverified account and
   sends a verification email to the provided address within 60 seconds.

2. **Given** a visitor submitting the registration form, **When** the email field
   contains a syntactically invalid address (e.g., missing `@`), **Then** the form
   rejects the submission with a clear inline error and does not create an account.

3. **Given** a visitor submitting the registration form, **When** the email is already
   registered to an existing account, **Then** the system rejects the submission with
   an error ("An account with this email already exists") and does not create a
   duplicate account.

4. **Given** a visitor submitting the registration form, **When** any required field
   (name, email, LeetCode username, gender, password) is left empty, **Then** the form
   identifies each missing field with an inline error message and does not submit.

5. **Given** a visitor submitting the registration form, **When** gender has not been
   selected, **Then** the form rejects submission with an inline error on the gender
   field specifically.

6. **Given** a visitor on the registration page, **When** the gender control is
   rendered, **Then** exactly two options are presented: "Male" and "Female" — no
   other options, no free-text field, no "Other" or "Prefer not to say".

7. **Given** a visitor submitting the registration form, **When** the password is fewer
   than 6 characters, **Then** the form rejects submission with a clear inline error
   on the password field.

---

### User Story 2 — Email Verification (Priority: P1)

After registering, a student receives a verification email and clicks the confirmation
link to activate their account.

**Why this priority**: An unverified account cannot access the leaderboard, profiles,
or any authenticated surface. Email verification is the gate between registration and
full access.

**Independent Test**: Testable by registering, clicking the emailed link, and
confirming the account transitions to verified.

**Acceptance Scenarios**:

1. **Given** a student with an unverified account, **When** they click the verification
   link in their email, **Then** the account becomes fully active and the student is
   either logged in automatically or redirected to the login page with a success
   message.

2. **Given** a student with an unverified account, **When** they attempt to log in
   before verifying, **Then** they are shown a clear message explaining that their
   email is not yet verified and offered the option to resend the verification email.

3. **Given** a student with an unverified account, **When** they request a new
   verification email, **Then** the system sends a fresh link to the registered address.

4. **Given** a verification link that has expired or been used, **When** a student
   clicks it, **Then** the system informs them the link is invalid or expired and
   offers an option to request a new one.

5. **Given** an already-verified account, **When** the verification link from the
   original email is clicked again, **Then** the system handles this gracefully (e.g.,
   "Your account is already verified") without error.

6. **Given** an unverified account that was created more than 24 hours ago, **When**
   a new registration attempt is made with the same email, **Then** the old unverified
   account no longer blocks registration and a fresh account is created.

---

### User Story 3 — Login and Session Management (Priority: P1)

A registered, verified student logs into the platform using their email and password.

**Why this priority**: Login is a prerequisite for all authenticated actions.

**Independent Test**: Testable by logging in with correct credentials and verifying
authenticated state; and by attempting login with wrong credentials.

**Acceptance Scenarios**:

1. **Given** a verified account, **When** the student submits correct email and
   password, **Then** they are logged in and redirected to the platform home or
   their profile.

2. **Given** a login attempt, **When** the email does not match any account, **Then**
   the system returns a generic error ("Invalid email or password") without
   disclosing whether the email exists.

3. **Given** a login attempt, **When** the password is incorrect, **Then** the system
   returns the same generic error ("Invalid email or password").

4. **Given** a logged-in student, **When** they explicitly log out, **Then** their
   session is terminated and they are redirected to the public home or login page.

5. **Given** a student session, **When** the session reaches its expiry time without
   activity, **Then** the session is automatically invalidated and the student is
   prompted to log in again.

6. **Given** an account that has experienced 5 consecutive failed login attempts,
   **When** a further login attempt is made, **Then** the system rejects the attempt
   and informs the student that the account is temporarily locked for 15 minutes.

7. **Given** an account locked due to failed attempts, **When** 15 minutes have
   elapsed, **Then** the account is automatically unlocked and login attempts are
   accepted again.

---

### User Story 4 — Password Reset (Priority: P1)

A student who has forgotten their password requests a reset link and sets a new
password.

**Why this priority**: Without a recovery mechanism, locked-out students lose access
permanently, which undermines the platform's reliability.

**Independent Test**: Testable by triggering a reset, using the emailed link, and
confirming login with the new password.

**Acceptance Scenarios**:

1. **Given** a student on the password-reset request page, **When** they submit a
   registered email address, **Then** the system sends a password-reset link to that
   address and shows a generic confirmation ("If this email is registered, a reset link
   has been sent") regardless of whether the email exists.

2. **Given** a student who has received a reset link, **When** they submit a new
   password of at least 6 characters via the link, **Then** their password is updated,
   the reset link is invalidated, and they can log in with the new password.

3. **Given** a student who has received a reset link, **When** the link has expired or
   already been used, **Then** the system rejects it with a clear message and offers
   to request a new one.

4. **Given** a student who has received a reset link, **When** they submit a new
   password fewer than 6 characters, **Then** the form rejects submission with a clear
   inline error on the password field.

---

### User Story 5 — First-Login Onboarding Completion (Priority: P1)

After verifying their email, a student completes the required onboarding step (which
may be satisfied entirely at registration) and is shown the option to add optional
academic information.

**Why this priority**: Required fields must be present before the student can appear
on the leaderboard. The onboarding flow must be lightweight and must not block access
behind optional information.

**Independent Test**: Testable by completing registration with only required fields and
confirming the student can access the platform without being forced to fill optional
fields.

**Acceptance Scenarios**:

1. **Given** a newly verified student who supplied all required fields at registration,
   **When** they first log in, **Then** they reach the platform without being forced to
   fill in optional academic fields.

2. **Given** a newly verified student, **When** the onboarding UI presents optional
   fields (admission year, graduation year, branch), **Then** these fields are clearly
   labelled as optional and the student can skip them without any error.

3. **Given** a student who skipped optional academic fields, **When** they visit their
   profile later, **Then** optional fields are shown as empty/not set and they can fill
   them in at any time from the profile-edit screen.

---

### User Story 6 — Gender Selection Rules (Priority: P1)

At registration and at any subsequent profile edit, gender is selected from exactly
two options.

**Why this priority**: Gender is required and directly feeds the Gender War feature.
Incorrect collection of this field has downstream data-integrity consequences.

**Independent Test**: Testable by inspecting the gender control at registration and in
profile edit, confirming exactly two options are available with no free-text alternative.

**Acceptance Scenarios**:

1. **Given** the registration form, **When** the gender field is rendered, **Then**
   exactly two options appear: "Male" and "Female". No other values, no free-text
   field, no "Other", no "Prefer not to say".

2. **Given** the gender field at registration, **When** the student submits without
   selecting a gender, **Then** the form is rejected with an inline validation error
   specific to the gender field.

3. **Given** the profile-edit screen for a verified student, **When** they change their
   gender selection, **Then** the system accepts and saves the update, which takes
   effect immediately in all downstream displays.

4. **Given** the registration or profile-edit screen, **When** the system renders the
   gender options, **Then** gender is never pre-selected based on the user's name,
   email, avatar, LeetCode profile, or any other external signal.

---

### User Story 7 — Optional Academic Information (Priority: P2)

A student optionally provides their admission year, graduation year, and branch on
registration or through profile editing.

**Why this priority**: Academic information enriches filtering and leaderboard views
but is not required for the core value proposition.

**Independent Test**: Testable by registering without optional fields and later adding
them through profile edit.

**Acceptance Scenarios**:

1. **Given** a student on the registration form, **When** they submit without providing
   admission year, graduation year, or branch, **Then** registration succeeds and the
   account is created normally.

2. **Given** a student on the registration form, **When** they provide admission year
   and graduation year, **Then** the system accepts both values and stores them.

3. **Given** a student who has stored both admission year and graduation year,
   **When** their public profile is viewed, **Then** the system may display a derived
   batch label (e.g., "2022–2026") from those two values.

4. **Given** a student who has stored only one of admission year or graduation year,
   **When** their public profile is viewed, **Then** no batch label is invented from
   incomplete information; the available year may be shown as-is or omitted.

5. **Given** a student who has provided no academic years, **When** their public
   profile is viewed, **Then** no batch label or academic year information is shown.

6. **Given** a student on the profile-edit screen, **When** they clear a previously
   entered optional field, **Then** the system accepts the cleared value and removes
   the field from the profile display.

---

### User Story 8 — Prohibited Fields Never Collected (Priority: P1)

The registration and profile forms must never present, solicit, or accept enrollment
number, roll number, or section.

**Why this priority**: This is a hard privacy constraint defined in the platform
constitution. Any violation exposes users to unnecessary data collection.

**Independent Test**: Testable by inspecting all registration and profile-edit surfaces
and confirming no such fields exist.

**Acceptance Scenarios**:

1. **Given** the registration form, **When** it is rendered, **Then** there is no field
   for enrollment number, roll number, or section.

2. **Given** the profile-edit screen, **When** it is rendered, **Then** there is no
   field for enrollment number, roll number, or section.

3. **Given** an attempt to submit these fields via any programmatic or API mechanism,
   **Then** the system ignores or rejects them and does not persist them.

---

### User Story 9 — Profile Editing (Priority: P1)

A logged-in student can edit their own profile to update allowed fields.

**Why this priority**: Profile data changes over time (e.g., LeetCode username change,
graduation year update). Inability to edit traps users with incorrect data.

**Independent Test**: Testable by updating each editable field and confirming the
change persists and appears on the public profile.

**Acceptance Scenarios**:

1. **Given** a logged-in student on the profile-edit screen, **When** they update their
   full name and save, **Then** the new name is reflected on their profile and in
   leaderboard display immediately.

2. **Given** a logged-in student, **When** they update their LeetCode username, **Then**
   the system accepts the change. (Validation that the username resolves to a real
   LeetCode account is handled in R2; this slice stores the value.)

3. **Given** a logged-in student, **When** they update admission year, graduation year,
   or branch, **Then** the changes are saved and reflected on the profile.

4. **Given** a logged-in student, **When** they change their gender selection, **Then**
   the change is saved and immediately takes effect in all displays (profile, Gender War
   grouping).

5. **Given** a logged-in student, **When** they attempt to edit a field that is not
   user-editable (e.g., college rank, LeetCode-derived statistics, calculated score),
   **Then** those fields are not present in the edit form and cannot be modified through
   any user-facing action.

6. **Given** a logged-in student, **When** they upload a new avatar, **Then** the
   avatar is saved and displayed on their public profile.

7. **Given** a logged-in student who has not uploaded an avatar, **When** their profile
   is viewed, **Then** a system-generated avatar composed of their initials on a
   coloured background is displayed in the avatar slot.

---

### User Story 10 — Email Change with Re-Verification (Priority: P2)

A logged-in student can change their email address, which requires re-verification of
the new address before it takes effect.

**Why this priority**: Email is the login credential; unverified email changes would
allow account takeover.

**Independent Test**: Testable by requesting an email change, verifying the new
address, and confirming login works with the new email.

**Acceptance Scenarios**:

1. **Given** a logged-in student who submits a new email address, **When** the new
   address is valid and not already taken, **Then** the system sends a verification
   link to the new address. The old email remains active for login until the new one
   is verified.

2. **Given** a student who has received a new-email verification link, **When** they
   click it, **Then** the email on their account is updated to the new address and the
   old address is no longer accepted for login.

3. **Given** a student who requests an email change, **When** the new address is
   already registered to another account, **Then** the request is rejected with an
   appropriate error.

4. **Given** a student who requests an email change, **When** the new-email
   verification link expires, **Then** the account email remains unchanged and the
   student can request a new change.

---

### User Story 11 — Public Profile Privacy (Priority: P1)

A visitor or logged-in student viewing another student's public profile must never see
the profile owner's email address.

**Why this priority**: Email privacy is a constitutional non-negotiable. Any violation
exposes the user's personal contact information publicly.

**Independent Test**: Testable by viewing any public student profile as a guest and as
a logged-in user and confirming email is absent from all rendered output.

**Acceptance Scenarios**:

1. **Given** a public student profile page, **When** it is viewed by any visitor
   (authenticated or not), **Then** the email address of the profile owner is not
   displayed anywhere on the page.

2. **Given** a leaderboard row displaying a student's entry, **When** rendered for any
   viewer, **Then** the student's email is not present in the row.

3. **Given** a public search result listing student profiles, **When** rendered,
   **Then** no email address appears in any search result item.

4. **Given** the profile owner viewing their own profile, **When** the edit screen is
   shown, **Then** the current email may be visible only to the account owner in a
   clearly private, account-settings context (not on the public-facing profile card).

---

### User Story 12 — Publicly Visible Profile Information (Priority: P2)

A student's public profile page displays an appropriate set of public information,
including coding statistics (once available) and college rank (once available).

**Why this priority**: The public profile is the student's presence on the platform.
Its content defines what the leaderboard and search results show.

**Independent Test**: Testable by viewing a profile as a guest and confirming only
permitted fields are visible.

**Acceptance Scenarios**:

1. **Given** a public student profile, **When** viewed, **Then** the page may display:
   name, avatar (uploaded or initials-generated), LeetCode username, gender, branch
   (if provided), batch label (if both academic years are known), coding statistics
   (once synchronized via R2), college rank (once computed via R3), achievements (once
   awarded via R4), and activity statistics (once available via R2/R4).

2. **Given** a student who has not yet had their LeetCode data synchronized,
   **When** their profile is viewed, **Then** the coding statistics area is shown as
   "Not yet available" or equivalent — not as zero values.

3. **Given** a student whose optional branch is not set, **When** their profile is
   viewed, **Then** no branch label is shown (not shown as blank or "N/A").

4. **Given** a student with only one academic year set, **When** their profile is
   viewed, **Then** no batch label is invented; the available year may be omitted
   or shown only if it conveys unambiguous meaning.

---

### User Story 13 — Duplicate Account Handling (Priority: P1)

The system must prevent multiple accounts sharing the same email address, while
releasing email addresses from abandoned unverified accounts after 24 hours.

**Why this priority**: Duplicate accounts corrupt leaderboard data and undermine the
integrity of the ranking. The 24-hour release window ensures a user who misregistered
can always recover.

**Independent Test**: Testable by attempting to register with an already-registered
email, and separately verifying that an expired unverified account's email becomes
available after 24 hours.

**Acceptance Scenarios**:

1. **Given** an email address already registered to a verified account, **When** a
   registration attempt is made with that email, **Then** the system rejects the
   attempt with a clear error and does not create a second account.

2. **Given** an email address registered to an unverified account less than 24 hours
   old, **When** a new registration attempt is made with the same email, **Then** the
   system rejects the duplicate and offers to resend the verification email to the
   existing address.

3. **Given** an email address registered to an unverified account more than 24 hours
   old, **When** a new registration attempt is made with the same email, **Then** the
   old unverified account is removed and a fresh registration proceeds normally.

4. **Given** a logged-in student who requests an email change to an address already
   used by another account, **When** the request is submitted, **Then** it is rejected
   with a clear error.

---

### Edge Cases

- **Name with Unicode characters**: Names containing accented characters, non-Latin
  scripts, or emoji-adjacent characters must be stored and displayed correctly.

- **Extremely long input values**: Name, LeetCode username, and branch fields must
  enforce a maximum character length and reject oversized values with a clear error.

- **Whitespace-only input**: Required fields submitted with only spaces must be treated
  as empty and rejected.

- **LeetCode username at registration**: The username is stored as provided. The system
  does not validate at registration that it resolves to a real LeetCode account (that
  belongs to R2). An empty LeetCode username is rejected as a required field.

- **Password at exactly 6 characters**: A password of exactly 6 characters must be
  accepted. A password of 5 characters must be rejected.

- **Account lockout during password reset**: If an account is locked due to failed
  login attempts, the password-reset flow must still be accessible (lockout applies to
  login attempts only, not to the reset request form).

- **Batch label when admission year equals graduation year**: If both years are
  identical (data-entry error), the system stores the values without inventing a
  correction; no derived batch label is displayed.

- **Admission year in the future**: If an admission year is after the current year,
  the system accepts it (valid for prospective students) without inference.

- **Session after email change**: If a student changes their email and verifies the
  new address, existing sessions started under the old email must be considered for
  invalidation policy.

- **Concurrent registration attempts**: Two simultaneous registrations with the same
  email must not both succeed; exactly one account must be created.

- **Account with no public statistics yet**: A student who has registered but not yet
  connected LeetCode data (R2 not run) must still have a valid, viewable public profile
  that clearly shows stats are not yet available.

- **Verification link clicked in a different browser**: The student must still be able
  to verify their email even if they open the link in a different browser or device
  from the one where they registered.

- **Avatar file type and size limits**: The system must enforce permitted file types
  (image formats only) and a maximum file size for avatar uploads, with a clear error
  message on violation.

- **Initials avatar for single-name users**: If a student's name contains only one
  word, the initials avatar uses the first letter of that single word.

- **Gender field in profile edit when no prior value**: If a legacy or edge-case
  account somehow has no gender set, the edit form must require selection before saving.

- **Unverified account at exactly 24 hours**: The purge window is inclusive — an
  account that has existed for exactly 24 hours is eligible for purge; a fresh
  registration with the same email must succeed.

---

## Requirements *(mandatory)*

### Functional Requirements

**Registration**

- **FR-001**: The system MUST allow any person to register using any syntactically
  valid email address. A college or institutional email address MUST NOT be required.

- **FR-002**: Registration MUST collect the following required fields: full name,
  email address, LeetCode username, gender, and password.

- **FR-003**: The gender field MUST present exactly two selectable options: "Male" and
  "Female". No other value, free-text input, or derivation is permitted.

- **FR-004**: The system MUST reject any registration submission where a required field
  (name, email, LeetCode username, gender, password) is absent or contains only
  whitespace.

- **FR-005**: The system MUST reject any registration submission where the email
  address is already associated with an existing active or unexpired unverified account.

- **FR-006**: The system MUST NOT collect or persist enrollment number, roll number,
  or section at any point during registration or profile management.

- **FR-007**: Registration MUST allow submission without providing optional fields
  (admission year, graduation year, branch).

**Password Rules**

- **FR-031**: Passwords MUST be a minimum of 6 characters in length. No other
  composition constraints (uppercase, digit, symbol) are required. The system MUST
  reject any password shorter than 6 characters at registration and at password reset,
  with a clear inline error.

**Email Verification**

- **FR-008**: Upon successful registration, the system MUST send a verification email
  to the provided address containing a single-use, time-limited verification link.
  This email MUST be delivered within 60 seconds of registration submission under
  normal operating conditions.

- **FR-009**: An account MUST NOT be considered fully active until the email address
  has been verified.

- **FR-010**: An unverified account attempting to log in MUST be informed that
  verification is required and MUST be offered the ability to resend the verification
  email.

- **FR-011**: A verification link MUST become invalid after it is used or after its
  expiry period. Clicking an expired or used link MUST surface a clear message with an
  option to request a new link.

- **FR-033**: An unverified account MUST be automatically purged 24 hours after its
  creation. Once purged, the associated email address MUST be available for a new
  registration attempt.

**Authentication**

- **FR-012**: A verified student MUST be able to log in using their email address and
  password.

- **FR-013**: Failed login attempts (wrong email or wrong password) MUST return a
  generic error that does not reveal whether the email is registered.

- **FR-014**: A logged-in student MUST be able to log out, terminating their session.

- **FR-015**: Sessions MUST expire after a defined period of inactivity.

- **FR-032**: After 5 consecutive failed login attempts on a single account, the system
  MUST lock that account for 15 minutes. During the lockout, further login attempts
  MUST be rejected with a message indicating the account is temporarily locked. The
  lockout MUST lift automatically after 15 minutes. The password-reset flow MUST
  remain accessible during a lockout.

**Password Reset**

- **FR-016**: A student MUST be able to request a password-reset link by providing
  their email address. The system MUST respond with a generic confirmation message
  regardless of whether the email is registered.

- **FR-017**: A password-reset link MUST be single-use and time-limited. Clicking an
  expired or used link MUST display a clear error and offer a new request.

- **FR-018**: Completing a password reset MUST invalidate the reset link immediately.
  The new password MUST meet the minimum 6-character requirement (FR-031).

**Profile Editing**

- **FR-019**: A logged-in student MUST be able to edit the following fields on their
  own profile: full name, avatar, LeetCode username, gender, admission year, graduation
  year, and branch.

- **FR-020**: A logged-in student MUST NOT be able to edit the following fields through
  any user-facing action: LeetCode-derived statistics, contest rating, submission
  history, college rank, calculated score, or any metric sourced from an external
  platform.

- **FR-021**: A student MUST be able to change their email address. An email change
  MUST trigger a verification email to the new address. The old email MUST remain
  active for login until the new one is verified.

- **FR-022**: If both admission year and graduation year are set, the system MAY display
  a derived batch label on the public profile.

- **FR-023**: If only one or neither academic year is set, the system MUST NOT invent
  or display a batch label.

**Avatar**

- **FR-034**: When a student has not uploaded a custom avatar, the system MUST display
  an auto-generated avatar composed of the student's initials rendered on a coloured
  background. This generated avatar MUST appear consistently across the student's
  public profile, leaderboard rows, and search results. If the student's name is a
  single word, the first letter of that word is used.

**Privacy**

- **FR-024**: A student's email address MUST NOT appear on any public profile page,
  leaderboard row, or public search result, regardless of whether the viewer is
  authenticated.

- **FR-025**: Gender MUST NEVER be inferred from the student's name, email address,
  avatar, LeetCode profile, or any external data source. It MUST be set only through
  explicit user selection.

**Public Profile Content**

- **FR-026**: A public student profile page MAY display: name, avatar (uploaded or
  initials-generated), LeetCode username, gender, branch (if provided), batch label
  (if derivable), coding statistics (once R2 data is available), college rank (once
  R3 assigns it), achievements (once R4 awards them), and activity statistics (once
  available from R2/R4).

- **FR-027**: For a student whose coding statistics have not yet been synchronized, the
  statistics area on the public profile MUST indicate data is not yet available rather
  than displaying zero values.

**Duplicate & Fraud Prevention**

- **FR-028**: The system MUST enforce uniqueness of email addresses across all active
  and unexpired unverified accounts. No two active accounts may share the same email.

- **FR-029**: Concurrent registration attempts using the same email MUST be handled
  such that at most one account is created.

**Input Validation**

- **FR-030**: All user-supplied text inputs MUST enforce a maximum character length.
  Inputs exceeding the limit MUST be rejected with a clear error. Whitespace-only
  values for required fields MUST be treated as empty.

### Key Entities

- **Account**: Represents the authentication identity. Attributes: email (unique
  across active and unexpired unverified accounts, private), hashed credential,
  verification status, verification token, lockout state (locked/unlocked, lockout
  expiry timestamp), failed attempt counter, session tokens. Unverified accounts are
  purged 24 hours after creation.

- **Student Profile**: Represents the student's presence on the platform. Attributes:
  full name, gender (Male | Female), LeetCode username, admission year (optional),
  graduation year (optional), branch (optional), avatar (uploaded file or null;
  system generates initials-based avatar when null). Associated with exactly one
  Account.

- **Public Profile View**: The subset of Student Profile fields visible to any
  visitor. Excludes email. Displays uploaded avatar or initials-generated avatar.
  Includes derived batch label when both academic years are known.

- **Session**: Represents an authenticated login instance. Attributes: session
  identifier, account reference, expiry timestamp.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new student can complete the full registration flow — from opening the
  registration page to having a verified, active account — in under 3 minutes under
  normal conditions. This requires that the verification email is delivered within
  60 seconds of registration submission.

- **SC-002**: 100% of rendered public student profiles, leaderboard rows, and search
  results contain no email address for any student, verified by automated inspection
  of all public-facing output.

- **SC-003**: 100% of rendered gender selection controls present exactly two options
  (Male, Female) with no additional values, verified across registration and profile
  edit surfaces.

- **SC-004**: A student who has registered and verified their email can log in
  successfully within 5 seconds of submitting correct credentials under normal load.

- **SC-005**: Zero active accounts share the same email address at any point in time,
  verified by a uniqueness constraint detectable without implementation knowledge.

- **SC-006**: A student can complete a profile update (name, optional academic fields,
  gender) and see the changes reflected on their public profile within 5 seconds of
  saving.

- **SC-007**: A student who skips all optional fields during registration reaches the
  authenticated platform view without encountering any error, warning, or forced
  completion prompt.

- **SC-008**: A failed login attempt — whether due to an unrecognized email or wrong
  password — returns a response to the user within 3 seconds and presents a message
  that does not identify which field was incorrect.

- **SC-009**: An account that has received 5 consecutive failed login attempts is
  verifiably inaccessible for exactly 15 minutes, after which login with the correct
  password succeeds without any administrative intervention.

- **SC-010**: Every student profile — including those with no uploaded avatar —
  displays a visible, non-empty avatar composed of the student's initials, confirmed
  by inspecting profiles of students who have never uploaded an avatar.

---

## Assumptions

- Users are assumed to have access to the email address they register with (required
  for verification). No alternative verification channel is in scope.

- Avatar uploads are assumed to support common image formats. Specific format list and
  size limits will be defined in the implementation plan.

- The verification link expiry period is aligned with the unverified account lifespan:
  24 hours. Session inactivity timeout will be defined as a configuration value in the
  implementation plan (30-day session assumed as default).

- A student's LeetCode username is stored as entered at registration and not validated
  against the LeetCode platform during R1. Validation and synchronization are R2 scope.

- Only one account per email is permitted. There is no concept of organizational
  accounts or shared profiles.

- Profile editing is restricted to the authenticated owner. Administrators may manage
  accounts through a separate admin interface (R7 scope).

- The platform does not currently support social login (OAuth with Google, GitHub,
  etc.). All authentication is email-and-password based. This may be revisited in a
  future slice.

- Mobile support is in scope for the public-facing registration, login, verification,
  and profile pages (per the Accessibility & Responsive UX constitution principle).

- The initials-based avatar colour assignment (background colour per student) is a
  presentational detail to be determined in the implementation plan; the spec only
  requires that initials are shown on a coloured background.
