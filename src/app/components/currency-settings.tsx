import React from 'react';
import { Badge } from './ui/badge';
import { ThemePickerCards, ThemeLiveShowcase } from './ui/theme-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CurrencySelector, CurrencyBadge, CurrencyCard, CurrencyInfo } from './ui/currency-selector';
import { LanguageSelector, LanguageBadge, LanguageCard, LanguageInfo } from './ui/language-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AVAILABLE_CURRENCIES, getCurrencyDetails, getCurrentCurrencyCode } from '../../lib/currency-config';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../../lib/language-config';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { Palette, Coins, Languages, Sparkles } from 'lucide-react';

/**
 * Settings Page Component
 * Restructured with centered sub-tabs for Themes, Currency, and Language
 */
export function CurrencySettings() {
  const t = useTranslation();
  const { selectedCurrency, setSelectedCurrency } = useCurrency();
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const activeCode = selectedCurrency || getCurrentCurrencyCode();
  const activeCurrency = getCurrencyDetails(activeCode);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Settings Navigation Sub-Tabs */}
      <Tabs defaultValue="themes" className="w-full space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-11 p-1 bg-muted/80 rounded-xl border border-border shadow-xs">
            <TabsTrigger
              value="themes"
              className="h-9 gap-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
            >
              <Palette className="h-4 w-4" />
              <span>Themes</span>
            </TabsTrigger>
            <TabsTrigger
              value="currency"
              className="h-9 gap-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
            >
              <Coins className="h-4 w-4" />
              <span>Currency</span>
            </TabsTrigger>
            <TabsTrigger
              value="language"
              className="h-9 gap-2 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
            >
              <Languages className="h-4 w-4" />
              <span>Language</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* =========================================================================
            Tab 1: Bootstrap v6 Themes
           ========================================================================= */}
        <TabsContent value="themes" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Bootstrap v6 Themes
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Select a color mode powered by{' '}
                    <a
                      href="https://getbootstrap.com/docs/6.0/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline font-medium"
                    >
                      Bootstrap v6 alpha
                    </a>{' '}
                    color-modes (<code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">data-bs-theme</code>) and modern OKLCH tokens
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit border-primary text-primary font-mono text-xs">
                  Bootstrap v6.0-alpha
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <ThemePickerCards />
          <ThemeLiveShowcase />
        </TabsContent>

        {/* =========================================================================
            Tab 2: Currency Preferences
           ========================================================================= */}
        <TabsContent value="currency" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Currency Preferences
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Manage active display currency, decimal formats, and symbols across your portfolio
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  Active: {activeCurrency.code} ({activeCurrency.symbol})
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Active & Dropdown Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('currentCurrency')}</CardTitle>
                <CardDescription>Currently applied across the entire app</CardDescription>
              </CardHeader>
              <CardContent>
                <CurrencyInfo />
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('selectCurrency')}</CardTitle>
                <CardDescription>Choose from the search & dropdown dialog</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center pt-2">
                <CurrencySelector onSelect={setSelectedCurrency} />
              </CardContent>
            </Card>
          </div>

          {/* All Currencies Grid */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All Supported Currencies</CardTitle>
              <CardDescription>Click any currency card below to switch instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {AVAILABLE_CURRENCIES.map((currency) => (
                  <CurrencyCard
                    key={currency.code}
                    code={currency.code}
                    isSelected={activeCode === currency.code}
                    onClick={() => setSelectedCurrency(currency.code)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Currency Statistics */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">{t('currencyStatistics')}</CardTitle>
              <CardDescription>Overview of currency configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl shadow-xs">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('totalCurrencies')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">{AVAILABLE_CURRENCIES.length}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-xs">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('currentCurrency')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{activeCurrency.code}</p>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl shadow-xs">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('symbol')}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{activeCurrency.symbol}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================================================
            Tab 3: Language & Localization
           ========================================================================= */}
        <TabsContent value="language" className="space-y-6 focus-visible:outline-none">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    Language & Localization
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Choose your preferred display language for UI controls, navigation, and charts
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-semibold text-xs">
                  Active: {selectedLanguage.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Quick Active & Dropdown Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('currentLanguage')}</CardTitle>
                <CardDescription>{t('yourActiveLanguage')}</CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageInfo />
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('selectLanguage')}</CardTitle>
                <CardDescription>Choose preferred language from the dialog</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center pt-2">
                <LanguageSelector onSelect={setSelectedLanguage} />
              </CardContent>
            </Card>
          </div>

          {/* All Languages Grid */}
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('allLanguages')}</CardTitle>
              <CardDescription>Click any language card below to switch instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

          {/* Badges and Language Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Language Badges</CardTitle>
                <CardDescription>Stylized language indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Small Badges</h4>
                  <div className="flex gap-2 flex-wrap">
                    <LanguageBadge code="en" size="sm" />
                    <LanguageBadge code="es" size="sm" />
                    <LanguageBadge code="fr" size="sm" />
                    <LanguageBadge code="de" size="sm" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Medium Badges</h4>
                  <div className="flex gap-2 flex-wrap">
                    <LanguageBadge code="en" size="md" />
                    <LanguageBadge code="zh" size="md" />
                    <LanguageBadge code="ja" size="md" />
                    <LanguageBadge code="hi" size="md" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Large Badges</h4>
                  <div className="flex gap-2 flex-wrap">
                    <LanguageBadge code="pt" size="lg" />
                    <LanguageBadge code="ru" size="lg" />
                    <LanguageBadge code="ar" size="lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">{t('languageStatistics')}</CardTitle>
                <CardDescription>Overview of localization configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl shadow-xs">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('totalLanguages')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary mt-1">{SUPPORTED_LANGUAGES.length}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-xs">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('currentLanguage')}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedLanguage.toUpperCase()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
