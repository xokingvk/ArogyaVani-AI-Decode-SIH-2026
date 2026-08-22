import React from 'react';
import {
  Settings,
  HelpCircle,
  Shield,
  Volume2,
  Info,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface MoreOverviewScreenProps {
  onNavigateToSettings?: () => void;
  onLoggedOut?: () => void;
}

interface MenuRowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  danger?: boolean;
}

const MenuRow: React.FC<MenuRowProps> = ({ icon, iconBg, label, sublabel, onClick, danger }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none ${danger ? 'hover:bg-red-50' : ''}`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold leading-snug ${danger ? 'text-[#B33A3A]' : 'text-slate-800'}`}>{label}</p>
      {sublabel && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{sublabel}</p>}
    </div>
    <ChevronRight className={`w-4 h-4 shrink-0 ${danger ? 'text-[#B33A3A]/50' : 'text-slate-300'}`} />
  </button>
);

export const MoreOverviewScreen: React.FC<MoreOverviewScreenProps> = ({
  onNavigateToSettings,
  onLoggedOut,
}) => {
  const { currentUser, logoutUser } = useAuth();
  const { t } = useTranslation();

  const handleLogout = async () => {
    if (logoutUser) {
      await logoutUser();
      if (onLoggedOut) onLoggedOut();
    }
  };

  return (
    <div className="w-full bg-[#F5F6FA] min-h-full py-4 px-4">
      <div className="max-w-lg mx-auto space-y-3.5 pb-4">

        {/* ── User Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#10B981] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">@{currentUser?.username || 'user'}</p>
            {currentUser?.village_district && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{currentUser.village_district}</p>
            )}
          </div>
        </div>

        {/* ── App Settings Group ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <p className="px-4 pt-3.5 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('more.appSettings')}</p>
          <MenuRow
            icon={<Settings className="w-4.5 h-4.5 text-slate-600" />}
            iconBg="bg-slate-100"
            label={t('more.settingsAndProfile')}
            sublabel={t('more.settingsSub')}
            onClick={onNavigateToSettings}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Volume2 className="w-4.5 h-4.5 text-blue-600" />}
            iconBg="bg-blue-50"
            label={t('more.audioFeedback')}
            sublabel={t('more.audioSub')}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Bell className="w-4.5 h-4.5 text-amber-600" />}
            iconBg="bg-amber-50"
            label={t('more.notifications')}
            sublabel={t('more.notificationsSub')}
          />
        </div>

        {/* ── Support Group ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <p className="px-4 pt-3.5 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('more.supportHeader')}</p>
          <MenuRow
            icon={<HelpCircle className="w-4.5 h-4.5 text-teal-600" />}
            iconBg="bg-teal-50"
            label={t('more.guide')}
            sublabel={t('more.guideSub')}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Shield className="w-4.5 h-4.5 text-purple-600" />}
            iconBg="bg-purple-50"
            label={t('more.privacyData')}
            sublabel={t('more.privacyDataSub')}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Info className="w-4.5 h-4.5 text-slate-500" />}
            iconBg="bg-slate-100"
            label={t('more.about')}
            sublabel={t('more.aboutSub')}
          />
        </div>

        {/* ── Logout ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <MenuRow
            icon={<LogOut className="w-4.5 h-4.5 text-[#B33A3A]" />}
            iconBg="bg-red-50"
            label={t('more.logOut')}
            onClick={handleLogout}
            danger
          />
        </div>

        {/* Bottom clearance spacer */}
        <div className="h-2" />
      </div>
    </div>
  );
};

export default MoreOverviewScreen;
