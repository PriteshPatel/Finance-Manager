import { useLanguage } from '../context/LanguageContext';
import { getTranslation, translations } from '../../lib/language-config';

export type TranslationKey = keyof (typeof translations)['en'];

/**
 * Hook to get translations that react to language changes
 */
export function useTranslation() {
  const { selectedLanguage } = useLanguage();

  return (key: TranslationKey): string => {
    return getTranslation(key, selectedLanguage);
  };
}
