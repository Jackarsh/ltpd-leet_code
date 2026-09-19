/**
 * Pure SVG Card Rendering Engine for R6 — Shareable GitHub Developer Profile Card
 *
 * Free of database dependencies so it can run anywhere (serverless, edge, browser, unit tests).
 */

import { getTheme } from './card-themes.ts';
import type {
  CardMetricsDTO,
  ProfileCardConfigDTO,
  CardLayout,
  CardTheme,
} from '../types/profile-card.ts';

/**
 * Escapes characters for safe inclusion in XML / SVG text nodes and attributes.
 */
export function xmlEscape(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Truncates text to a maximum length with an ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
}

/**
 * Generates SVG for "Profile Unavailable" fallback state.
 */
export function generateUnavailableCardSvg(themeName: CardTheme = 'github-dark'): string {
  const theme = getTheme(themeName);
  const colors = theme.colors;

  return `
<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 16px; fill: ${colors.textPrimary}; }
    .subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; fill: ${colors.textSecondary}; }
  </style>
  <rect width="493" height="193" x="1" y="1" rx="10" fill="${colors.background}" stroke="${colors.cardBorder}" stroke-width="1.5" />
  <circle cx="247" cy="80" r="24" fill="${colors.progressBg}" />
  <path d="M247 70v12m0 8h.01" stroke="${colors.textMuted}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <text x="247" y="125" text-anchor="middle" class="title">Profile Unavailable</text>
  <text x="247" y="145" text-anchor="middle" class="subtitle">This developer profile card is private or does not exist.</text>
</svg>
`.trim();
}

/**
 * Generates SVG for "Statistics Syncing..." fallback state.
 */
export function generateSyncingCardSvg(displayName: string, themeName: CardTheme = 'github-dark'): string {
  const theme = getTheme(themeName);
  const colors = theme.colors;
  const safeName = xmlEscape(truncate(displayName, 24));

  return `
<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 700; font-size: 18px; fill: ${colors.textPrimary}; }
    .status { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; fill: ${colors.accent}; }
    .note { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; fill: ${colors.textMuted}; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .spinner { transform-origin: 247px 85px; animation: spin 2s linear infinite; }
  </style>
  <rect width="493" height="193" x="1" y="1" rx="10" fill="${colors.background}" stroke="${colors.cardBorder}" stroke-width="1.5" />
  <text x="24" y="38" class="name">${safeName}</text>
  <g class="spinner">
    <circle cx="247" cy="85" r="18" stroke="${colors.progressBg}" stroke-width="3" fill="none" />
    <path d="M247 67 A18 18 0 0 1 265 85" stroke="${colors.accent}" stroke-width="3" stroke-linecap="round" fill="none" />
  </g>
  <text x="247" y="125" text-anchor="middle" class="status">Syncing Verified Statistics…</text>
  <text x="247" y="145" text-anchor="middle" class="note">LeetCode metrics are currently being ingested. Refresh shortly.</text>
</svg>
`.trim();
}

/**
 * Generates a Standard Banner SVG card (495x195px).
 */
export function generateStandardCardSvg(
  metrics: CardMetricsDTO,
  config: ProfileCardConfigDTO,
  themeOverride?: CardTheme
): string {
  const activeTheme = themeOverride ?? config.theme ?? 'github-dark';
  const theme = getTheme(activeTheme);
  const colors = theme.colors;

  if (metrics.isDeactivated) {
    return generateUnavailableCardSvg(activeTheme);
  }

  if (metrics.isSyncing && metrics.totalSolved === 0) {
    return generateSyncingCardSvg(metrics.displayName, activeTheme);
  }

  const safeName = xmlEscape(truncate(metrics.displayName, 20));
  const safeUsername = xmlEscape(truncate(metrics.leetcodeUsername, 18));
  const safeRank = metrics.collegeRank != null ? `#${metrics.collegeRank} in College` : 'Unranked';

  const total = Math.max(metrics.totalSolved, 1);
  const easyPct = Math.round((metrics.easySolved / total) * 100);
  const medPct = Math.round((metrics.mediumSolved / total) * 100);
  const hardPct = Math.max(0, 100 - easyPct - medPct);

  const showBadges = config.showAchievements && metrics.badges.length > 0;
  const badgesSlice = metrics.badges.slice(0, 3);

  return `
<svg width="495" height="195" viewBox="0 0 495 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; fill: ${colors.textPrimary}; }
    .handle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; fill: ${colors.textSecondary}; }
    .rank-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; fill: ${colors.rankBadgeText}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; fill: ${colors.textPrimary}; }
    .stat-label { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; fill: ${colors.textMuted}; }
    .diff-val { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; font-weight: 700; }
    .streak-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; fill: ${colors.streakText}; }
    .rating-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; fill: ${colors.accent}; }
    .badge-name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 600; fill: ${colors.textPrimary}; }
    .badge-rarity { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; font-weight: 700; fill: ${colors.accent}; text-transform: uppercase; }
    .brand { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; font-weight: 700; fill: ${colors.textMuted}; letter-spacing: 0.5px; }
  </style>

  <!-- Card background -->
  <rect width="493" height="193" x="1" y="1" rx="10" fill="${colors.background}" stroke="${colors.cardBorder}" stroke-width="1.5" />

  <!-- Header: Avatar monogram, Name, Handle & Verified Pill -->
  <g transform="translate(24, 20)">
    <circle cx="16" cy="16" r="16" fill="${colors.progressBg}" stroke="${colors.cardBorder}" stroke-width="1" />
    <text x="16" y="21" text-anchor="middle" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="${colors.accent}">
      ${xmlEscape(metrics.displayName.charAt(0).toUpperCase())}
    </text>

    <text x="42" y="14" class="name">${safeName}</text>
    <text x="42" y="28" class="handle">@${safeUsername}</text>

    <!-- Verification icon -->
    <path d="M125 7l2 4 4 .5-3 3 .8 4-3.8-2-3.8 2 .8-4-3-3 4-.5 2-4z" transform="translate(${Math.min(safeName.length * 9, 140)}, 0)" fill="${colors.accent}" />
  </g>

  <!-- College Rank Badge -->
  <g transform="translate(355, 20)">
    <rect width="116" height="24" rx="12" fill="${colors.rankBadgeBg}" stroke="${colors.rankBadgeBorder}" stroke-width="1" />
    <text x="58" y="16" text-anchor="middle" class="rank-text">${xmlEscape(safeRank)}</text>
  </g>

  <!-- Divider line -->
  <line x1="24" y1="62" x2="471" y2="62" stroke="${colors.cardBorder}" stroke-width="1" stroke-opacity="0.6" />

  <!-- Statistics Grid -->
  <g transform="translate(24, 76)">
    <text x="0" y="24" class="stat-val">${xmlEscape(metrics.totalSolved)}</text>
    <text x="0" y="38" class="stat-label">Problems Solved</text>
  </g>

  <!-- Difficulty Breakdown Bars -->
  <g transform="translate(150, 76)">
    <!-- Easy -->
    <g transform="translate(0, 0)">
      <circle cx="5" cy="8" r="4" fill="${colors.easyBadge}" />
      <text x="15" y="12" class="diff-val" fill="${colors.easyBadge}">Easy</text>
      <text x="55" y="12" class="diff-val" fill="${colors.textPrimary}">${xmlEscape(metrics.easySolved)}</text>
    </g>

    <!-- Medium -->
    <g transform="translate(95, 0)">
      <circle cx="5" cy="8" r="4" fill="${colors.mediumBadge}" />
      <text x="15" y="12" class="diff-val" fill="${colors.mediumBadge}">Med</text>
      <text x="50" y="12" class="diff-val" fill="${colors.textPrimary}">${xmlEscape(metrics.mediumSolved)}</text>
    </g>

    <!-- Hard -->
    <g transform="translate(180, 0)">
      <circle cx="5" cy="8" r="4" fill="${colors.hardBadge}" />
      <text x="15" y="12" class="diff-val" fill="${colors.hardBadge}">Hard</text>
      <text x="55" y="12" class="diff-val" fill="${colors.textPrimary}">${xmlEscape(metrics.hardSolved)}</text>
    </g>

    <!-- Segmented Progress Bar -->
    <g transform="translate(0, 24)">
      <rect width="240" height="7" rx="3.5" fill="${colors.progressBg}" />
      <rect width="${Math.round(240 * (easyPct / 100))}" height="7" rx="3.5" fill="${colors.easyBadge}" />
      <rect x="${Math.round(240 * (easyPct / 100))}" width="${Math.round(240 * (medPct / 100))}" height="7" rx="0" fill="${colors.mediumBadge}" />
      <rect x="${Math.round(240 * ((easyPct + medPct) / 100))}" width="${Math.round(240 * (hardPct / 100))}" height="7" rx="3.5" fill="${colors.hardBadge}" />
    </g>
  </g>

  <!-- Rating & Streak Column -->
  <g transform="translate(405, 76)">
    ${config.showRating ? `
      <g transform="translate(0, 4)">
        <text x="0" y="8" class="stat-label">Rating</text>
        <text x="0" y="24" class="rating-val">${metrics.contestRating != null ? Math.round(metrics.contestRating) : 'Unrated'}</text>
      </g>
    ` : ''}

    ${config.showStreak ? `
      <g transform="translate(0, 36)">
        <text x="0" y="8" class="stat-label">Streak</text>
        <text x="0" y="24" class="streak-val">🔥 ${metrics.currentStreak}d</text>
      </g>
    ` : ''}
  </g>

  <!-- Divider line -->
  <line x1="24" y1="140" x2="471" y2="140" stroke="${colors.cardBorder}" stroke-width="1" stroke-opacity="0.6" />

  <!-- Footer -->
  <g transform="translate(24, 150)">
    ${showBadges ? `
      <g>
        ${badgesSlice.map((b, idx) => `
          <g transform="translate(${idx * 115}, 4)">
            <rect width="105" height="24" rx="6" fill="${colors.progressBg}" stroke="${colors.cardBorder}" stroke-width="1" />
            <text x="8" y="16" class="badge-name">${xmlEscape(truncate(b.name, 12))}</text>
            <text x="96" y="16" text-anchor="end" class="badge-rarity">${b.rarity.charAt(0)}</text>
          </g>
        `).join('')}
      </g>
    ` : `
      <g transform="translate(0, 6)">
        <rect width="115" height="22" rx="6" fill="${colors.progressBg}" stroke="${colors.cardBorder}" stroke-width="1" />
        <text x="10" y="15" class="badge-name">⭐ Active Learner</text>
      </g>
    `}

    <text x="447" y="20" text-anchor="end" class="brand">CODERANK</text>
  </g>
</svg>
`.trim();
}

/**
 * Generates a Compact Mini Card SVG card (350x120px).
 */
export function generateCompactCardSvg(
  metrics: CardMetricsDTO,
  config: ProfileCardConfigDTO,
  themeOverride?: CardTheme
): string {
  const activeTheme = themeOverride ?? config.theme ?? 'github-dark';
  const theme = getTheme(activeTheme);
  const colors = theme.colors;

  if (metrics.isDeactivated) {
    return generateUnavailableCardSvg(activeTheme);
  }

  const safeName = xmlEscape(truncate(metrics.displayName, 16));
  const safeRank = metrics.collegeRank != null ? `#${metrics.collegeRank}` : '—';

  return `
<svg width="350" height="120" viewBox="0 0 350 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .name { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 700; fill: ${colors.textPrimary}; }
    .rank { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 600; fill: ${colors.rankBadgeText}; }
    .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 800; fill: ${colors.textPrimary}; }
    .stat-lbl { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; font-weight: 600; text-transform: uppercase; fill: ${colors.textMuted}; }
    .pill-val { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 11px; font-weight: 700; }
    .streak { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; fill: ${colors.streakText}; }
    .rating { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; fill: ${colors.accent}; }
    .brand { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 8px; font-weight: 700; fill: ${colors.textMuted}; }
  </style>

  <rect width="348" height="118" x="1" y="1" rx="8" fill="${colors.background}" stroke="${colors.cardBorder}" stroke-width="1.5" />

  <g transform="translate(16, 16)">
    <text x="0" y="12" class="name">${safeName}</text>
    <g transform="translate(250, 0)">
      <rect width="64" height="18" rx="9" fill="${colors.rankBadgeBg}" stroke="${colors.rankBadgeBorder}" stroke-width="1" />
      <text x="32" y="13" text-anchor="middle" class="rank">${xmlEscape(safeRank)}</text>
    </g>
  </g>

  <line x1="16" y1="42" x2="334" y2="42" stroke="${colors.cardBorder}" stroke-width="1" stroke-opacity="0.6" />

  <g transform="translate(16, 54)">
    <text x="0" y="18" class="stat-val">${xmlEscape(metrics.totalSolved)}</text>
    <text x="0" y="30" class="stat-lbl">Solved</text>

    <g transform="translate(68, 8)">
      <circle cx="4" cy="5" r="3" fill="${colors.easyBadge}" />
      <text x="12" y="8" class="pill-val" fill="${colors.easyBadge}">${xmlEscape(metrics.easySolved)}</text>

      <circle cx="4" cy="20" r="3" fill="${colors.mediumBadge}" />
      <text x="12" y="23" class="pill-val" fill="${colors.mediumBadge}">${xmlEscape(metrics.mediumSolved)}</text>

      <circle cx="40" cy="20" r="3" fill="${colors.hardBadge}" />
      <text x="48" y="23" class="pill-val" fill="${colors.hardBadge}">${xmlEscape(metrics.hardSolved)}</text>
    </g>

    <g transform="translate(170, 8)">
      ${config.showStreak ? `<text x="0" y="8" class="streak">🔥 ${metrics.currentStreak}d streak</text>` : ''}
      ${config.showRating ? `<text x="0" y="23" class="rating">⭐ ${metrics.contestRating != null ? Math.round(metrics.contestRating) : 'Unrated'}</text>` : ''}
    </g>

    <text x="316" y="44" text-anchor="end" class="brand">CODERANK</text>
  </g>
</svg>
`.trim();
}

/**
 * Public dispatcher: renders SVG given metrics and layout preference.
 */
export function renderCardSvg(
  metrics: CardMetricsDTO,
  config: ProfileCardConfigDTO,
  layoutOverride?: CardLayout,
  themeOverride?: CardTheme
): string {
  const layout = layoutOverride ?? config.layout ?? 'standard';
  if (layout === 'compact') {
    return generateCompactCardSvg(metrics, config, themeOverride);
  }
  return generateStandardCardSvg(metrics, config, themeOverride);
}
