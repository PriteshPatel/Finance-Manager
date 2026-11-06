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
          className="inline-block w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
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
        className="h-9 w-9 relative"
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
          <Button variant="outline" size="sm" className="h-9 gap-2">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableThemes.map((t) => {
        const isSelected = t.id === theme;
        return (
          <div
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
              isSelected
                ? 'ring-2 ring-primary border-primary bg-accent/30 shadow-sm'
                : 'border-border bg-card hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-card-foreground">{t.name}</h4>
                  {isSelected && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
              </div>
            </div>

            {/* Color Palette Preview Strip */}
            <div className="flex items-center gap-1.5 my-3 p-2 rounded-lg bg-background/80 border border-border/60">
              {t.palettePreview.map((hex, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full h-6 rounded-md shadow-xs border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">
                    {hex.replace('#', '')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <span className="text-muted-foreground">
                Selector: <code className="font-mono text-[11px] text-primary">data-bs-theme="{t.bsTheme}"</code>
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
    <Card className="border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Live Preview: {themeConfig.name}
            </CardTitle>
            <CardDescription>
              Interactive sample components styled with Bootstrap v6 alpha tokens
            </CardDescription>
          </div>
          <Badge className="bg-primary text-primary-foreground font-mono">
            data-bs-theme="{themeConfig.bsTheme}"
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metric Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Current Balance</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-card-foreground">$12,450.00</div>
            <span className="text-xs text-primary font-medium">+8.4% from last month</span>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Monthly Growth</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-card-foreground">+$2,840.50</div>
            <span className="text-xs text-muted-foreground">Calculated in real-time</span>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs">
              <span>Security Status</span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xl font-bold text-card-foreground">Verified</div>
            <span className="text-xs text-muted-foreground">Bootstrap 6 tokens active</span>
          </div>
        </div>

        {/* Buttons & UI Controls Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Buttons & Elements
          </h4>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Badge variant="default">Active Token</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Bordered</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
