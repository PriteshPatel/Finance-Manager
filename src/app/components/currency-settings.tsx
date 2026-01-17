import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CurrencySelector, CurrencyBadge, CurrencyCard, CurrencyInfo } from './ui/currency-selector';
import { AVAILABLE_CURRENCIES, CURRENCY_CONFIG, getCurrencyDetails, getCurrentCurrencyCode } from '../../lib/currency-config';
import { useCurrency } from '../context/CurrencyContext';

/**
 * Settings Page Component showing all currency UI components
 */
export function CurrencySettings() {
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const activeCode = selectedCurrency || getCurrentCurrencyCode();
  const activeCurrency = getCurrencyDetails(activeCode);

  return (
    <div className="space-y-6 p-6">
      {/* Current Currency Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Currency</CardTitle>
          <CardDescription>Your active currency settings</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyInfo />
        </CardContent>
      </Card>

      {/* Currency Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Currency</CardTitle>
          <CardDescription>Choose a currency from the dropdown</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencySelector onSelect={setSelectedCurrency} />
        </CardContent>
      </Card>

      {/* Currency Badges Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Badges</CardTitle>
          <CardDescription>Different badge sizes and styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Small Badge</h4>
            <div className="flex gap-2 flex-wrap">
              <CurrencyBadge code="INR" size="sm" />
              <CurrencyBadge code="USD" size="sm" />
              <CurrencyBadge code="EUR" size="sm" />
              <CurrencyBadge code="GBP" size="sm" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Medium Badge</h4>
            <div className="flex gap-2 flex-wrap">
              <CurrencyBadge code="INR" size="md" />
              <CurrencyBadge code="USD" size="md" />
              <CurrencyBadge code="EUR" size="md" />
              <CurrencyBadge code="JPY" size="md" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Large Badge with Name</h4>
            <div className="flex gap-2 flex-wrap">
              <CurrencyBadge code="INR" size="lg" showName />
              <CurrencyBadge code="USD" size="lg" showName />
              <CurrencyBadge code="EUR" size="lg" showName />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Available Currencies</CardTitle>
          <CardDescription>Grid view of all supported currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_CURRENCIES.map((currency) => (
              <CurrencyCard
                key={currency.code}
                code={currency.code}
                isSelected={selectedCurrency === currency.code}
                onClick={() => setSelectedCurrency(currency.code)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Statistics</CardTitle>
          <CardDescription>Overview of supported currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Currencies</p>
              <p className="text-3xl font-bold text-blue-600">{AVAILABLE_CURRENCIES.length}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Currency</p>
              <p className="text-3xl font-bold text-green-600">{activeCurrency.code}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Symbol</p>
              <p className="text-3xl font-bold text-purple-600">{activeCurrency.symbol}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
