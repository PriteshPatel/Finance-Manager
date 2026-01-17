# Currency UI Components Guide

## Overview

Enhanced currency selection interface with visual badges, icons, and cards for a better user experience.

## Components

### 1. CurrencySelector
Main currency selection dialog with grid layout.

```tsx
import { CurrencySelector } from './ui/currency-selector';

<CurrencySelector onSelect={(code) => console.log(code)} showLabel={true} />
```

**Features:**
- Grid display of all currencies
- Flag emojis for visual recognition
- Click to select
- Highlighted active currency

### 2. CurrencyBadge
Compact badge display for currency information.

```tsx
import { CurrencyBadge } from './ui/currency-selector';

// Small badge
<CurrencyBadge code="USD" size="sm" />

// Medium badge with name
<CurrencyBadge code="EUR" size="md" showName={true} />

// Large badge with flag
<CurrencyBadge code="INR" size="lg" showFlag={true} />
```

**Props:**
- `code`: Currency code (e.g., 'USD')
- `size`: 'sm' | 'md' | 'lg'
- `showName`: Display full currency name
- `showFlag`: Display country flag emoji

**Sizes:**
- **sm**: Small compact badge (text-xs)
- **md**: Medium badge (text-sm) - default
- **lg**: Large badge (text-base)

### 3. CurrencyCard
Card-style display with interactive selection.

```tsx
import { CurrencyCard } from './ui/currency-selector';

<CurrencyCard 
  code="GBP" 
  onClick={() => console.log('Selected GBP')}
  isSelected={true}
/>
```

**Features:**
- Large flag emoji display
- Currency name and code
- Active state indicator
- Clickable for selection
- Hover effects

### 4. CurrencyInfo
Informational display of current currency.

```tsx
import { CurrencyInfo } from './ui/currency-selector';

<CurrencyInfo />
```

**Shows:**
- Country flag
- Currency name
- Currency code
- Currency symbol
- Styled badge format

### 5. CurrencySettings
Complete settings page with all components.

```tsx
import { CurrencySettings } from './currency-settings';

<CurrencySettings />
```

## Supported Currencies

| Code | Symbol | Name | Flag |
|------|--------|------|------|
| INR | ₹ | Indian Rupee | 🇮🇳 |
| USD | $ | US Dollar | 🇺🇸 |
| EUR | € | Euro | 🇪🇺 |
| GBP | £ | British Pound | 🇬🇧 |
| JPY | ¥ | Japanese Yen | 🇯🇵 |
| AUD | A$ | Australian Dollar | 🇦🇺 |
| CAD | C$ | Canadian Dollar | 🇨🇦 |
| CHF | CHF | Swiss Franc | 🇨🇭 |
| CNY | ¥ | Chinese Yuan | 🇨🇳 |
| MXN | $ | Mexican Peso | 🇲🇽 |
| SGD | S$ | Singapore Dollar | 🇸🇬 |
| HKD | HK$ | Hong Kong Dollar | 🇭🇰 |

## Color Coding

Each currency has a unique color scheme:

```tsx
// INR - Orange
bg-orange-100 text-orange-800

// USD - Blue
bg-blue-100 text-blue-800

// EUR - Green
bg-green-100 text-green-800

// GBP - Purple
bg-purple-100 text-purple-800

// JPY - Red
bg-red-100 text-red-800
```

## Usage Examples

### Example 1: Add to Dashboard
```tsx
import { CurrencyInfo, CurrencyBadge } from './ui/currency-selector';

export function Dashboard() {
  return (
    <div>
      <CurrencyInfo />
      <p>Current: <CurrencyBadge size="sm" /></p>
    </div>
  );
}
```

### Example 2: Currency Selection Modal
```tsx
import { CurrencySelector } from './ui/currency-selector';

export function Settings() {
  const handleCurrencyChange = (code) => {
    // Update currency in your app
    console.log(`Changed to ${code}`);
  };

  return (
    <CurrencySelector onSelect={handleCurrencyChange} />
  );
}
```

### Example 3: Currency Display Grid
```tsx
import { CurrencyCard, AVAILABLE_CURRENCIES } from './ui/currency-selector';

export function CurrencyGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {AVAILABLE_CURRENCIES.map(currency => (
        <CurrencyCard key={currency.code} code={currency.code} />
      ))}
    </div>
  );
}
```

## Styling

All components use Tailwind CSS with:
- Responsive design
- Hover effects
- Active states
- Color-coded backgrounds
- Smooth transitions

## Integration

Add to your navigation or settings:

```tsx
import { CurrencySettings } from './currency-settings';

// In your main app or settings page
<CurrencySettings />
```

## Features

✅ Visual currency selection with flags
✅ Multiple display sizes
✅ Color-coded by currency
✅ Active currency indicator
✅ Responsive grid layout
✅ Interactive cards
✅ Information displays
✅ Accessible design

---

**See:** `CurrencySettings` component for complete working example with all UI elements.
