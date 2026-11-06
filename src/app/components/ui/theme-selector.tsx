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
    <div className="flex items-center gap-1">
      {colors.map((c, i) => (
        <span
          key={i}
          className="inline-block w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
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
    <div className="flex items-center gap-2">
      {/* Quick Light/Dark toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="h-9 w-9 relative rounded-lg border-border"
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 scale-100" />
        ) : (
          <Moon className="h-4 w-4 text-slate-700 transition-transform rotate-0 scale-100" />
        )}
      </Button>

      {/* Full Theme Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-border">
            <Palette className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline-block font-medium">{themeConfig.shortName}</span>
            <ThemeSwatch colors={themeConfig.palettePreview.slice(0, 3)} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Bootstrap 6 Themes</span>
            <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
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
                className={`flex items-center justify-between py-2 cursor-pointer ${
                  isSelected ? 'bg-accent font-semibold' : ''
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{t.name}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{t.category} Mode</span>
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
            className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-primary border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-card-foreground text-base">{t.name}</h4>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs shrink-0">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
              </div>
            </div>

            {/* Color Palette Preview Strip */}
            <div className="flex items-center gap-2 my-4 p-2.5 rounded-lg bg-muted/40 border border-border">
              {t.palettePreview.map((hex, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-7 rounded-md shadow-2xs border border-black/10 transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
              <span className="text-muted-foreground">
                <code className="font-mono text-[11px] text-primary">data-bs-theme="{t.bsTheme}"</code>
              </span>
              <Badge variant={t.isDark ? 'secondary' : 'outline'} className="text-[10px]">
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
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Live Preview: {themeConfig.name}
            </CardTitle>
            <CardDescription className="mt-1">
              Interactive sample components styled with Bootstrap v6 alpha tokens
            </CardDescription>
          </div>
          <Badge className="w-fit bg-primary text-primary-foreground font-mono text-xs">
            data-bs-theme="{themeConfig.bsTheme}"
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Current Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-card-foreground">$12,450.00</div>
            <span className="text-xs text-primary font-medium">+8.4% from last month</span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Monthly Growth</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-card-foreground">+$2,840.50</div>
            <span className="text-xs text-muted-foreground">Calculated in real-time</span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Security Status</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-card-foreground">Verified</div>
            <span className="text-xs text-muted-foreground">Bootstrap 6 tokens active</span>
          </div>
        </div>

        {/* Buttons & UI Controls Preview */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buttons & Elements
          </h4>
          <div className="flex flex-wrap gap-2.5 items-center">
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
