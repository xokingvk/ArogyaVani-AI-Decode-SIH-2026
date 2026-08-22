import React from 'react';
import { HeartHandshake, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center p-4 select-none animate-fadeIn"
      role="status"
      aria-live="polite"
    >
      <div className="relative mb-6">
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#10B981] text-white flex items-center justify-center shadow-xl shadow-teal-700/25 ring-4 ring-white animate-pulse">
          <HeartHandshake className="w-9 h-9" strokeWidth={2.2} />
        </div>
      </div>

      <div className="flex items-center space-x-2.5 text-[#16324F] font-bold text-lg mb-1">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
        <span>{t('app.title')}</span>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 font-medium">
        {message || 'Verifying secure health session...'}
      </p>
    </div>
  );
};

export default FullScreenLoader;
