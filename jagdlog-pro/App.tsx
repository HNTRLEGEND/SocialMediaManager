import React, { createContext, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  isDark: false,
  setMode: () => undefined,
});

export default function App() {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const palette = isDark ? COLORS.dark : COLORS.light;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.card,
        text: palette.text,
        border: palette.border,
      },
    };
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode }}>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}
