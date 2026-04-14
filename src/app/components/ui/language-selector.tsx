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
                  ? 'border-blue-500 bg-blue-50 font-bold'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{language.flag}</div>
              <div className="text-xs font-semibold">{language.nativeName}</div>
              <div className="text-xs text-gray-600">{language.name}</div>
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
    <span className={`bg-blue-100 text-blue-800 rounded-full font-semibold inline-flex items-center gap-1 ${sizeClasses[size]}`}>
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
          ? 'border-blue-500 bg-blue-50 bg-white'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="text-4xl mb-2">{language.flag}</div>
      <h3 className="font-bold text-lg">{language.nativeName}</h3>
      <p className="text-sm text-gray-600">{language.name}</p>
      {isSelected && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded inline-block mt-2">Active</span>}
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
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{language.flag}</span>
          <div>
            <h3 className="font-bold text-lg">{language.nativeName}</h3>
            <p className="text-sm text-gray-600">{language.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
