/**
 * Theme Context
 *
 * Provides theme switching (light/dark/system) with tenant branding support.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { ThemeMode, TenantColorScheme } from './types';

// ============================================================================
// Default Color Schemes
// ============================================================================

/** Intel24 Dark Theme - Blackbox DNA with Deep Blue/Copper accents */
export const DEFAULT_DARK_SCHEME: TenantColorScheme = {
  primary: '#1E3A5F',
  primaryHover: '#2A4A73',
  secondary: '#B87333',
  accent: '#E3B23C',
  accentHover: '#CCA030',
  accentMuted: '#B8942E',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.2)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.18)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.18)',
  info: '#4F8CC9',
  infoSoft: 'rgba(79, 140, 201, 0.24)',
  background: '#0C0E1A',
  backgroundDark: '#080A12',
  surface: '#141824',
  surfaceHover: '#1C2230',
  surfaceElevated: '#1F2535',
  border: '#2A2E3D',
  borderStrong: '#383D4F',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  text: '#E8E6E3',
  textMuted: '#9CA3AF',
  textGold: '#E3B23C',
  copper: '#B87333',
  copperHover: '#A66429',
  copperMuted: 'rgba(184, 115, 51, 0.4)',
  gold: '#E3B23C',
  goldHover: '#CCA030',
  goldMuted: '#B8942E',
  deepBlue: '#1E3A5F',
  deepBlueLight: '#2A4A73',
  overlay: 'rgba(8, 10, 18, 0.9)',
  shadow: '0 0 20px rgba(227, 178, 60, 0.15)',
  shadowStrong: '0 0 30px rgba(227, 178, 60, 0.25)',
};

/** Intel24 Light Theme */
export const DEFAULT_LIGHT_SCHEME: TenantColorScheme = {
  primary: '#1E3A5F',
  primaryHover: '#2F4E77',
  secondary: '#B87333',
  accent: '#B8942E',
  accentHover: '#9A7A24',
  accentMuted: '#8A6A1F',
  danger: '#DC2626',
  dangerSoft: 'rgba(220, 38, 38, 0.12)',
  warning: '#EA580C',
  warningSoft: 'rgba(234, 88, 12, 0.12)',
  success: '#16A34A',
  successSoft: 'rgba(22, 163, 74, 0.12)',
  info: '#1D4ED8',
  infoSoft: 'rgba(29, 78, 216, 0.12)',
  background: '#F5F5F0',
  backgroundDark: '#E8E8E3',
  surface: '#FFFFFF',
  surfaceHover: '#F6F5EF',
  surfaceElevated: '#FFFFFF',
  border: '#D4D4CF',
  borderStrong: '#B8B5A7',
  borderSubtle: 'rgba(26, 26, 26, 0.08)',
  text: '#1A1A1A',
  textMuted: '#5C6471',
  textGold: '#8A6A1F',
  copper: '#B87333',
  copperHover: '#A66429',
  copperMuted: 'rgba(184, 115, 51, 0.35)',
  gold: '#B8942E',
  goldHover: '#9A7A24',
  goldMuted: '#8A6A1F',
  deepBlue: '#193255',
  deepBlueLight: '#2F4E77',
  overlay: 'rgba(3, 7, 18, 0.6)',
  shadow: '0 0 20px rgba(184, 148, 46, 0.12)',
  shadowStrong: '0 0 30px rgba(184, 148, 46, 0.18)',
};

// ============================================================================
// Theme Context Types
// ============================================================================

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  colors: TenantColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================================================
// CSS Custom Properties Helper
// ============================================================================

function applyThemeColors(colors: TenantColorScheme, isDark: boolean): void {
  const root = document.documentElement;
  const setVar = (name: string, value?: string, fallback?: string) => {
    if (value) {
      root.style.setProperty(name, value);
    } else if (fallback) {
      root.style.setProperty(name, fallback);
    }
  };

  // Set color scheme
  root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');

  // Core tokens
  setVar('--color-primary', colors.primary);
  setVar('--color-primary-hover', colors.primaryHover);
  setVar('--color-secondary', colors.secondary);
  setVar('--color-accent', colors.accent);
  setVar('--color-accent-hover', colors.accentHover, colors.accent);
  setVar('--color-accent-muted', colors.accentMuted, colors.accent);
  setVar('--color-accent-blue', colors.deepBlue ?? colors.primary);
  setVar('--color-accent-copper', colors.copper ?? colors.secondary);
  setVar('--color-danger', colors.danger);
  setVar('--color-danger-soft', colors.dangerSoft, 'rgba(229, 62, 62, 0.15)');
  setVar('--color-warning', colors.warning);
  setVar('--color-warning-soft', colors.warningSoft, 'rgba(221, 107, 32, 0.15)');
  setVar('--color-success', colors.success);
  setVar('--color-success-soft', colors.successSoft, 'rgba(56, 161, 105, 0.15)');
  setVar('--color-info', colors.info);
  setVar('--color-info-soft', colors.infoSoft, 'rgba(49, 130, 206, 0.2)');

  // Surfaces
  setVar('--color-background', colors.background);
  setVar('--color-background-dark', colors.backgroundDark);
  setVar('--color-surface', colors.surface);
  setVar('--color-surface-hover', colors.surfaceHover);
  setVar('--color-surface-elevated', colors.surfaceElevated, colors.surface);
  setVar('--color-border', colors.border);
  setVar('--color-border-strong', colors.borderStrong, colors.border);
  setVar('--color-border-subtle', colors.borderSubtle, 'rgba(255, 255, 255, 0.08)');
  root.style.setProperty('--color-border-gold', isDark ? 'rgba(227, 178, 60, 0.3)' : 'rgba(184, 148, 46, 0.35)');

  // Text & accents
  setVar('--color-text', colors.text);
  setVar('--color-text-muted', colors.textMuted);
  setVar('--color-text-gold', colors.textGold, colors.accent);
  setVar('--color-gold', colors.gold, colors.accent);
  setVar('--color-gold-hover', colors.goldHover, colors.accentHover ?? colors.accent);
  setVar('--color-gold-muted', colors.goldMuted, colors.accentMuted ?? colors.accent);
  setVar('--color-copper', colors.copper, colors.secondary);
  setVar('--color-copper-hover', colors.copperHover, colors.secondary);
  setVar('--color-copper-muted', colors.copperMuted, colors.secondary);
  setVar('--color-deep-blue', colors.deepBlue, colors.primary);
  setVar('--color-deep-blue-light', colors.deepBlueLight, colors.primaryHover);

  // Shadows & overlays
  setVar('--color-overlay', colors.overlay, isDark ? 'rgba(8, 10, 18, 0.85)' : 'rgba(0, 0, 0, 0.45)');
  setVar('--shadow-gold', colors.shadow, '0 0 20px rgba(227, 178, 60, 0.15)');
  setVar('--shadow-gold-strong', colors.shadowStrong, '0 0 30px rgba(227, 178, 60, 0.25)');

  // Toggle body class for Tailwind dark mode
  if (isDark) {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
}

// ============================================================================
// Storage Helper
// ============================================================================

const STORAGE_KEY = 'theme-mode';

function getStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage might be unavailable
  }
  return 'system';
}

function setStoredMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Provider Component
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
  darkScheme?: TenantColorScheme;
  lightScheme?: TenantColorScheme;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  darkScheme = DEFAULT_DARK_SCHEME,
  lightScheme = DEFAULT_LIGHT_SCHEME,
  defaultMode,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => defaultMode ?? getStoredMode());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen to system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Resolve the actual theme
  const resolvedTheme = useMemo((): 'light' | 'dark' => {
    if (mode === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemPrefersDark]);

  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkScheme : lightScheme;

  // Apply theme colors when they change
  useEffect(() => {
    applyThemeColors(colors, isDark);
  }, [colors, isDark]);

  // Set mode and persist
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredMode(newMode);
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedTheme, setMode]);

  const value = useMemo((): ThemeContextType => ({
    mode,
    resolvedTheme,
    colors,
    setMode,
    toggleTheme,
    isDark,
  }), [mode, resolvedTheme, colors, setMode, toggleTheme, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
