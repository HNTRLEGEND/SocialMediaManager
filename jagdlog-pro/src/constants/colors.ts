/**
 * HNTR LEGEND Pro - Farbschema
 * Jagdliches, seriöses Design mit Dark Mode als Standard
 */

export const COLORS = {
  light: {
    // Primärfarbe: Jagdgrün
    primary: '#4A7C2C',
    // Sekundärfarbe: Gold/Messing
    secondary: '#D4A017',
    // Hintergründe
    background: '#F5F5F0',
    card: '#FFFFFF',
    // Texte
    text: '#2C2C2C',
    textLight: '#666666',
    // Rahmen
    border: '#E0E0D8',
    // Statusfarben
    success: '#4A7C2C',
    warning: '#D4A017',
    error: '#C53030',
    info: '#2B6CB0',
  },
  dark: {
    // Primärfarbe: Dunkles Jagdgrün
    primary: '#5C9A35',
    // Sekundärfarbe: Gedämpftes Gold
    secondary: '#B8941A',
    // Hintergründe
    background: '#1A1A1A',
    card: '#2A2A2A',
    // Texte
    text: '#E5E5E5',
    textLight: '#A0A0A0',
    // Rahmen
    border: '#3A3A3A',
    // Statusfarben
    success: '#5C9A35',
    warning: '#B8941A',
    error: '#E53E3E',
    info: '#4299E1',
  },
} as const;

// Typ-Definitionen für Theme
export type ThemeType = 'light' | 'dark';
export type ColorScheme = typeof COLORS.light | typeof COLORS.dark;

/**
 * Gibt das Farbschema für den angegebenen Theme-Typ zurück
 */
export const getColors = (theme: ThemeType): ColorScheme => {
  return COLORS[theme];
};
