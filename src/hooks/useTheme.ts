// src/hooks/useTheme.ts
'use client';
import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'nutritrack_theme';

export function useTheme(defaultTheme: Theme = 'light'): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) return storedTheme;
      // Check system preference if no theme is stored
      // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      // return systemPrefersDark ? 'dark' : 'light'; 
      // For a simple toggle, we start with default or stored, not system preference initially unless explicitly set to 'system'
    }
    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  // Initialize theme on mount based on localStorage or default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        // If no stored theme, apply default (which might be light)
        // Or, if you want to respect system preference on first load without stored theme:
        // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // setTheme(systemPrefersDark ? 'dark' : defaultTheme);
        // For this toggle, it's simpler to just use the default if nothing is stored.
        setTheme(defaultTheme);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return [theme, toggleTheme];
}
