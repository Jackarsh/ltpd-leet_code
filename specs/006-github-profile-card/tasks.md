# Implementation Tasks: R6 — Shareable GitHub Developer Profile Card

**Roadmap Entry**: R6 — GitHub Profile Card  
**Feature Directory**: `specs/006-github-profile-card/`  
**Specification**: `specs/006-github-profile-card/spec.md`  
**Implementation Plan**: `specs/006-github-profile-card/plan.md`  

---

## Phase 1: Setup & Data Model (Blocking Prerequisites)

**Purpose**: Database schema, types, and theme infrastructure for Profile Card generation

- [x] T001 Update `prisma/schema.prisma` with `ProfileCardConfig` model
- [x] T002 Generate Prisma client via `npx prisma generate`
- [x] T003 [P] Create DTO interfaces and types for profile cards in `src/types/profile-card.ts`
- [x] T004 Implement theme definitions and color palettes (GitHub Dark, Modern Light, Cyberpunk/Neon, Midnight Navy, Minimalist) in `src/lib/card-themes.ts`

---

## Phase 2: Foundational Vector Card Subsystem (Blocking Prerequisites)

**Purpose**: Core SVG generation service and public API routes

- [x] T005 Implement SVG card rendering engine with XML character escaping in `src/server/services/card-svg.service.ts`
- [x] T006 Implement public SVG card API route with cache headers in `src/app/api/cards/[id]/route.ts`
- [x] T007 [P] Implement optional PNG raster fallback route in `src/app/api/cards/[id].png/route.ts`

---

## Phase 3: User Story 1 & 3 — Card Studio Preview & One-Click Export (Priority: P1)

**Goal**: Allow students to preview live cards and copy Markdown embed links for GitHub READMEs.

**Independent Test**: Visit `/studio/card` as a student, customize layout, click "Copy Markdown", paste into a markdown viewer, and verify the image renders and links to the student's public profile.

- [x] T008 [P] [US1] Create dynamic SVG live preview component in `src/components/card-studio/CardLivePreview.tsx`
- [x] T009 [P] [US3] Create one-click export bar with "Copy Markdown" and "Copy URL" in `src/components/card-studio/ExportBar.tsx`
- [x] T010 [US1] Assemble Card Studio page in `src/app/(dashboard)/studio/card/page.tsx`
- [x] T011 [US3] Add navigation link to Card Studio in user profile settings

---

## Phase 4: User Story 2 — Visual Themes & Layout Density Customization (Priority: P2)

**Goal**: Support 5 visual presets and 2 layout density options (Standard Banner 495x195px, Compact 350x120px).

**Independent Test**: Cycle through theme presets and toggle standard/compact layout; verify live preview and generated URLs update dynamically.

- [x] T012 [P] [US2] Create visual theme swatch selector in `src/components/card-studio/ThemeSelector.tsx`
- [x] T013 [P] [US2] Create layout density toggle in `src/components/card-studio/LayoutToggle.tsx`
- [x] T014 [P] [US2] Create featured achievement badge selector modal in `src/components/card-studio/BadgePicker.tsx`
- [x] T015 [US2] Connect Card Studio configuration form to server action / API persistence in `src/app/(student)/studio/card/page.tsx`

---

## Phase 5: User Story 4, 5, & 6 — Privacy Guards, Caching & Graceful Fallbacks (Priority: P1/P2)

**Goal**: Ensure zero private data leaks, short CDN caching (30 min), and graceful handling of pending syncs.

**Independent Test**: Request card for newly registered user without sync data, verifying valid "Syncing..." banner SVG renders without error; verify email/roll number never appear in SVG DOM.

- [x] T016 [US4] Enforce strict privacy filters stripping emails, roll numbers, and tokens from SVG DOM in `src/server/services/card-svg.service.ts`
- [x] T017 [US6] Implement pending sync state banner and auto-selection of top 3 unlocked badges in `src/server/services/card-svg.service.ts`
- [x] T018 [US5] Set HTTP cache headers (`Cache-Control: public, max-age=1800, s-maxage=1800`) and CORS headers in `src/app/api/cards/[id]/route.ts`

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T019 Write unit tests for SVG XML validity, character escaping, and theme rendering in `tests/card-svg.test.ts`
- [x] T020 Perform responsive layout audit for Card Studio on mobile devices
- [x] T021 Run full production build validation via `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — blocks all user stories.
- **User Story 1 & 3 (Phase 3)**: Depends on Phase 2 — MVP core flow.
- **User Story 2 (Phase 4)**: Depends on Phase 3 — visual customization.
- **User Story 4, 5, 6 (Phase 5)**: Depends on Phase 2 & 3 — privacy & fallbacks.
- **Polish (Phase 6)**: Depends on all implementation phases.

### Parallel Opportunities [P]

- `T003` (DTO types) and `T004` (Theme definitions) can run in parallel.
- `T007` (PNG route) can run in parallel with `T006` (SVG route).
- `T008` (Live Preview) and `T009` (Export Bar) can run in parallel.
- `T012` (Theme Selector), `T013` (Layout Toggle), and `T014` (Badge Picker) can run in parallel.

---

## Implementation Strategy

### MVP First (Phases 1–3)
1. Complete Phase 1 & 2 (Schema, SVG service, API route).
2. Complete Phase 3 (Card Studio preview & Markdown export).
3. **Validate**: Test card generation & Markdown copy end-to-end.

### Incremental Polish (Phases 4–6)
4. Add theme/layout customization (Phase 4).
5. Harden privacy controls & caching (Phase 5).
6. Run unit tests & production build validation (Phase 6).
