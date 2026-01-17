import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENCY_CONFIG } from '../../lib/currency-config';

interface CurrencyContextType {
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(CURRENCY_CONFIG.code);

  // Load currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      setSelectedCurrencyState(saved);
    }
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    localStorage.setItem('selectedCurrency', code);
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
