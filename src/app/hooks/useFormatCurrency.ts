import { useCurrency } from '../context/CurrencyContext';
import { getCurrencyDetails, CURRENCY_CONFIG } from '../../lib/currency-config';

/**
 * Hook to format currency that reacts to currency changes
 */
export function useFormatCurrency() {
  const { selectedCurrency } = useCurrency();

  return (amount: number, useSymbol: boolean = true): string => {
    const currency = getCurrencyDetails(selectedCurrency);

    if (!currency) {
      // Fallback to default formatting
      const formatted = amount.toLocaleString('en-IN', {
        minimumFractionDigits: CURRENCY_CONFIG.decimals,
        maximumFractionDigits: CURRENCY_CONFIG.decimals,
      });
      if (!useSymbol) return formatted;
      return CURRENCY_CONFIG.position === 'before'
        ? `${CURRENCY_CONFIG.symbol}${formatted}`
        : `${formatted} ${CURRENCY_CONFIG.symbol}`;
    }

    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: CURRENCY_CONFIG.decimals,
      maximumFractionDigits: CURRENCY_CONFIG.decimals,
    });

    if (!useSymbol) {
      return formatted;
    }

    if (CURRENCY_CONFIG.position === 'before') {
      return `${currency.symbol}${formatted}`;
    } else {
      return `${formatted} ${currency.symbol}`;
    }
  };
}
