import test from "node:test";
import assert from "node:assert/strict";
import {
  xmlEscape,
  generateStandardCardSvg,
  generateCompactCardSvg,
  generateSyncingCardSvg,
  generateUnavailableCardSvg,
} from "../src/lib/card-svg-renderer.ts";
import { CARD_THEMES, getTheme } from "../src/lib/card-themes.ts";
import type { CardMetricsDTO, ProfileCardConfigDTO, CardTheme } from "../src/types/profile-card.ts";

const mockMetrics: CardMetricsDTO = {
  displayName: "Jane Doe <Dev>",
  leetcodeUsername: "janedoe",
  collegeRank: 4,
  totalSolved: 350,
  easySolved: 150,
  mediumSolved: 150,
  hardSolved: 50,
  contestRating: 1850.5,
  currentStreak: 14,
  badges: [
    { id: "b1", name: "Problem Master", icon: "trophy", rarity: "LEGENDARY", description: "Solved 300+ problems" },
    { id: "b2", name: "Streak Legend", icon: "flame", rarity: "EPIC", description: "14 day streak" },
  ],
  isSyncing: false,
  isDeactivated: false,
  avatarUrl: null,
};

const mockConfig: ProfileCardConfigDTO = {
  id: "cfg-1",
  userId: "user-1",
  cardToken: "token-uuid-1234",
  theme: "github-dark",
  layout: "standard",
  showStreak: true,
  showRating: true,
  showAchievements: true,
  featuredBadgeIds: ["b1", "b2"],
};

test("Card SVG — XML character escaping (FR-408 / Security)", () => {
  assert.equal(xmlEscape('Hello <script>alert("xss")</script> & \'world\''), "Hello &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &apos;world&apos;");
  assert.equal(xmlEscape(null), "");
  assert.equal(xmlEscape(undefined), "");
  assert.equal(xmlEscape(42), "42");
});

test("Card SVG — Standard Banner dimensions and attributes (FR-406)", () => {
  const svg = generateStandardCardSvg(mockMetrics, mockConfig);

  assert.match(svg, /width="495"/);
  assert.match(svg, /height="195"/);
  assert.match(svg, /viewBox="0 0 495 195"/);
  assert.match(svg, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);

  // Escaped name should be present
  assert.match(svg, /Jane Doe &lt;Dev&gt;/);
  // LeetCode handle present
  assert.match(svg, /@janedoe/);
  // Rank badge
  assert.match(svg, /#4 in College/);
  // Stats
  assert.match(svg, />350</);
  assert.match(svg, />150</);
  assert.match(svg, />50</);
  assert.match(svg, />1851</); // Rounded contest rating
  assert.match(svg, /14d/);    // Streak
});

test("Card SVG — Compact Mini dimensions and layout", () => {
  const svg = generateCompactCardSvg(mockMetrics, mockConfig);

  assert.match(svg, /width="350"/);
  assert.match(svg, /height="120"/);
  assert.match(svg, /viewBox="0 0 350 120"/);
  assert.match(svg, />350</);
  assert.match(svg, /#4/);
});

test("Card SVG — Privacy Guardrails: Zero sensitive fields exposed (Constitution Principle 3)", () => {
  const svg = generateStandardCardSvg(mockMetrics, mockConfig);

  // No email address format
  assert.doesNotMatch(svg, /@.*\.com/);
  // No roll numbers or enrollment tokens
  assert.doesNotMatch(svg, /token-uuid-1234/);
  assert.doesNotMatch(svg, /password/i);
});

test("Card SVG — All 5 themes render valid palettes", () => {
  const themes: CardTheme[] = [
    "github-dark",
    "modern-light",
    "cyberpunk-neon",
    "midnight-navy",
    "minimalist",
  ];

  for (const theme of themes) {
    const config = { ...mockConfig, theme };
    const svg = generateStandardCardSvg(mockMetrics, config);
    const themeConfig = getTheme(theme);

    assert.match(svg, new RegExp(themeConfig.colors.background));
    assert.match(svg, new RegExp(themeConfig.colors.accent));
  }
});

test("Card SVG — Graceful Fallback States (US6)", () => {
  // Syncing state
  const syncingSvg = generateSyncingCardSvg("Jane Doe", "github-dark");
  assert.match(syncingSvg, /Syncing Verified Statistics/);
  assert.match(syncingSvg, /Jane Doe/);

  // Unavailable state
  const unavailableSvg = generateUnavailableCardSvg("github-dark");
  assert.match(unavailableSvg, /Profile Unavailable/);
});

test("Card SVG — Metric Visibility Toggles (US2)", () => {
  // Hide streak, hide rating, hide achievements
  const hiddenConfig: ProfileCardConfigDTO = {
    ...mockConfig,
    showStreak: false,
    showRating: false,
    showAchievements: false,
  };

  const svg = generateStandardCardSvg(mockMetrics, hiddenConfig);

  // Rating should not be shown
  assert.doesNotMatch(svg, /Contest Rating/);
  // Streak flame or streak badge should not be shown
  assert.doesNotMatch(svg, /14d Streak/);
  // Badges should not be shown
  assert.doesNotMatch(svg, /Problem Master/);
});

test("Card SVG — Custom Badges Rendering", () => {
  const customBadgesConfig: ProfileCardConfigDTO = {
    ...mockConfig,
    showAchievements: true,
  };

  const customMetrics: CardMetricsDTO = {
    ...mockMetrics,
    badges: [
      { id: "b-epic", name: "Grandmaster", icon: "crown", rarity: "LEGENDARY", description: "Top 1%" },
    ],
  };

  const svg = generateStandardCardSvg(customMetrics, customBadgesConfig);
  assert.match(svg, /Grandmaster/);
});

