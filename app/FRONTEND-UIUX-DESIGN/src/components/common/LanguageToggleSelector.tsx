import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageOption {
  code: 'ta' | 'hi' | 'te' | 'en';
  label: string;
  nativeLabel: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
];

interface LanguageToggleSelectorProps {
  className?: string;
  variant?: 'pills' | 'text-divider';
}

export const LanguageToggleSelector: React.FC<LanguageToggleSelectorProps> = ({
  className = '',
  variant = 'pills',
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  if (variant === 'text-divider') {
    return (
      <div className={`flex items-center justify-center space-x-2 text-sm text-slate-600 ${className}`}>
        {LANGUAGES.map((lang, index) => {
          const isSelected = currentLanguage.startsWith(lang.code);
          return (
            <React.Fragment key={lang.code}>
              <button
                type="button"
                id={`lang-btn-${lang.code}`}
                onClick={() => handleLanguageChange(lang.code)}
                className={`transition-all duration-150 py-1 px-2 rounded font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                  isSelected
                    ? 'text-teal-700 font-bold underline decoration-2 underline-offset-4'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang.nativeLabel}
              </button>
              {index < LANGUAGES.length - 1 && <span className="text-slate-300 select-none">|</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-slate-100/90 p-1 rounded-full border border-slate-200 shadow-sm ${className}`}
      role="radiogroup"
      aria-label="Language selection"
    >
      {LANGUAGES.map((lang, index) => {
        const isSelected = currentLanguage.startsWith(lang.code);
        return (
          <React.Fragment key={lang.code}>
            <button
              type="button"
              id={`lang-btn-${lang.code}`}
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleLanguageChange(lang.code)}
              className={`text-xs md:text-sm font-medium py-1.5 px-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
                isSelected
                  ? 'bg-white text-teal-800 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {lang.nativeLabel}
            </button>
            {index < LANGUAGES.length - 1 && (
              <span className="text-slate-300 text-xs px-0.5 select-none font-light">|</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
export default LanguageToggleSelector;
