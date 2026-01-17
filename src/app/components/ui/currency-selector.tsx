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
        <Button variant="outline" className="w-full justify-start">
          <span className="text-lg mr-2">{currentCurrency.flag}</span>
          <span className="font-semibold">{currentCurrency.code}</span>
          <span className="ml-2 text-gray-500">{currentCurrency.symbol}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Currency</DialogTitle>
          <DialogDescription>
            Choose your preferred currency for the application
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {AVAILABLE_CURRENCIES.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleSelect(currency.code)}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                activeCode === currency.code
                  ? `border-blue-500 ${currency.color} font-bold`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{currency.flag}</div>
              <div className="text-xs font-semibold">{currency.code}</div>
              <div className="text-xs">{currency.symbol}</div>
              <div className="text-xs text-gray-600 mt-1">{currency.name}</div>
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
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`${currency.color} rounded-full font-semibold inline-flex items-center gap-1 ${sizeClasses[size]}`}>
      {showFlag && <span>{currency.flag}</span>}
      <span>{currency.code}</span>
      {size !== 'sm' && <span className="text-gray-600">{currency.symbol}</span>}
      {showName && <span className="hidden sm:inline text-gray-700">- {currency.name}</span>}
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
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? `border-blue-500 ${currency.color} bg-white`
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="text-4xl mb-2">{currency.flag}</div>
      <h3 className="font-bold text-lg">{currency.code}</h3>
      <p className="text-sm text-gray-600">{currency.name}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-2xl font-bold">{currency.symbol}</span>
        {isSelected && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Active</span>}
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
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currency.flag}</span>
          <div>
            <h3 className="font-bold text-lg">{currency.name}</h3>
            <p className="text-sm text-gray-600">{currency.code}</p>
          </div>
        </div>
        <div className={`${currency.color} px-4 py-2 rounded-lg font-bold text-lg`}>
          {currency.symbol}
        </div>
      </div>
    </div>
  );
}
