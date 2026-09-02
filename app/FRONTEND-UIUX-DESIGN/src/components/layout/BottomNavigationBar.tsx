import React from 'react';
import { Home, Landmark, History, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type BottomTab = 'home' | 'schemes' | 'history' | 'more';

interface BottomNavigationBarProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language?.startsWith('ta');

  const tabs: { id: BottomTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: t('nav.home'),
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'schemes',
      label: t('nav.schemes'),
      icon: <Landmark className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: t('nav.history'),
      icon: <History className="w-5 h-5" />,
    },
    {
      id: 'more',
      label: t('nav.more'),
      icon: <MoreHorizontal className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="relative z-30 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] shrink-0 w-full"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-2.5 gap-1 transition-colors cursor-pointer focus:outline-none relative ${
                isActive ? 'text-[#0D9488]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#0D9488]" />
              )}
              <span className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span
                className={`font-semibold text-center truncate max-w-full px-0.5 ${
                  isTamil
                    ? 'text-[9.5px] leading-tight tracking-tight'
                    : 'text-[10px] sm:text-[10.5px] tracking-wide'
                } ${isActive ? 'text-[#0D9488]' : 'text-slate-400'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;
