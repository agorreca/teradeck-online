import { Translations } from '@shared/i18n';
import { Language } from '@shared/types/game';
import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const currentLanguage = i18n.language as Language;
  const translations = i18n.getResourceBundle(
    currentLanguage,
    'translation'
  ) as Translations;

  const changeLanguage = async (newLanguage: Language) => {
    await i18n.changeLanguage(newLanguage);
  };

  return {
    t, // Direct access to i18next t function
    language: currentLanguage,
    translations, // Access to full translation object
    changeLanguage,
    isSpanish: currentLanguage === Language.SPANISH,
    isEnglish: currentLanguage === Language.ENGLISH,

    // Helper functions for common patterns
    tCard: (cardKey: string) => t(`cards.${cardKey}`),
    tUI: (uiKey: string) => t(`ui.${uiKey}`),
    tError: (errorKey: string) => t(`errors.${errorKey}`),
    tAction: (actionKey: string) => t(`actions.${actionKey}`),
  };
}
