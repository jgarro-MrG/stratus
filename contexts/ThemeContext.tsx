import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Theme, UserSettings } from '../types';
import * as api from '../services/api';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  userSettings: UserSettings | null;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  
  const theme = useMemo(() => userSettings?.preferences.theme || 'system', [userSettings]);

  const loadSettings = useCallback(async () => {
    const settings = await api.getUserSettings();
    if (settings) {
        setUserSettings(settings);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSetTheme = useCallback(async (newTheme: Theme) => {
    if (userSettings) {
      const updatedSettings = {
        ...userSettings,
        preferences: {
          ...userSettings.preferences,
          theme: newTheme,
        }
      };
      setUserSettings(updatedSettings);
      await api.updateUserSettings(updatedSettings);
    }
  }, [userSettings]);
  
  // This effect handles applying the theme class based on user settings
  useEffect(() => {
    if (!userSettings) return;

    const root = window.document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    setEffectiveTheme(isDark ? 'dark' : 'light');
  }, [theme, userSettings]);
  
  // This effect handles system theme changes when 'system' is selected
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const isDark = e.matches;
        const root = window.document.documentElement;
        
        root.classList.toggle('dark', isDark);
        setEffectiveTheme(isDark ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme: handleSetTheme, userSettings, effectiveTheme }), [theme, handleSetTheme, userSettings, effectiveTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};