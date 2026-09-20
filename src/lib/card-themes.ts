/**
 * Theme definitions and color palettes for R6 — Shareable GitHub Developer Profile Card
 */

import type { CardTheme, ThemeColors } from '@/types/profile-card';

export interface ThemeConfig {
  id: CardTheme;
  label: string;
  description: string;
  colors: ThemeColors;
}

export const CARD_THEMES: Record<CardTheme, ThemeConfig> = {
  'github-dark': {
    id: 'github-dark',
    label: 'GitHub Dark',
    description: 'Monochrome slate and dark tones matching GitHub standard profile aesthetics.',
    colors: {
      background: '#0d1117',
      cardBorder: '#30363d',
      textPrimary: '#f0f6fc',
      textSecondary: '#8b949e',
      textMuted: '#6e7681',
      accent: '#58a6ff',
      easyBadge: '#2ea043',
      mediumBadge: '#d29922',
      hardBadge: '#f85149',
      rankBadgeBg: 'rgba(88, 166, 255, 0.15)',
      rankBadgeBorder: 'rgba(88, 166, 255, 0.4)',
      rankBadgeText: '#58a6ff',
      streakText: '#f0883e',
      progressBg: '#21262d',
    },
  },
  'modern-light': {
    id: 'modern-light',
    label: 'Modern Light',
    description: 'Clean high-contrast white and slate grey for light-themed repositories.',
    colors: {
      background: '#ffffff',
      cardBorder: '#d0d7de',
      textPrimary: '#1f2328',
      textSecondary: '#656d76',
      textMuted: '#8c959f',
      accent: '#0969da',
      easyBadge: '#1a7f37',
      mediumBadge: '#9a6700',
      hardBadge: '#cf222e',
      rankBadgeBg: 'rgba(9, 105, 218, 0.1)',
      rankBadgeBorder: 'rgba(9, 105, 218, 0.3)',
      rankBadgeText: '#0969da',
      streakText: '#bc4c00',
      progressBg: '#eaeef2',
    },
  },
  'cyberpunk-neon': {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Neon',
    description: 'High-energy futuristic synthwave dark violet with neon pink and cyan accents.',
    colors: {
      background: '#0f051d',
      cardBorder: '#ff007f',
      textPrimary: '#ffffff',
      textSecondary: '#00ffff',
      textMuted: '#b57edc',
      accent: '#ff007f',
      easyBadge: '#00ff66',
      mediumBadge: '#ffe600',
      hardBadge: '#ff0055',
      rankBadgeBg: 'rgba(255, 0, 127, 0.2)',
      rankBadgeBorder: 'rgba(255, 0, 127, 0.6)',
      rankBadgeText: '#ff007f',
      streakText: '#ff8800',
      progressBg: '#24103e',
    },
  },
  'midnight-navy': {
    id: 'midnight-navy',
    label: 'Midnight Navy',
    description: 'Deep oceanic navy with vibrant emerald highlights and soft slate typography.',
    colors: {
      background: '#0b192c',
      cardBorder: '#1e3e62',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent: '#10b981',
      easyBadge: '#34d399',
      mediumBadge: '#fbbf24',
      hardBadge: '#f87171',
      rankBadgeBg: 'rgba(16, 185, 129, 0.15)',
      rankBadgeBorder: 'rgba(16, 185, 129, 0.4)',
      rankBadgeText: '#10b981',
      streakText: '#f59e0b',
      progressBg: '#172554',
    },
  },
  'minimalist': {
    id: 'minimalist',
    label: 'Minimalist Wireframe',
    description: 'Sophisticated monochrome dark zinc with subtle lines and subdued contrast.',
    colors: {
      background: '#18181b',
      cardBorder: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#a1a1aa',
      textMuted: '#71717a',
      accent: '#d4d4d8',
      easyBadge: '#4ade80',
      mediumBadge: '#facc15',
      hardBadge: '#f87171',
      rankBadgeBg: 'rgba(255, 255, 255, 0.08)',
      rankBadgeBorder: 'rgba(255, 255, 255, 0.2)',
      rankBadgeText: '#e4e4e7',
      streakText: '#fb923c',
      progressBg: '#27272a',
    },
  },
};

export const DEFAULT_THEME: CardTheme = 'github-dark';

export function getTheme(themeName?: string): ThemeConfig {
  if (themeName && themeName in CARD_THEMES) {
    return CARD_THEMES[themeName as CardTheme];
  }
  return CARD_THEMES[DEFAULT_THEME];
}
