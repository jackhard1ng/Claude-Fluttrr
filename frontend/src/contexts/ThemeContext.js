import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext(null);

/**
 * Color palette for the Fluttrr dark theme.
 */
const DARK_THEME = {
  name: 'dark',
  colors: {
    // Core
    background: '#0A0E27',
    backgroundSecondary: '#0F1336',
    backgroundTertiary: '#151A3D',
    surface: '#1A1F44',
    surfaceHover: '#222855',
    surfaceActive: '#2A3166',

    // Brand
    primary: '#0088FF',
    primaryHover: '#0077E6',
    primaryActive: '#0066CC',
    primaryLight: 'rgba(0, 136, 255, 0.15)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A6C0',
    textTertiary: '#6B7194',
    textInverse: '#0A0E27',

    // Borders
    border: '#1E2448',
    borderLight: '#2A3066',
    borderFocus: '#0088FF',

    // Status
    success: '#00D68F',
    warning: '#FFAA00',
    error: '#FF3D71',
    info: '#0088FF',

    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #0088FF, #00D4FF)',
    gradientAccent: 'linear-gradient(135deg, #7B61FF, #0088FF)',
    gradientWarm: 'linear-gradient(135deg, #FF6B6B, #FFAA00)',
    gradientCard: 'linear-gradient(180deg, rgba(0, 136, 255, 0.05), rgba(0, 136, 255, 0))',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(0, 136, 255, 0.3)',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
};

/**
 * Placeholder light theme for future use.
 * Currently maps to the dark theme.
 */
const LIGHT_THEME = {
  ...DARK_THEME,
  name: 'light',
  // Override colors for light mode when ready
};

const THEMES = {
  dark: DARK_THEME,
  light: LIGHT_THEME,
};

const THEME_KEY = 'fluttrr_theme';

/**
 * ThemeProvider wraps the app and provides the current theme along
 * with a toggle function. Defaults to dark mode.
 */
export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored && THEMES[stored] ? stored : 'dark';
  });

  const theme = useMemo(() => THEMES[themeName], [themeName]);

  /**
   * Toggle between dark and light themes.
   */
  const toggleTheme = useCallback(() => {
    setThemeName((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  /**
   * Set a specific theme by name.
   */
  const setTheme = useCallback((name) => {
    if (THEMES[name]) {
      setThemeName(name);
      localStorage.setItem(THEME_KEY, name);
    }
  }, []);

  // Apply theme CSS custom properties to the document root
  useEffect(() => {
    const root = document.documentElement;
    const { colors } = theme;

    Object.entries(colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case for CSS custom properties
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Set body background
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.textPrimary;

    // Add theme class to body
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${themeName}`);
  }, [theme, themeName]);

  const value = useMemo(
    () => ({
      theme,
      themeName,
      isDark: themeName === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, themeName, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access the theme context.
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
