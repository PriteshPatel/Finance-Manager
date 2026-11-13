import React from 'react';
import { AVAILABLE_CURRENCIES, CURRENCY_CONFIG, getCurrencyDetails, getCurrentCurrencyCode } from '../../../lib/currency-config';
import { useCurrency } from '../../context/CurrencyContext';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

interface CurrencySelectorProps {
  onSelect?: (currencyCode: string) => void;
  showLabel?: boolean;
}

export function CurrencySelector({ onSelect, showLabel = true }: CurrencySelectorProps) {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const activeCode = selectedCurrency || getCurrentCurrencyCode();
  const currentCurrency = getCurrencyDetails(activeCode);

  const handleSelect = (code: string) => {
    setSelectedCurrency(code);
    onSelect?.(code);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-100 justify-content-start">
          <span className="text-lg me-2">{currentCurrency.flag}</span>
          <span className="fw-semibold">{currentCurrency.code}</span>
          <span className="ms-2 fg-2">{currentCurrency.symbol}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="app-max-w-md">
        <DialogHeader>
          <DialogTitle>Select Currency</DialogTitle>
          <DialogDescription>
            Choose your preferred currency for the application
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 app-max-h-96 overflow-y-auto">
          {AVAILABLE_CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className={`p-3 rounded-3 border-2 app-transition app-hover-shadow-md ${
                activeCode === currency.code
                  ? `border-primary ${currency.color} fw-bold`
                  : 'border-keyline app-hover-border'
              }`}
            >
              <div className="text-2xl mb-1">{currency.flag}</div>
              <div className="text-xs fw-semibold">{currency.code}</div>
              <div className="text-xs">{currency.symbol}</div>
              <div className="text-xs fg-2 mt-1">{currency.name}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Currency Badge Component - Display currency with icon and styling
 */
interface CurrencyBadgeProps {
  code?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showFlag?: boolean;
}

export function CurrencyBadge({ 
  code = getCurrentCurrencyCode(), 
  size = 'md',
  showName = false,
  showFlag = true 
}: CurrencyBadgeProps) {
  const currency = AVAILABLE_CURRENCIES.find(c => c.code === code) || AVAILABLE_CURRENCIES[0];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-md',
  };

  return (
    <span className={`${currency.color} rounded-pill fw-semibold d-inline-flex align-items-center gap-1 ${sizeClasses[size]}`}>
      {showFlag && <span>{currency.flag}</span>}
      <span>{currency.code}</span>
      {size !== 'sm' && <span className="fg-2">{currency.symbol}</span>}
      {showName && <span className="d-none sm:d-inline fg-2">- {currency.name}</span>}
    </span>
  );
}

/**
 * Currency Card Component - Display currency information as a card
 */
interface CurrencyCardProps {
  code?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CurrencyCard({ 
  code = getCurrentCurrencyCode(), 
  onClick,
  isSelected = false 
}: CurrencyCardProps) {
  const currency = AVAILABLE_CURRENCIES.find(c => c.code === code) || AVAILABLE_CURRENCIES[0];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-3 border-2 app-cursor-pointer app-transition app-hover-shadow-lg ${
        isSelected
          ? 'border-primary app-focus-ring app-focus-ring shadow-xs app-bg-card fg-body'
          : 'border-keyline app-hover-border-primary app-bg-card fg-body'
      }`}
    >
      <div className="text-4xl mb-2">{currency.flag}</div>
      <h3 className="fw-bold text-lg">{currency.code}</h3>
      <p className="text-sm fg-2">{currency.name}</p>
      <div className="mt-2 d-flex align-items-center gap-2">
        <span className="text-2xl fw-bold">{currency.symbol}</span>
        {isSelected && <span className="text-xs bg-primary fg-contrast-primary fw-semibold px-2 py-1 rounded-pill">Active</span>}
      </div>
    </div>
  );
}

/**
 * Currency Info Display Component
 */
export function CurrencyInfo() {
  const { selectedCurrency } = useCurrency();
  const currency = getCurrencyDetails(selectedCurrency || getCurrentCurrencyCode());

  return (
    <div className="app-bg-card p-4 rounded-4 border border-keyline shadow-xs">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <span className="text-4xl">{currency.flag}</span>
          <div>
            <h3 className="fw-bold text-lg">{currency.name}</h3>
            <p className="text-sm fg-2">{currency.code}</p>
          </div>
        </div>
        <div className={`${currency.color} px-4 py-2 rounded-3 fw-bold text-lg`}>
          {currency.symbol}
        </div>
      </div>
    </div>
  );
}
