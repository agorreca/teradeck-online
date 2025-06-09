import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translations
import de from './locales/de.json';
import enGB from './locales/en-GB.json';
import en from './locales/en.json';
import esAR from './locales/es-AR.json';
import esES from './locales/es-ES.json';
import esMX from './locales/es-MX.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

const resources = {
  es: { translation: es },
  'es-AR': { translation: esAR },
  'es-ES': { translation: esES },
  'es-MX': { translation: esMX },
  en: { translation: en },
  'en-US': { translation: en },
  'en-GB': { translation: enGB },
  fr: { translation: fr },
  pt: { translation: pt },
  it: { translation: it },
  de: { translation: de },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Spanish as default

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'teradeck-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
