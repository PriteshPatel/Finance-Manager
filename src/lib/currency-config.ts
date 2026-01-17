/**
 * Global Currency Configuration
 * Update these settings to change currency format across the entire application
 */

export const CURRENCY_CONFIG = {
  // Currency symbol - change this to update globally (₹, $, €, £, ¥, etc.)
  symbol: '₹',
  
  // Currency code (ISO 4217)
  code: 'INR',
  
  // Symbol position: 'before' or 'after'
  position: 'before',
  
  // Number of decimal places
  decimals: 2,
};

/**
 * Get current currency code from localStorage or use default
 */
export function getCurrentCurrencyCode(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      return saved;
    }
  }
  return CURRENCY_CONFIG.code;
}

/**
 * Available currencies with icons and metadata
 */
export const AVAILABLE_CURRENCIES = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    icon: '₹',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    icon: '$',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    icon: '€',
    color: 'bg-green-100 text-green-800',
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    icon: '£',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    icon: '¥',
    color: 'bg-red-100 text-red-800',
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    icon: 'A$',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    icon: 'C$',
    color: 'bg-red-100 text-red-900',
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    icon: 'CHF',
    color: 'bg-red-100 text-red-800',
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    icon: '¥',
    color: 'bg-yellow-100 text-yellow-900',
  },
  {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    flag: '🇲🇽',
    icon: '$',
    color: 'bg-green-100 text-green-900',
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    icon: 'S$',
    color: 'bg-red-100 text-red-700',
  },
  {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    flag: '🇭🇰',
    icon: 'HK$',
    color: 'bg-red-100 text-red-600',
  },
];

/**
 * Get currency details by code
 */
export function getCurrencyDetails(code: string) {
  return AVAILABLE_CURRENCIES.find(c => c.code === code) || AVAILABLE_CURRENCIES[0];
}

/**
 * Format a number as currency with dynamic currency support
 * @param amount - The amount to format
 * @param currencyCode - Currency code (optional, uses current selection)
 * @param useSymbol - Whether to include the currency symbol (default: true)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode?: string, useSymbol: boolean = true): string {
  const code = currencyCode || getCurrentCurrencyCode();
  const currency = getCurrencyDetails(code);
  
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
}

/**
 * Get the currency symbol only
 * @returns Currency symbol
 */
export function getCurrencySymbol(): string {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Get the currency code
 * @returns Currency code (e.g., 'INR', 'USD')
 */
export function getCurrencyCode(): string {
  return CURRENCY_CONFIG.code;
}
