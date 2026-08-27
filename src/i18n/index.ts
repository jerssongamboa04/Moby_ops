import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { authEn } from './locales/en';
import { authEs } from './locales/es';

const i18n = createInstance();

export const supportedLanguages = ['en', 'es'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

function isSupportedLanguage(
  language: string | null | undefined
): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage);
}

const deviceLanguage = getLocales()[0]?.languageCode;

const initialLanguage: SupportedLanguage = isSupportedLanguage(deviceLanguage)
  ? deviceLanguage
  : 'en';

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      en: {
        auth: authEn,
      },
      es: {
        auth: authEs,
      },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: [...supportedLanguages],
    defaultNS: 'auth',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export { i18n };
