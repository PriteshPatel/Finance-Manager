/**
 * Currency Configuration for Backend
 * This should match the frontend configuration
 */

const CURRENCY_CONFIG = {
  // Currency symbol - change this to update globally
  symbol: '₹',
  
  // Currency code (ISO 4217)
  code: 'INR',
  
  // Symbol position: 'before' or 'after'
  position: 'before',
  
  // Number of decimal places
  decimals: 2,
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {boolean} useSymbol - Whether to include the currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, useSymbol = true) {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: CURRENCY_CONFIG.decimals,
    maximumFractionDigits: CURRENCY_CONFIG.decimals,
  }).format(amount);

  if (!useSymbol) {
    return formatted;
  }

  if (CURRENCY_CONFIG.position === 'before') {
    return `${CURRENCY_CONFIG.symbol}${formatted}`;
  } else {
    return `${formatted} ${CURRENCY_CONFIG.symbol}`;
  }
}

/**
 * Get the currency symbol only
 * @returns {string} Currency symbol
 */
function getCurrencySymbol() {
  return CURRENCY_CONFIG.symbol;
}

/**
 * Get the currency code
 * @returns {string} Currency code (e.g., 'INR', 'USD')
 */
function getCurrencyCode() {
  return CURRENCY_CONFIG.code;
}

module.exports = {
  CURRENCY_CONFIG,
  formatCurrency,
  getCurrencySymbol,
  getCurrencyCode,
};
