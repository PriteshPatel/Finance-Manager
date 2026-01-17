# Currency UI Visual Reference

## Component Previews

### 1. Currency Badges

```
Small (sm):
┌─────────────────────────────────┐
│ 🇮🇳 INR  │ 🇺🇸 USD  │ 🇪🇺 EUR │
└─────────────────────────────────┘

Medium (md):
┌──────────────────────────────────────┐
│ 🇮🇳 INR ₹  │ 🇺🇸 USD $  │ 🇪🇺 EUR € │
└──────────────────────────────────────┘

Large (lg):
┌────────────────────────────────────────────┐
│ 🇮🇳 INR ₹           │ 🇺🇸 USD $           │
│ 🇪🇺 EUR € - Euro    │ 🇬🇧 GBP £           │
└────────────────────────────────────────────┘
```

### 2. Currency Cards

```
┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │
│      🇮🇳        │  │      🇺🇸        │
│                 │  │                 │
│   INR           │  │   USD           │
│  Indian Rupee   │  │  US Dollar      │
│                 │  │                 │
│   ₹             │  │   $  Active ✓   │
│                 │  │                 │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │
│      🇪🇺        │  │      🇬🇧        │
│                 │  │                 │
│   EUR           │  │   GBP           │
│   Euro          │  │  British Pound  │
│                 │  │                 │
│   €             │  │   £             │
│                 │  │                 │
└─────────────────┘  └─────────────────┘
```

### 3. Currency Selector Dialog

```
┌──────────────────────────────────────┐
│  Select Currency                     │
│  Choose a currency from the dropdown │
├──────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐           │
│  │    🇮🇳   │ │    🇺🇸   │ ...      │
│  │   INR    │ │   USD    │           │
│  │   ₹      │ │   $      │           │
│  │  Indian  │ │   US     │           │
│  │  Rupee   │ │ Dollar   │           │
│  └──────────┘ └──────────┘           │
│                                      │
│  ┌──────────┐ ┌──────────┐           │
│  │    🇪🇺   │ │    🇬🇧   │ ...      │
│  │   EUR    │ │   GBP    │           │
│  │   €      │ │   £      │           │
│  │   Euro   │ │ British  │           │
│  │          │ │  Pound   │           │
│  └──────────┘ └──────────┘           │
└──────────────────────────────────────┘
```

### 4. Currency Info Display

```
┌────────────────────────────────────────┐
│  🇮🇳  Indian Rupee                      │
│       INR                    ₹          │
└────────────────────────────────────────┘
```

### 5. Currency Settings Page

```
┌─────────────────────────────────────┐
│  Current Currency                   │
│  ┌─────────────────────────────────┐│
│  │ 🇮🇳 Indian Rupee            ₹   ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Select Currency                    │
│  [🇮🇳 INR ₹          ▼]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Currency Statistics                │
│  ┌──────────┐ ┌──────────┐ ┌──────┐│
│  │   12     │ │   INR    │ │  ₹   ││
│  │Currencies│ │ Current  │ │Symbol││
│  └──────────┘ └──────────┘ └──────┘│
└─────────────────────────────────────┘
```

## Color Schemes

```
INR - Orange Spectrum
  bg-orange-100  (Light Orange Background)
  text-orange-800 (Dark Orange Text)
  Example: 🇮🇳 INR ₹

USD - Blue Spectrum
  bg-blue-100    (Light Blue Background)
  text-blue-800  (Dark Blue Text)
  Example: 🇺🇸 USD $

EUR - Green Spectrum
  bg-green-100   (Light Green Background)
  text-green-800 (Dark Green Text)
  Example: 🇪🇺 EUR €

GBP - Purple Spectrum
  bg-purple-100  (Light Purple Background)
  text-purple-800 (Dark Purple Text)
  Example: 🇬🇧 GBP £

JPY - Red Spectrum
  bg-red-100     (Light Red Background)
  text-red-800   (Dark Red Text)
  Example: 🇯🇵 JPY ¥
```

## Interactive States

```
Normal State:
┌─────────────────┐
│   🇮🇳 INR ₹     │  ← Gray border
└─────────────────┘

Hover State:
┌─────────────────┐
│   🇮🇸 USD $     │  ← Elevated shadow
└─────────────────┘

Selected State:
┌─────────────────┐
│   🇺🇸 USD $     │  ← Blue border
│  Active ✓      │
└─────────────────┘
```

## Responsive Behavior

### Desktop (lg screens)
```
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Currency│ │ Currency│ │ Currency│
│   1     │ │   2     │ │   3     │
└─────────┘ └─────────┘ └─────────┘
```

### Tablet (md screens)
```
┌─────────┐ ┌─────────┐
│ Currency│ │ Currency│
│   1     │ │   2     │
└─────────┘ └─────────┘
┌─────────┐ ┌─────────┐
│ Currency│ │ Currency│
│   3     │ │   4     │
└─────────┘ └─────────┘
```

### Mobile (sm screens)
```
┌─────────┐
│ Currency│
│   1     │
└─────────┘
┌─────────┐
│ Currency│
│   2     │
└─────────┘
```

## Usage in Different Contexts

### 1. In Navbar
```
Logo | Dashboard | Settings | [🇮🇳 INR] |
```

### 2. In Settings Panel
```
Settings
├─ General
├─ Currency: [🇮🇳 INR ₹ ▼]
└─ Theme
```

### 3. In Transaction Display
```
Income Entry
Amount: 5000
Currency Badge: 🇮🇳 INR ₹
Display: ₹5,000.00
```

### 4. In Analytics
```
Dashboard
┌──────────────────────────────┐
│ 🇮🇳 Indian Rupee              │
│ Total: ₹50,000               │
└──────────────────────────────┘
```

---

**All components are responsive and work seamlessly across all devices!**
