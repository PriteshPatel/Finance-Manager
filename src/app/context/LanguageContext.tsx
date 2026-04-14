import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_LANGUAGE, getCurrentLanguageCode, type LanguageCode } from '../../lib/language-config';

interface LanguageContextType {
  selectedLanguage: LanguageCode;
  setSelectedLanguage: (code: LanguageCode) => void;
}

const defaultLanguageContext: LanguageContextType = {
  selectedLanguage: DEFAULT_LANGUAGE,
  setSelectedLanguage: () => {
    // no-op fallback when provider is not mounted
  },
};

const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState<LanguageCode>(() => getCurrentLanguageCode());

  const setSelectedLanguage = useCallback((code: LanguageCode) => {
    setSelectedLanguageState(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', code);
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedLanguage,
      setSelectedLanguage,
    }),
    [selectedLanguage, setSelectedLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
