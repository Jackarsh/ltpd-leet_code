# Feature Specification: Shareable GitHub Developer Profile Card

**Feature Branch**: `006-github-profile-card`

**Created**: 2026-09-17  
**Last Updated**: 2026-09-17 (post-clarify)

**Status**: Draft

**Roadmap Entry**: R6 — GitHub Profile Card  
**Parent Roadmap**: specs/college-coding-platform/roadmap.md

---

## Clarifications

### Session 2026-09-17

- Q: Which card formats and MIME types should the public endpoint support? → A: Dynamic standalone SVG (`image/svg+xml`) as the primary vector format for GitHub READMEs, with an optional PNG raster route (`/api/cards/{id}.png`) for social previewers.
- Q: Which layout dimensions and density variations should be supported? → A: Standard Banner (495×195px, default) and Compact Mini Card (350×120px) selected via `?layout=compact`.
- Q: How should public card permalinks identify the user securely? → A: Default to public platform username (`/api/cards/{username}`), with an optional private token slug option for students desiring URL anonymization.
- Q: What cache invalidation and rate limiting thresholds should be enforced? → A: 30-minute CDN TTL (`Cache-Control: public, max-age=1800, s-maxage=1800`) with rate limiting at 120 requests/minute per non-proxy client IP.
- Q: How should default featured achievements be selected if the user has not configured custom badges? → A: Explicit selection of up to 3 unlocked badges in Card Studio; auto-defaults to the top 3 highest-rarity unlocked achievements if unconfigured.

---

## User Scenarios & Testing *(mandatory)*

---

### User Story 1 — Generate and Preview Developer Profile Card (Priority: P1)

Any authenticated student can access their card generation page, customize visual preferences, and immediately preview their dynamic developer statistics card populated with verified platform data.

**Why this priority**: Profile cards are the primary platform export mechanism that allows students to showcase their college standing and problem-solving achievements on GitHub, portfolios, and personal resumes.

**Independent Test**: Testable by navigating to the card customization page as a student with verified coding statistics and verifying that all profile metrics, chosen theme, and featured badges render faithfully in the preview.

**Acceptance Scenarios**:

1. **Given** a student with synchronized LeetCode data, **When** they visit their Profile Card Studio, **Then** an interactive preview renders their live card displaying:
   - Full student name
   - Verified LeetCode username
   - College leaderboard rank
   - Total problems solved
   - Breakdown by difficulty (Easy, Medium, Hard)
   - Current contest rating (or "Unrated" if absent)
   - Active problem-solving streak
   - Up to 3 featured achievements/badges (or top 3 by rarity if unselected)
   - Platform verification badge

2. **Given** the preview studio, **When** the student changes display configurations (such as toggling streak, choosing standard vs compact layout, or selecting featured badges), **Then** the visual preview updates immediately without requiring a full page refresh.

3. **Given** a student viewing their card, **When** inspecting rendered values, **Then** all statistics are read-only and sourced strictly from verified platform synchronizations — students cannot edit numerical stats manually.

---

### User Story 2 — Select Visual Card Themes and Layouts (Priority: P2)

A student can customize the visual aesthetic and dimension layout of their card by selecting from curated color palettes and density modes.

**Why this priority**: Developers have diverse GitHub README aesthetics and layout constraints. Theme and density flexibility drives student adoption and sharing.

**Independent Test**: Testable by cycling through each theme and layout option and confirming that color tokens, contrast ratios, and dimensions dynamically update across the preview and generated asset URLs.

**Acceptance Scenarios**:

1. **Given** the card customization interface, **When** browsing themes, **Then** the user can select from at least 5 distinct visual presets:
   - GitHub Dark (monochrome slate and dark tones)
   - Modern Light (clean high-contrast white and subtle grey)
   - Cyberpunk / Neon (high-energy neon accents)
   - Midnight Navy (deep blue with emerald highlights)
   - Minimalist Wireframe (clean typography, subdued borders)

2. **Given** layout selection, **When** choosing between Standard Banner (495×195px) and Compact Mini Card (350×120px), **Then** the preview and output URLs configure the appropriate dimension parameters (`?layout=compact`).

3. **Given** a selected theme, **When** previewed or embedded, **Then** foreground text and graphic elements maintain accessible contrast compliance against card backgrounds.

---

### User Story 3 — Copy Card URL and GitHub Markdown Embed (Priority: P1)

A student can copy a direct shareable image URL and formatted GitHub Markdown snippet to paste into their GitHub profile README or personal website.

**Why this priority**: Ease of sharing is essential. A single-click copy action with pre-formatted Markdown (`[![...](...)](...)`) eliminates friction for students embedding cards into their repositories.

**Independent Test**: Testable by clicking "Copy Markdown", pasting into a GitHub README or markdown previewer, and verifying the image renders and clicks through to the student's public platform profile.

**Acceptance Scenarios**:

1. **Given** the card studio page, **When** the user clicks "Copy Markdown", **Then** the clipboard receives a standard GitHub markdown image link formatted as:
   `[![<Student Name>'s Coding Stats](<Card Image URL>)](<Student Public Profile URL>)`

2. **Given** the card studio page, **When** the user clicks "Copy Direct URL", **Then** the clipboard receives the direct permalink to the dynamic SVG asset (or optional PNG raster URL).

3. **Given** a visitor viewing an embedded card on GitHub, **When** clicking on the card image, **Then** they are navigated to the student's public profile page on the college coding platform.

4. **Given** any copied URL, **When** requested by an external service (e.g. GitHub Camo image proxy or web browser), **Then** the image asset is served with appropriate cache headers enabling automatic freshness updates upon background sync.

---

### User Story 4 — Strict Privacy and Data Protection (Priority: P1)

The public card asset and API endpoints never expose sensitive student data or non-public credentials.

**Why this priority**: Public cards are loaded by external proxies, crawlers, and strangers on GitHub. Strict data hygiene is critical to prevent leaks of institutional identifiers, emails, or account security details.

**Independent Test**: Testable by inspecting the network payload, SVG DOM elements, URL query parameters, and image metadata to ensure zero sensitive fields exist.

**Acceptance Scenarios**:

1. **Given** any generated card asset or endpoint response, **When** inspected, **Then** the following fields MUST NOT appear anywhere in the image, metadata, or URL:
   - Student email address
   - College roll number / institutional enrollment ID
   - Authentication tokens, passwords, or session IDs
   - Phone numbers or private profile notes

2. **Given** an unauthenticated external visitor or GitHub crawler requesting a card URL, **When** accessed, **Then** the card renders successfully without requiring authentication or session cookies.

---

### User Story 5 — Dynamic Synchronization and Freshness (Priority: P2)

When a student's coding metrics or rank update during platform synchronization, their public profile card automatically reflects the latest verified numbers.

**Why this priority**: Students expect their GitHub README stats to stay up-to-date without needing to re-copy markdown snippets or re-generate cards after solving new problems.

**Independent Test**: Testable by updating a student's problem count via sync and confirming that subsequent requests to the existing card URL serve updated metrics.

**Acceptance Scenarios**:

1. **Given** an existing public card URL, **When** the platform ingests new LeetCode submissions or rank adjustments for that student, **Then** subsequent requests to the card asset return the updated statistics.

2. **Given** HTTP caching mechanisms (such as GitHub Camo or browser caches), **When** cards are served, **Then** HTTP response headers specify short cache TTLs (`Cache-Control: public, max-age=1800, s-maxage=1800`) to balance server efficiency with data freshness.

---

### User Story 6 — Handling Incomplete or Pending Synchronization (Priority: P2)

When a student's card is requested before initial data sync completes, or while data is being refreshed, the card displays a graceful, informative state rather than a broken image.

**Why this priority**: Broken images on a GitHub profile README damage the developer's presentation and reflect poorly on the platform.

**Independent Test**: Testable by generating and requesting a card for a newly onboarded user whose background sync is pending.

**Acceptance Scenarios**:

1. **Given** a newly registered student whose LeetCode data has not yet synchronized, **When** their card URL is accessed, **Then** the card renders a valid image showing their name, avatar/initials, and an informative "Syncing verified statistics..." notice.

2. **Given** a student with no unlocked or selected achievements, **When** their card is rendered, **Then** the card layout neatly collapses the achievements area or displays a minimalist "Active Learner" badge without empty placeholder boxes.

3. **Given** a student whose synchronized statistics are currently marked stale due to external API outages, **When** their card is requested, **Then** the card renders their last verified statistics with a subtle timestamp indicator (e.g. "Verified as of [Date]").

---

### User Story 7 — Account Changes and URL Resilience (Priority: P2)

When a student updates their display name, avatar, or linked LeetCode username, the card adapts smoothly without breaking existing embedded links.

**Why this priority**: Students may update their platform profile details over time. Embedded cards in past GitHub repositories should continue to resolve reliably.

**Independent Test**: Testable by changing a student's display name and LeetCode handle, then requesting their persistent card identifier.

**Acceptance Scenarios**:

1. **Given** a student changing their display name on the platform, **When** their card URL is loaded, **Then** the card immediately displays the updated display name.

2. **Given** a student linking a new LeetCode username, **When** synchronization completes for the new handle, **Then** the card displays the new username and corresponding statistics.

3. **Given** a student using an immutable card identifier (such as a public user slug or unique card token), **When** account updates occur, **Then** the URL remains stable and does not produce 404 Not Found errors.

---

### Edge Cases

- **Card requested for a non-existent or deactivated student**: Returns a neutral SVG graphic stating "Profile unavailable" or HTTP 404 with a fallback SVG image, never leaking internal stack traces.
- **Student has 0 problems solved across all categories**: Renders 0 for Easy, Medium, Hard, and Total with an active status indicator; does not show division-by-zero errors in charts.
- **Student has unrated contest status**: Displays "Unrated" or "—" in the contest rating tile; does not display rating as 0.
- **Student with extreme metric values (e.g. 3000+ problems solved or 5-digit rank)**: Layout dynamically truncates or formats numbers (e.g., `1,250` or `12.5k`) ensuring text does not overflow card boundary boxes.
- **Extremely long student names**: Truncates with ellipsis or dynamically reduces font size if display name exceeds 28 characters to prevent canvas clipping.
- **Custom domain or proxy access (GitHub Camo)**: Asset generator sets permissive CORS headers (`Access-Control-Allow-Origin: *`) and content types (`image/svg+xml`) so all external markdown engines render the vector card smoothly.
- **Featured badge deleted by admin**: If a badge selected on a student's card is subsequently removed by an administrator, the card gracefully falls back to displaying the student's next highest badge or omits the badge slot cleanly.
- **Rate limiting burst protection**: Non-proxy client IP requests exceeding 120 req/min receive HTTP 429 with `Retry-After` header.

---

## Requirements *(mandatory)*

### Functional Requirements

**Card Customization and Preview Studio**

- **FR-501**: The platform MUST provide an authenticated Profile Card Studio allowing students to customize, preview, and generate their public developer statistics card.
- **FR-502**: The card studio MUST render a real-time vector preview showing exactly how the card will look when embedded externally.
- **FR-503**: The card MUST display the following verified data attributes:
  1. Student display name
  2. Verified LeetCode username
  3. College leaderboard rank
  4. Total problems solved
  5. Easy, Medium, and Hard problem counts
  6. Contest rating (or "Unrated" if absent)
  7. Current active streak count
  8. Up to 3 featured achievement badges (explicitly chosen or top 3 by rarity)
  9. Platform verification checkmark / badge
- **FR-504**: Students MUST NOT be permitted to manually edit, override, or falsify any statistical values displayed on the card. All statistics MUST derive strictly from verified platform records.
- **FR-505**: Students MUST be able to toggle the visibility of specific card modules (e.g., show/hide streak, show/hide contest rating, show/hide achievements) and choose between Standard Banner (495×195px) and Compact Mini Card (350×120px) layouts.

**Themes and Styling**

- **FR-506**: The platform MUST offer at least 5 selectable visual themes (including GitHub Dark, Modern Light, Cyberpunk/Neon, Midnight Navy, and Minimalist).
- **FR-507**: Theme selection MUST be configurable via URL parameters (`?theme=...`) or persistent card settings.
- **FR-508**: All card themes MUST adhere to accessibility standards with high-contrast text and legible vector typography across standard display resolutions.

**Asset Generation and Export**

- **FR-509**: The platform MUST expose a public endpoint serving dynamic, standalone vector graphics (`image/svg+xml`), with an optional raster PNG fallback endpoint (`/api/cards/{id}.png`).
- **FR-510**: The studio MUST provide a single-click "Copy GitHub Markdown" button that generates a standard Markdown link pointing the image to the student's public platform profile.
- **FR-511**: The studio MUST provide a single-click "Copy Direct Image URL" button.
- **FR-512**: Public card endpoints MUST be accessible without authentication or API keys.

**Privacy and Security Guardrails**

- **FR-513**: Public cards MUST NEVER display or contain email addresses, student roll numbers, enrollment codes, internal database IDs, passwords, session tokens, or private notes.
- **FR-514**: Public card assets MUST sanitize all user-supplied text to prevent SVG-based Cross-Site Scripting (XSS) or XML injection attacks.
- **FR-515**: Cards MUST resolve via public username (`/api/cards/{username}`) by default, supporting an optional private token slug in user settings.
- **FR-516**: Public card endpoints MUST enforce rate limits (120 requests/minute per client IP) to protect against denial-of-service traffic spikes.

**Data Freshness and Lifecycle**

- **FR-517**: Public card endpoints MUST serve the latest verified statistics within 30 minutes of a platform background synchronization cycle completing.
- **FR-518**: HTTP responses for card image assets MUST include caching headers (`Cache-Control: public, max-age=1800, s-maxage=1800`) to prevent CDN stagnation while avoiding server overload.
- **FR-519**: When a card is requested for a student whose initial synchronization is incomplete, the endpoint MUST return an SVG graphic indicating "Statistics Syncing" rather than a broken image or 500 error.
- **FR-520**: When a card is requested for a student with no achievements, the layout MUST adapt gracefully without blank placeholder frames.
- **FR-521**: When a student updates their display name or LeetCode username, the card MUST automatically reflect the new values on subsequent requests without requiring URL migration.

**Excluded Features**

- **FR-522**: The feature MUST NOT implement general social networking tools, social feeds, public comments, direct messaging, or following systems.
- **FR-523**: The feature MUST NOT support unverified custom third-party statistics or manual stat injections from non-LeetCode sources.

---

### Key Entities

- **Developer Profile Card Config**: Persistent preferences for a student's card.
  - *Attributes*: student reference, card token / public slug, selected theme, layout (standard | compact), visible modules (show_streak, show_rating, show_achievements), selected achievement IDs (up to 3), created_at, updated_at.
- **Card Theme**: Visual definition for rendering cards.
  - *Attributes*: theme identifier, name, background color/gradient, border color, primary text color, secondary text color, difficulty accent colors (easy/medium/hard), badge style.
- **Card Asset Response**: Dynamic vector representation returned by the public server.
  - *Attributes*: content-type (`image/svg+xml` or `image/png`), cache-control headers, rendered dimensions (495×195px or 350×120px), verification payload.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-501**: Dynamic card assets generate and stream in under 500 milliseconds for 95% of public HTTP requests.
- **SC-502**: 100% of statistical values on the rendered card match the student's current verified platform records without discrepancies.
- **SC-503**: Zero instances of private student data (emails, roll numbers, credentials) exposed in public card assets or network responses.
- **SC-504**: Markdown embed snippets paste and render successfully across standard GitHub profile README environments, Light mode, Dark mode, and mobile apps.
- **SC-505**: Card image previews in the customization studio update in under 50 milliseconds upon theme or module toggle.
- **SC-506**: 100% of card requests for newly registered or pending students return valid vector SVG status cards rather than HTTP 500 or broken image symbols.
- **SC-507**: Generated SVG cards pass XML/SVG validation checks with 0 syntax or parsing errors.

---

## Assumptions

- Profile cards are rendered primarily as standalone SVGs for vector clarity and small payload size, with optional PNG raster fallback.
- External proxy caches (e.g. GitHub Camo) are respected with `Cache-Control: public, max-age=1800, s-maxage=1800`.
- Unconfigured achievement slots default to the user's top 3 unlocked achievements by rarity.
- College rank displayed on the card reflects the overall college rank computed by R3.
- The card link navigates to the public student profile established in R4.
