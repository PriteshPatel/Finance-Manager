import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeConfig, ThemeId } from '../../../lib/theme-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Sun,
  Moon,
  Sparkles,
  Palette,
  Check,
  TrendingUp,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

/**
 * Visual Theme Swatch
 */
export function ThemeSwatch({ colors }: { colors: string[] }) {
  return (
    <div className="d-flex align-items-center gap-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="d-inline-block app-w-3-5 app-h-3-5 rounded-pill border app-border-black-10 shadow-xs flex-shrink-0"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

/**
 * Compact Header Theme Selector Dropdown
 */
export function HeaderThemeSelector() {
  const { theme, setTheme, themeConfig, availableThemes, isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="d-flex align-items-center gap-2">
      {/* Quick Light/Dark toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="app-h-9 app-w-9 position-relative rounded-3 border-keyline"
      >
        {isDarkMode ? (
          <Sun className="app-h-4 app-w-4 fg-warning app-transition app-rotate-0 app-scale-100" />
        ) : (
          <Moon className="app-h-4 app-w-4 fg-2 app-transition app-rotate-0 app-scale-100" />
        )}
      </Button>

      {/* Full Theme Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="app-h-9 gap-2 rounded-3 border-keyline">
            <Palette className="app-h-4 app-w-4 fg-primary" />
            <span className="d-none sm:d-inline-block fw-medium">{themeConfig.shortName}</span>
            <ThemeSwatch colors={themeConfig.palettePreview.slice(0, 3)} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="app-w-64">
          <DropdownMenuLabel className="d-flex align-items-center justify-content-between">
            <span>Bootstrap 6 Themes</span>
            <Badge variant="outline" className="app-text-10 font-monospace border-subtle-primary fg-primary">
              v6.0-alpha
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {availableThemes.map((t) => {
            const isSelected = t.id === theme;
            return (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`d-flex align-items-center justify-content-between py-2 app-cursor-pointer ${
                  isSelected ? 'bg-accent fw-semibold' : ''
                }`}
              >
                <div className="d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-sm">{t.name}</span>
                    {isSelected && <Check className="app-h-3-5 app-w-3-5 fg-primary" />}
                  </div>
                  <span className="app-text-11 fg-2">{t.category} Mode</span>
                </div>
                <ThemeSwatch colors={t.palettePreview.slice(0, 3)} />
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Grid of Interactive Theme Cards (For Settings Page)
 */
export function ThemePickerCards() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {availableThemes.map((t) => {
        const isSelected = t.id === theme;
        return (
          <div
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`app-cursor-pointer rounded-4 border p-5 app-transition  app-hover-shadow-md ${
              isSelected
                ? 'app-focus-ring app-focus-ring border-primary app-bg-primary-5 shadow-xs'
                : 'border-keyline app-bg-card app-hover-border-primary'
            }`}
          >
            <div className="d-flex align-items-start justify-content-between mb-3 gap-2">
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h4 className="fw-semibold fg-body text-md">{t.name}</h4>
                  {isSelected && (
                    <span className="d-inline-flex align-items-center justify-content-center app-w-5 app-h-5 rounded-pill bg-primary fg-contrast-primary text-xs flex-shrink-0">
                      <Check className="app-h-3 app-w-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs fg-2 mt-1 lh-lg">{t.description}</p>
              </div>
            </div>

            {/* Color Palette Preview Strip */}
            <div className="d-flex align-items-center gap-2 my-4 p-3 rounded-3 app-bg-muted-40 border border-keyline">
              {t.palettePreview.map((hex, idx) => (
                <div
                  key={idx}
                  className="flex-fill app-h-7 rounded-2 shadow-xs border app-border-black-10 app-transition app-hover-scale"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>

            <div className="d-flex align-items-center justify-content-between pt-3 border-top border-keyline text-xs">
              <span className="fg-2">
                <code className="font-monospace app-text-11 fg-primary">data-bs-theme="{t.bsTheme}"</code>
              </span>
              <Badge variant={t.isDark ? 'secondary' : 'outline'} className="app-text-10">
                {t.category}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Live Theme Component Showcase (For Settings Page)
 */
export function ThemeLiveShowcase() {
  const { themeConfig } = useTheme();

  return (
    <Card className="border-keyline shadow-xs">
      <CardHeader className="pb-4">
        <div className="d-flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3">
          <div>
            <CardTitle className="text-lg d-flex align-items-center gap-2">
              <Sparkles className="app-h-5 app-w-5 fg-primary" />
              Live Preview: {themeConfig.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Interactive sample components styled with Bootstrap v6 alpha tokens
            </CardDescription>
          </div>
          <Badge className="w-fit bg-primary fg-contrast-primary font-monospace text-xs">
            data-bs-theme="{themeConfig.bsTheme}"
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-4 app-bg-card border border-keyline shadow-xs">
            <div className="d-flex align-items-center justify-content-between fg-2 mb-1 text-xs">
              <span>Current Balance</span>
              <Wallet className="app-h-4 app-w-4 fg-primary" />
            </div>
            <div className="text-xl fw-bold fg-body">$12,450.00</div>
            <span className="text-xs fg-primary fw-medium">+8.4% from last month</span>
          </div>

          <div className="p-4 rounded-4 app-bg-card border border-keyline shadow-xs">
            <div className="d-flex align-items-center justify-content-between fg-2 mb-1 text-xs">
              <span>Monthly Growth</span>
              <TrendingUp className="app-h-4 app-w-4 fg-success" />
            </div>
            <div className="text-xl fw-bold fg-body">+$2,840.50</div>
            <span className="text-xs fg-2">Calculated in real-time</span>
          </div>

          <div className="p-4 rounded-4 app-bg-card border border-keyline shadow-xs">
            <div className="d-flex align-items-center justify-content-between fg-2 mb-1 text-xs">
              <span>Security Status</span>
              <ShieldCheck className="app-h-4 app-w-4 fg-primary" />
            </div>
            <div className="text-xl fw-bold fg-body">Verified</div>
            <span className="text-xs fg-2">Bootstrap 6 tokens active</span>
          </div>
        </div>

        {/* Buttons & UI Controls Preview */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs fw-semibold text-uppercase app-tracking-wider fg-2">
            Buttons & Elements
          </h4>
          <div className="d-flex flex-wrap gap-3 align-items-center">
            <Button variant="default" size="sm">Primary Action</Button>
            <Button variant="secondary" size="sm">Secondary Action</Button>
            <Button variant="outline" size="sm">Outline</Button>
            <Button variant="destructive" size="sm">Destructive</Button>
            <Badge variant="default">Active Token</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Bordered</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
