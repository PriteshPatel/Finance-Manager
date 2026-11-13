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
        <Button variant="outline" className="w-100 justify-content-start">
          <span className="text-lg me-2">{currentLanguage.flag}</span>
          <span className="fw-semibold">{currentLanguage.nativeName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="app-max-w-md">
        <DialogHeader>
          <DialogTitle>{t('selectLanguage')}</DialogTitle>
          <DialogDescription>
            {t('yourActiveLanguage')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 app-max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => handleSelect(language.code as LanguageCode)}
              className={`p-3 rounded-3 border-2 app-transition app-hover-shadow-md ${
                selectedLanguage === language.code
                  ? 'border-primary bg-muted-primary fg-primary fw-bold shadow-xs'
                  : 'border-keyline app-hover-border-primary app-bg-card fg-body'
              }`}
            >
              <div className="text-2xl mb-1">{language.flag}</div>
              <div className="text-xs fw-semibold">{language.nativeName}</div>
              <div className="text-xs fg-2">{language.name}</div>
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
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-md',
  };

  return (
    <span className={`bg-muted-primary fg-primary border border-subtle-primary rounded-pill fw-semibold d-inline-flex align-items-center gap-1 ${sizeClasses[size]}`}>
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
      className={`p-4 rounded-3 border-2 app-cursor-pointer app-transition app-hover-shadow-lg ${
        isSelected
          ? 'border-primary app-focus-ring app-focus-ring app-bg-card fg-body shadow-xs'
          : 'border-keyline app-hover-border-primary app-bg-card fg-body'
      }`}
    >
      <div className="text-4xl mb-2">{language.flag}</div>
      <h3 className="fw-bold text-lg">{language.nativeName}</h3>
      <p className="text-sm fg-2">{language.name}</p>
      {isSelected && <span className="text-xs bg-primary fg-contrast-primary fw-semibold px-2 py-1 rounded-pill d-inline-block mt-2">Active</span>}
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
    <div className="app-bg-card p-4 rounded-4 border border-keyline shadow-xs">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <span className="text-4xl">{language.flag}</span>
          <div>
            <h3 className="fw-bold text-lg">{language.nativeName}</h3>
            <p className="text-sm fg-2">{language.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
