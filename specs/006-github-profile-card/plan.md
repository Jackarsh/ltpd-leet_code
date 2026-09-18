# Implementation Plan: R6 — Shareable GitHub Developer Profile Card

**Roadmap Entry**: R6 — GitHub Profile Card  
**Feature Directory**: [`specs/006-github-profile-card/`](file:///C:/Users/devvrat/Projects/leet_code/specs/006-github-profile-card/)  
**Created**: 2026-09-17  
**Status**: Ready for Implementation

---

## 1. Scope & Objective

Build an interactive Profile Card Studio and dynamic public SVG asset endpoint allowing students to customize, preview, and embed verified developer coding stats cards into GitHub READMEs and personal portfolios.

---

## 2. Technical Architecture & Components

### 2.1. Vector Card Generation Subsystem (Dynamic SVG Route Handler)
- `src/app/api/cards/[id]/route.ts`:
  - Public Next.js Route Handler resolving student via public username or opaque card token.
  - Generates standalone, valid vector XML (`image/svg+xml`).
  - Layout Dimensions: Standard Banner (`495×195px`, default) and Compact Mini Card (`350×120px`) via `?layout=compact`.
  - Content Sanitization: XML-escapes display names to prevent XSS/XML injection.
  - HTTP Headers: `Content-Type: image/svg+xml`, `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=1800, s-maxage=1800`.
- `src/server/services/card-svg.service.ts`:
  - Theme Engine: Applies color palettes (GitHub Dark, Modern Light, Cyberpunk/Neon, Midnight Navy, Minimalist).
  - Renders student name, LeetCode handle, college rank, difficulty metrics, contest rating, streak, and top 3 featured badges.
  - Graceful Fallback: Renders "Statistics Syncing..." SVG for pending accounts and "Profile Unavailable" for deactivated users.

### 2.2. Raster PNG Fallback Route
- `src/app/api/cards/[id].png/route.ts`: Optional `@resvg/resvg-js` or Sharp rasterizer converting dynamic SVG into PNG for platforms that block SVGs.

### 2.3. Frontend Card Studio (Student Experience)
- `src/app/(student)/studio/card/page.tsx`: Interactive studio page.
- `src/components/card-studio/CardLivePreview.tsx`: Real-time SVG preview canvas.
- `src/components/card-studio/ThemeSelector.tsx`: Preset picker with visual swatch tiles.
- `src/components/card-studio/LayoutToggle.tsx`: Standard Banner vs Compact toggle.
- `src/components/card-studio/BadgePicker.tsx`: Modal selecting up to 3 unlocked achievements to feature.
- `src/components/card-studio/ExportBar.tsx`: One-click "Copy GitHub Markdown" (`[![...](...)](...)`) and "Copy Image URL".

---

## 3. Data Model & Prisma Schema Slice

```prisma
model ProfileCardConfig {
  id                  String        @id @default(uuid())
  userId              String        @unique
  user                User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardToken           String        @unique @default(uuid())
  theme               String        @default("github-dark")
  layout              String        @default("standard")
  showStreak          Boolean       @default(true)
  showRating          Boolean       @default(true)
  showAchievements    Boolean       @default(true)
  featuredBadgeIds    String[]      // Up to 3 achievement IDs
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  @@index([cardToken])
}
```

---

## 4. Privacy & Rate Limiting Guardrails

- Rate Limiting: 120 req/min per non-proxy client IP (via Upstash/Redis token bucket).
- Privacy: Roll numbers, emails, and internal IDs are completely excluded from the generated SVG DOM.

---

## 5. Verification & Testing Strategy

- **Unit Tests**: SVG XML syntax validity test (0 XML parsing errors across all themes); character escaping test (e.g. `<script>`, `&`, `"`).
- **Integration Tests**: Card configuration persistence, public URL resolution via username and token.
- **Visual Regression Tests**: SVG rendering consistency across dark/light mode environments.
