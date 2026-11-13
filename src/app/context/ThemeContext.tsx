import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AVAILABLE_THEMES,
  DEFAULT_THEME_ID,
  getThemeConfig,
  ThemeConfig,
  ThemeId,
} from '../../lib/theme-config';

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'finance_manager_bootstrap_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (saved && AVAILABLE_THEMES.some((t) => t.id === saved)) {
        return saved;
      }
      // Check system color scheme preference
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'bootstrap-dark';
      }
    } catch (e) {
      console.warn('Could not read theme from localStorage', e);
    }
    return DEFAULT_THEME_ID;
  });

  const themeConfig = getThemeConfig(theme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not write theme to localStorage', e);
    }

    const root = document.documentElement;

    // 1. Set the official Bootstrap v6 color-mode attribute
    root.setAttribute('data-bs-theme', themeConfig.bsTheme);

    // 2. Set theme data attribute for custom selectors
    root.setAttribute('data-theme-id', theme);

    // 3. Remove any prior theme-* classes and add the current one
    AVAILABLE_THEMES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
    });
    root.classList.add(`theme-${theme}`);
  }, [theme, themeConfig]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    if (themeConfig.isDark) {
      setThemeState('bootstrap-light');
    } else {
      setThemeState('bootstrap-dark');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themeConfig,
        availableThemes: AVAILABLE_THEMES,
        isDarkMode: themeConfig.isDark,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
