# 🚀 Quick Reference: Changing Currency

## To Change Currency Symbol Globally

### Location 1: Frontend
**File:** `src/lib/currency-config.ts` (Line 8)

```typescript
symbol: '₹',  // Change this line
```

### Location 2: Backend  
**File:** `server/currency-config.js` (Line 5)

```javascript
symbol: '₹',  // Change this line
```

## Common Currency Changes

### To USD ($)
```typescript
symbol: '$',
code: 'USD',
```

### To EUR (€)
```typescript
symbol: '€',
code: 'EUR',
```

### To GBP (£)
```typescript
symbol: '£',
code: 'GBP',
```

### To JPY (¥)
```typescript
symbol: '¥',
code: 'JPY',
```

## That's It!

1. Update both files above
2. Save
3. Your app automatically reflects the change everywhere

---

**For full documentation:** See `CURRENCY_CONFIGURATION.md`
