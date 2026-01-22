/**
 * HNTR LEGEND Pro - Theme Context
 * Verwaltet das App-Theme (Dark Mode als Standard)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, ThemeType, ColorScheme } from '../constants/colors';

// Storage Key
const THEME_KEY = '@jagdlog_theme';

// Theme Einstellungen
type ThemeSetting = 'light' | 'dark' | 'system';

// Context Interface
interface ThemeContextType {
  // Aktuelles Theme (light/dark)
  theme: ThemeType;
  // Theme-Einstellung (light/dark/system)
  themeSetting: ThemeSetting;
  // Farbschema
  colors: ColorScheme;
  // Ist Dark Mode aktiv?
  isDark: boolean;
  // Theme-Einstellung ändern
  setThemeSetting: (setting: ThemeSetting) => void;
  // Dark Mode umschalten
  toggleTheme: () => void;
}

// Default Context
const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  themeSetting: 'dark',
  colors: COLORS.dark,
  isDark: true,
  setThemeSetting: () => {},
  toggleTheme: () => {},
});

// Hook für einfachen Zugriff
export const useTheme = () => useContext(ThemeContext);

// Provider Props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // System-Theme erkennen
  const systemColorScheme = useColorScheme();

  // Theme-Einstellung (persistiert)
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Aktuelles Theme berechnen
  const theme: ThemeType =
    themeSetting === 'system'
      ? systemColorScheme === 'light'
        ? 'light'
        : 'dark'
      : themeSetting;

  const isDark = theme === 'dark';
  const colors = COLORS[theme];

  // Theme-Einstellung laden
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeSettingState(savedTheme);
        }
      } catch (error) {
        console.warn('[Theme] Fehler beim Laden der Theme-Einstellung:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, []);

  // Theme-Einstellung speichern
  const setThemeSetting = useCallback(async (setting: ThemeSetting) => {
    setThemeSettingState(setting);
    try {
      await AsyncStorage.setItem(THEME_KEY, setting);
    } catch (error) {
      console.warn('[Theme] Fehler beim Speichern der Theme-Einstellung:', error);
    }
  }, []);

  // Dark/Light Toggle
  const toggleTheme = useCallback(() => {
    const newSetting: ThemeSetting = theme === 'dark' ? 'light' : 'dark';
    setThemeSetting(newSetting);
  }, [theme, setThemeSetting]);

  // Warten bis Theme geladen ist
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeSetting,
        colors,
        isDark,
        setThemeSetting,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
