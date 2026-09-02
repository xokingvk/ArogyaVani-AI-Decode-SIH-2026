import React from 'react';
import { Bell, HeartPulse, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopHeaderBarProps {
  onNotificationsClick?: () => void;
  onAvatarClick?: () => void;
  // onMenuClick kept for API compatibility but no longer rendered
  onMenuClick?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  onNotificationsClick,
  onAvatarClick,
}) => {
  const { t } = useTranslation();

  return (
    <header className="relative z-30 bg-white border-b border-slate-100 shadow-xs px-3 sm:px-4 py-2.5 shrink-0 w-full">
      <div className="flex items-center justify-between max-w-lg mx-auto gap-2">

        {/* LEFT: ArogyaVani AI Branding */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* AI + Health icon cluster */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#6366F1] flex items-center justify-center shadow-sm">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
            </div>
            {/* Tiny AI sparkle overlay badge */}
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#6366F1]" strokeWidth={2.5} />
            </span>
          </div>

          {/* Brand name */}
          <div className="flex flex-col leading-none min-w-0">
            <span className="text-[15px] sm:text-[17px] font-black tracking-tight text-[#16324F] whitespace-nowrap overflow-hidden text-ellipsis">
              ArogyaVani <span className="text-[#0D9488]">AI</span>
            </span>
            <span className="text-[9.5px] sm:text-[10px] font-medium text-slate-400 tracking-wide mt-0.5 hidden min-[300px]:block">
              {t('app.tagline')}
            </span>
          </div>
        </div>

        {/* RIGHT: Notification Bell + Female Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Notification bell */}
          <button
            type="button"
            id="header-notifications-btn"
            onClick={onNotificationsClick}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
          </button>

          {/* Female profile avatar */}
          <button
            type="button"
            id="header-avatar-btn"
            onClick={onAvatarClick}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-[#0D9488]/20 ring-offset-1 flex-shrink-0"
            aria-label="Profile"
          >
            <img
              src="/female-avatar.jpg"
              alt="User profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback: show teal initial circle if image fails
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add(
                    'bg-gradient-to-br', 'from-[#0D9488]', 'to-[#10B981]',
                    'text-white', 'font-bold', 'text-sm', 'flex', 'items-center', 'justify-center'
                  );
                  parent.textContent = 'S';
                }
              }}
            />
          </button>
        </div>

      </div>
    </header>
  );
};

export default TopHeaderBar;
