<!--
Version change: N/A → 1.0.0
Added sections: All principles, Governance
Removed sections: None
-->

# Constitution

**Version:** 1.0.0
**Ratification Date:** 2026-09-17
**Last Amended Date:** 2026-09-17

## Principles

### 1. Product Correctness and Data Integrity
All coding statistics, rankings, contest ratings, submission history, and derived metrics must have a clearly defined source of truth. Data must never be fabricated or manually trusted from user‑entered statistics. The system shall enforce immutability of source data and provide audit trails for any modifications.

### 2. Specification‑First Development
User‑facing behavior shall be specified before any implementation. Requirements must be testable, unambiguous, and expressed in a formal specification. Technical decisions belong in implementation plans and must not be mixed into behavioral specifications.

### 3. Privacy and Data Minimisation
Only the following information may be collected:
- **Name** – required
- **Email** – required (must never be exposed publicly)
- **LeetCode Username** – required
- **Gender** – required, selectable values: *Male* or *Female*
- **Admission Year** – optional
- **Graduation Year** – optional
- **Branch** – optional

The following must **not** be collected: enrollment number, roll number, section.

### 4. Transparent Rankings
College ranking and Gender War calculations shall have explicit, understandable definitions. Users must be able to view which measurable statistics contribute to any ranking or aggregate score.

### 5. Equal Treatment of Gender War Groups
Gender War shall compare the Male and Female groups using clearly defined and equivalent metrics. The system must account for unequal group sizes and must distinguish participant counts from normalized metrics such as averages and percentages.

### 6. External‑Data Reliability
External coding‑platform synchronization must be resilient to unavailable services, malformed responses, deleted users, rate limits, and stale data. Existing valid data must never be destroyed by a failed synchronization; fallback to the last known good state.

### 7. Testability
Every important user flow, business rule, ranking calculation, synchronization rule, permission rule, and data‑integrity constraint must be independently testable. Automated tests shall cover happy‑path and failure scenarios.

### 8. Security
Authentication, authorization, session management, secrets, external API credentials, administrator privileges, and user‑controlled inputs must be handled securely following industry best practices.

### 9. Accessibility and Responsive UX
The application shall remain usable on desktop and mobile devices and shall follow accessible interaction and semantic UI practices, complying with WCAG 2.1 AA at minimum.

### 10. Maintainability and Extensibility
The architecture shall permit future coding‑platform integrations (e.g., Codeforces, CodeChef, AtCoder, HackerRank, GitHub) without requiring a fundamental redesign of the user/profile model.

### 11. Separation of Concerns
Authentication, user profiles, external‑platform synchronization, statistics calculation, ranking, achievements, administration, and presentation concerns shall be appropriately separated into distinct modules or services.

### 12. No Unrequested Features
Features explicitly out of scope shall never be implemented, including:
- Question of the Week
- First Blood
- Batch Wars
- Enrollment/roll‑number verification
- College‑email‑only registration
- Section management

## Governance

- **Specification as Source of Truth:** The specification document is the behavioral source of truth for each feature.
- **Implementation Plan as Source of Truth:** The implementation plan is the technical source of truth.
- **Traceability:** All tasks must trace back to a user story or required cross‑cutting concern.
- **Change Management:** When requirements change, the specification must be updated first and downstream plan/tasks reconciled.
- **No Silent Behaviour Changes:** New product behaviour must never be introduced without explicit specification support.
- **Incremental Delivery:** Prefer small, independently verifiable feature slices.

## Amendment Procedure

1. Propose a change via a pull request that updates this constitution.
2. Increment the version according to semantic versioning:
   - **MAJOR** for backward‑incompatible governance or principle removals/redefinitions.
   - **MINOR** for new principle or material expansion of guidance.
   - **PATCH** for clarifications, wording, typo fixes, or non‑semantic refinements.
3. Update the **Last Amended Date** to the date of amendment.
4. Review by at least two maintainers and approval before merging.

---

*This constitution is intended to guide the development of the college coding leaderboard and developer community platform, ensuring correctness, privacy, transparency, and inclusivity.*
