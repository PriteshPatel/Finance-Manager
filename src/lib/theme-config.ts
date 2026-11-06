/**
 * Theme configuration utilizing Bootstrap v6 alpha design tokens and color-modes.
 * Documentation: https://getbootstrap.com/docs/6.0/customize/color-modes/
 */

export type ThemeId =
  | 'bootstrap-light'
  | 'bootstrap-dark'
  | 'bootstrap-indigo'
  | 'bootstrap-emerald'
  | 'bootstrap-amber'
  | 'bootstrap-cyber'
  | 'bootstrap-rose';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  shortName: string;
  category: 'Light' | 'Dark' | 'Vibrant';
  description: string;
  bsTheme: string; // value for data-bs-theme attribute
  isDark: boolean;
  tokens: {
    primary: string;
    primaryFg: string;
    bg: string;
    card: string;
    border: string;
    accent: string;
  };
  palettePreview: string[]; // Colors for swatch previews
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'bootstrap-light',
    name: 'Bootstrap 6 Classic Light',
    shortName: 'BS Light',
    category: 'Light',
    description: 'Crisp, modern financial workspace powered by Bootstrap 6 Blue and clean white surfaces.',
    bsTheme: 'light',
    isDark: false,
    tokens: {
      primary: '#0d6efd',
      primaryFg: '#ffffff',
      bg: '#ffffff',
      card: '#ffffff',
      border: '#dee2e6',
      accent: '#e7f1ff',
    },
    palettePreview: ['#0d6efd', '#0b5ed7', '#e7f1ff', '#ffffff', '#212529'],
  },
  {
    id: 'bootstrap-dark',
    name: 'Bootstrap 6 Charcoal Dark',
    shortName: 'BS Dark',
    category: 'Dark',
    description: 'Sleek, high-contrast dark mode using Bootstrap 6 OKLCH gray-975 surfaces with blue accents.',
    bsTheme: 'dark',
    isDark: true,
    tokens: {
      primary: '#3d8bfd',
      primaryFg: '#ffffff',
      bg: '#0f1115',
      card: '#181b20',
      border: '#2c313a',
      accent: '#1e2837',
    },
    palettePreview: ['#3d8bfd', '#0f1115', '#181b20', '#2c313a', '#f8f9fa'],
  },
  {
    id: 'bootstrap-indigo',
    name: 'Bootstrap 6 Indigo & Violet',
    shortName: 'Indigo Tech',
    category: 'Dark',
    description: 'Deep modern fintech theme using Bootstrap 6 Indigo-500 and Violet accents for trading & analytics.',
    bsTheme: 'indigo',
    isDark: true,
    tokens: {
      primary: '#6610f2',
      primaryFg: '#ffffff',
      bg: '#0e0b1f',
      card: '#171330',
      border: '#2f2757',
      accent: '#261a4d',
    },
    palettePreview: ['#6610f2', '#6f42c1', '#0e0b1f', '#171330', '#d0bfff'],
  },
  {
    id: 'bootstrap-emerald',
    name: 'Bootstrap 6 Emerald & Mint',
    shortName: 'Emerald Wealth',
    category: 'Light',
    description: 'Refreshing growth-oriented theme using Bootstrap 6 Green-500 and Teal-500 tokens for assets & budgets.',
    bsTheme: 'emerald',
    isDark: false,
    tokens: {
      primary: '#198754',
      primaryFg: '#ffffff',
      bg: '#f4fbf7',
      card: '#ffffff',
      border: '#c7edd8',
      accent: '#d1e7dd',
    },
    palettePreview: ['#198754', '#20c997', '#d1e7dd', '#f4fbf7', '#0f5132'],
  },
  {
    id: 'bootstrap-amber',
    name: 'Bootstrap 6 Amber Sunset',
    shortName: 'Amber Gold',
    category: 'Light',
    description: 'Warm, executive wealth aesthetic with Bootstrap 6 Amber-500 and Orange accents.',
    bsTheme: 'amber',
    isDark: false,
    tokens: {
      primary: '#d97706',
      primaryFg: '#ffffff',
      bg: '#fffbf5',
      card: '#ffffff',
      border: '#fde68a',
      accent: '#fef3c7',
    },
    palettePreview: ['#d97706', '#f59e0b', '#fef3c7', '#fffbf5', '#78350f'],
  },
  {
    id: 'bootstrap-cyber',
    name: 'Bootstrap 6 Pewter & Cyber Cyan',
    shortName: 'Cyber Pewter',
    category: 'Dark',
    description: 'Futuristic theme combining Bootstrap 6 Pewter dark shades with radiant Cyan & Pink highlights.',
    bsTheme: 'cyber',
    isDark: true,
    tokens: {
      primary: '#0dcaf0',
      primaryFg: '#051b24',
      bg: '#0c1015',
      card: '#131922',
      border: '#1f2937',
      accent: '#0d3244',
    },
    palettePreview: ['#0dcaf0', '#d63384', '#0c1015', '#131922', '#cff4fc'],
  },
  {
    id: 'bootstrap-rose',
    name: 'Bootstrap 6 Rose & Crimson',
    shortName: 'Rose Bloom',
    category: 'Vibrant',
    description: 'Bold and elegant styling powered by Bootstrap 6 Pink-500 and Crimson hues.',
    bsTheme: 'rose',
    isDark: false,
    tokens: {
      primary: '#d63384',
      primaryFg: '#ffffff',
      bg: '#fff5f8',
      card: '#ffffff',
      border: '#f8d7da',
      accent: '#fce4ec',
    },
    palettePreview: ['#d63384', '#dc3545', '#fce4ec', '#fff5f8', '#842029'],
  },
];

export const DEFAULT_THEME_ID: ThemeId = 'bootstrap-light';

export function getThemeConfig(id?: string | null): ThemeConfig {
  const match = AVAILABLE_THEMES.find((t) => t.id === id);
  return match || AVAILABLE_THEMES[0];
}
