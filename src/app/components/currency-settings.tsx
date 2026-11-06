import React from 'react';
import { Badge } from './ui/badge';
import { ThemePickerCards, ThemeLiveShowcase } from './ui/theme-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CurrencySelector, CurrencyBadge, CurrencyCard, CurrencyInfo } from './ui/currency-selector';
import { LanguageSelector, LanguageBadge, LanguageCard, LanguageInfo } from './ui/language-selector';
import { AVAILABLE_CURRENCIES, CURRENCY_CONFIG, getCurrencyDetails, getCurrentCurrencyCode } from '../../lib/currency-config';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../../lib/language-config';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Settings Page Component showing all currency and language UI components
 */
export function CurrencySettings() {
  const t = useTranslation();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const activeCode = selectedCurrency || getCurrentCurrencyCode();
  const activeCurrency = getCurrencyDetails(activeCode);

  return (
    <div className="space-y-8 p-6">
      {/* Bootstrap v6 Alpha Themes Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Bootstrap v6 Themes</h2>
            <p className="text-sm text-muted-foreground">
              Built using <a href="https://getbootstrap.com/docs/6.0/" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">Bootstrap v6 alpha</a> color-modes (<code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">data-bs-theme</code>) and modern OKLCH tokens
            </p>
          </div>
          <Badge variant="outline" className="w-fit border-primary text-primary font-mono text-xs">
            Bootstrap v6.0-alpha
          </Badge>
        </div>

        <ThemePickerCards />
        <ThemeLiveShowcase />
      </div>

      {/* Currency Section Header */}
      <div className="border-t border-border pt-6">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Currency Preferences</h2>
      </div>
      {/* Current Currency Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentCurrency')}</CardTitle>
          <CardDescription>{t('yourActiveLanguage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyInfo />
        </CardContent>
      </Card>

      {/* Currency Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectCurrency')}</CardTitle>
          <CardDescription>Choose a currency from the dropdown</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencySelector onSelect={setSelectedCurrency} />
        </CardContent>
      </Card>

      {/* Language Divider */}
      <div className="border-t-2 border-gray-200 pt-6">
        <h2 className="text-2xl font-bold mb-6">{t('currentLanguage')}</h2>
      </div>

      {/* Current Language Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currentLanguage')}</CardTitle>
          <CardDescription>{t('yourActiveLanguage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageInfo />
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectLanguage')}</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector onSelect={setSelectedLanguage} />
        </CardContent>
      </Card>

      {/* Language Badges Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Language Badges</CardTitle>
          <CardDescription>Different badge sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Small Badges</h4>
            <div className="flex gap-2 flex-wrap">
              <LanguageBadge code="en" size="sm" />
              <LanguageBadge code="es" size="sm" />
              <LanguageBadge code="fr" size="sm" />
              <LanguageBadge code="de" size="sm" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Medium Badges</h4>
            <div className="flex gap-2 flex-wrap">
              <LanguageBadge code="en" size="md" />
              <LanguageBadge code="zh" size="md" />
              <LanguageBadge code="ja" size="md" />
              <LanguageBadge code="hi" size="md" />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Large Badges</h4>
            <div className="flex gap-2 flex-wrap">
              <LanguageBadge code="pt" size="lg" />
              <LanguageBadge code="ru" size="lg" />
              <LanguageBadge code="ar" size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allLanguages')}</CardTitle>
          <CardDescription>Grid view of all supported languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_LANGUAGES.map((language) => (
              <LanguageCard
                key={language.code}
                code={language.code as LanguageCode}
                isSelected={selectedLanguage === language.code}
                onClick={() => setSelectedLanguage(language.code as LanguageCode)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('languageStatistics')}</CardTitle>
          <CardDescription>Overview of supported languages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl shadow-xs">
              <p className="text-sm text-muted-foreground">{t('totalLanguages')}</p>
              <p className="text-3xl font-bold text-primary">{SUPPORTED_LANGUAGES.length}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-xs">
              <p className="text-sm text-muted-foreground">{t('currentLanguage')}</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{selectedLanguage.toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t('currencyStatistics')}</CardTitle>
          <CardDescription>Overview of supported currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl shadow-xs">
              <p className="text-sm text-muted-foreground">{t('totalCurrencies')}</p>
              <p className="text-3xl font-bold text-primary">{AVAILABLE_CURRENCIES.length}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-xs">
              <p className="text-sm text-muted-foreground">{t('currentCurrency')}</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeCurrency.code}</p>
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-xs">
              <p className="text-sm text-muted-foreground">{t('symbol')}</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{activeCurrency.symbol}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
