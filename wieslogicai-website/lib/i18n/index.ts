import de from './translations/de'
import en from './translations/en'

export const translations = {
  de,
  en,
}

export type Locale = keyof typeof translations
export type TranslationKeys = typeof de

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations.de
}

export function useTranslations(locale: Locale) {
  const t = getTranslations(locale)
  return { t, locale }
}

// Helper to get nested translation
export function getNestedTranslation(
  obj: any,
  path: string
): string | any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
