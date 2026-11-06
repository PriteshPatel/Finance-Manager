import React from 'react';
import { SUPPORTED_LANGUAGES, LanguageCode, getLanguageDetails } from '../../../lib/language-config';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';

interface LanguageSelectorProps {
  onSelect?: (languageCode: LanguageCode) => void;
  showLabel?: boolean;
}

export function LanguageSelector({ onSelect, showLabel = true }: LanguageSelectorProps) {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const t = useTranslation();
  const currentLanguage = getLanguageDetails(selectedLanguage);

  const handleSelect = (code: LanguageCode) => {
    setSelectedLanguage(code);
    onSelect?.(code);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <span className="text-lg mr-2">{currentLanguage.flag}</span>
          <span className="font-semibold">{currentLanguage.nativeName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('selectLanguage')}</DialogTitle>
          <DialogDescription>
            {t('yourActiveLanguage')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleSelect(language.code as LanguageCode)}
              className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedLanguage === language.code
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border hover:border-primary/40 bg-card text-card-foreground'
              }`}
            >
              <div className="text-2xl mb-1">{language.flag}</div>
              <div className="text-xs font-semibold">{language.nativeName}</div>
              <div className="text-xs text-muted-foreground">{language.name}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Language Badge Component
 */
interface LanguageBadgeProps {
  code?: LanguageCode;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageBadge({ code = 'en', size = 'md' }: LanguageBadgeProps) {
  const language = getLanguageDetails(code);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold inline-flex items-center gap-1 ${sizeClasses[size]}`}>
      <span>{language.flag}</span>
      <span>{language.nativeName}</span>
    </span>
  );
}

/**
 * Language Card Component
 */
interface LanguageCardProps {
  code?: LanguageCode;
  onClick?: () => void;
  isSelected?: boolean;
}

export function LanguageCard({ code = 'en', onClick, isSelected = false }: LanguageCardProps) {
  const language = getLanguageDetails(code);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 bg-card text-card-foreground shadow-xs'
          : 'border-border hover:border-primary/40 bg-card text-card-foreground'
      }`}
    >
      <div className="text-4xl mb-2">{language.flag}</div>
      <h3 className="font-bold text-lg">{language.nativeName}</h3>
      <p className="text-sm text-muted-foreground">{language.name}</p>
      {isSelected && <span className="text-xs bg-primary text-primary-foreground font-semibold px-2 py-0.5 rounded-full inline-block mt-2">Active</span>}
    </div>
  );
}

/**
 * Language Info Display Component
 */
export function LanguageInfo() {
  const { selectedLanguage } = useLanguage();
  const t = useTranslation();
  const language = getLanguageDetails(selectedLanguage);

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{language.flag}</span>
          <div>
            <h3 className="font-bold text-lg">{language.nativeName}</h3>
            <p className="text-sm text-muted-foreground">{language.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
