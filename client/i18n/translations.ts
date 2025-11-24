import enTranslations from './translations/en.json';
import guTranslations from './translations/gu.json';
import hiTranslations from './translations/hi.json';

export type Language = 'en' | 'gu' | 'hi';

export type Translations = typeof enTranslations;

export const translations: Record<Language, Translations> = {
  en: enTranslations,
  gu: guTranslations,
  hi: hiTranslations,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  gu: 'Gujarati',
  hi: 'Hindi',
};

export const getTranslation = (language: Language, key: string, replacements?: Record<string, string>): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  if (replacements) {
    return Object.entries(replacements).reduce((str, [key, val]) => {
      return str.replace(`{${key}}`, val);
    }, value);
  }

  return value;
};
