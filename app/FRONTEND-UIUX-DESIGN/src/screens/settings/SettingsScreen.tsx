import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Globe,
  Volume2,
  HelpCircle,
  Shield,
  LogOut,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggleSelector } from '../../components/common/LanguageToggleSelector';

interface SettingsScreenProps {
  onNavigateBack: () => void;
  onLoggedOut: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigateBack,
  onLoggedOut,
}) => {
  const { t } = useTranslation();
  const { currentUser, logoutUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      onLoggedOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const formattedDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : t('common.active');

  return (
    <div className="flex-1 min-h-0 overflow-y-auto w-full bg-slate-50 flex flex-col select-none pb-8">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 sm:px-6 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateBack}
            aria-label={t('settings.backToDashboard')}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('settings.backToDashboard')}</span>
          </button>
          <h1 className="text-base font-bold text-[#16324F]">{t('settings.settingsTitle')}</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Settings Content Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* 1. User Profile Overview Card */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#16324F] to-[#243B53] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {currentUser?.username || t('settings.healthcareWorker')}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  {t('common.verified')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">@{currentUser?.username}</p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                {currentUser?.village_district && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{currentUser.village_district}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('settings.joined', { date: formattedDate })}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Preferences & Language Section */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t('settings.voiceLangPreferences')}
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t('settings.preferredVoiceLanguage')}</p>
                <p className="text-xs text-slate-500">{t('settings.preferredLangDesc')}</p>
              </div>
            </div>
            <LanguageToggleSelector variant="pills" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t('more.audioFeedback')}</p>
                <p className="text-xs text-slate-500">{t('more.audioSub')}</p>
              </div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              aria-label={t('more.audioFeedback')}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
          </div>
        </section>

        {/* 3. Support & Security Section */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t('settings.securitySystem')}
          </h3>

          <button
            type="button"
            className="w-full flex items-center justify-between py-2 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t('more.guide')}</p>
                <p className="text-xs text-slate-500">{t('more.guideSub')}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">{t('common.viewDetails')}</span>
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-between py-2 text-left hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors border-t border-slate-100 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t('more.privacyData')}</p>
                <p className="text-xs text-slate-500">{t('more.privacyDataSub')}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-400">{t('common.verified')}</span>
          </button>

          {/* LOG OUT BUTTON */}
          <div className="pt-4 border-t border-slate-100">
            <button
              id="settings-logout-btn"
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-3.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#B33A3A] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-60"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#B33A3A]" />
                  <span>{t('settings.loggingOut')}</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>{t('settings.logOut')}</span>
                </>
              )}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default SettingsScreen;
