# Currency Configuration Guide

This guide explains how to update the currency symbol globally for your Finance Manager application.

## Overview

The currency symbol (₹) is now configurable from a single location. Changing it will automatically update across the entire application (both frontend and backend).

## Frontend Configuration

**File:** `src/lib/currency-config.ts`

### Current Configuration
```typescript
export const CURRENCY_CONFIG = {
  symbol: '₹',        // Currency symbol - change this globally
  code: 'INR',        // ISO 4217 currency code
  position: 'before', // 'before' or 'after' the amount
  decimals: 2,        // Number of decimal places
};
```

### How to Change

1. Open `src/lib/currency-config.ts`
2. Update the `symbol` field with your desired currency symbol:
   ```typescript
   symbol: '$',  // For USD
   // OR
   symbol: '€',  // For EUR
   // OR
   symbol: '£',  // For GBP
   ```
3. Update other fields as needed:
   - `code`: Change to the appropriate ISO 4217 code
   - `position`: Choose 'before' or 'after'
   - `decimals`: Adjust decimal places if needed

### Using in Components

Components automatically use the `formatCurrency()` function:

```typescript
import { formatCurrency } from '../../lib/currency-config';

// In your component
<p>{formatCurrency(1000)}</p>  // Displays: ₹1,000.00 (or your configured currency)
```

## Backend Configuration

**File:** `server/currency-config.js`

The backend has a matching configuration file with the same structure.

### Current Configuration
```javascript
const CURRENCY_CONFIG = {
  symbol: '₹',
  code: 'INR',
  position: 'before',
  decimals: 2,
};
```

### Usage in Backend

```javascript
const { formatCurrency } = require('./currency-config');

// Format amounts
const formatted = formatCurrency(1000);  // Returns: ₹1,000.00
```

## Supported Currency Symbols

| Symbol | Currency | Code |
|--------|----------|------|
| ₹ | Indian Rupee | INR |
| $ | US Dollar | USD |
| € | Euro | EUR |
| £ | British Pound | GBP |
| ¥ | Japanese Yen | JPY |
| ₽ | Russian Ruble | RUB |
| ₩ | South Korean Won | KRW |
| ₪ | Israeli Shekel | ILS |

## Example: Changing to USD

1. **Frontend** - Update `src/lib/currency-config.ts`:
```typescript
export const CURRENCY_CONFIG = {
  symbol: '$',
  code: 'USD',
  position: 'before',
  decimals: 2,
};
```

2. **Backend** - Update `server/currency-config.js`:
```javascript
const CURRENCY_CONFIG = {
  symbol: '$',
  code: 'USD',
  position: 'before',
  decimals: 2,
};
```

3. **Result**: All amounts throughout the app now display as `$1,000.00`

## API Endpoints

The API responses don't include currency symbols - amounts are sent as numbers. The formatting happens on the frontend when displaying to users.

Example API response:
```json
{
  "expenses": [
    {
      "id": "123",
      "amount": 1500,
      "category": "Food"
    }
  ]
}
```

Frontend displays it as: `₹1,500.00` (or your configured currency)

## Components Using Currency Formatting

The following components have been updated to use the global currency configuration:

- Dashboard
- Income Manager
- Expense Manager
- Asset Manager
- Budget Manager
- Analytics Dashboard
- Bank Account Manager

All these components import and use the `formatCurrency()` function for consistent formatting.

## Advanced: Custom Formatting

If you need different formatting for specific cases, you can also use these utilities:

```typescript
import { 
  formatCurrency, 
  getCurrencySymbol, 
  getCurrencyCode 
} from '../../lib/currency-config';

// Get just the symbol
const symbol = getCurrencySymbol();  // Returns: ₹

// Get the currency code
const code = getCurrencyCode();      // Returns: INR

// Format without symbol
const amount = formatCurrency(1000, false);  // Returns: 1,000.00
```

## Verification

After updating the configuration:
1. Save the file
2. The browser should hot-reload
3. Check any page with currency display to verify the change
4. All amounts should now show the new currency symbol

---

**Note**: Keep the frontend and backend configurations in sync for consistency across your application.
