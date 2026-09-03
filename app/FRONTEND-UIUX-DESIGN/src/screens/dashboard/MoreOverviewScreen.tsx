import React, { useState } from 'react';
import {
  Settings,
  HelpCircle,
  Shield,
  Volume2,
  Info,
  ChevronRight,
  LogOut,
  Bell,
  FileText,
  Users,
  X,
  CheckCircle2
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
  const [activeModal, setActiveModal] = useState<'records' | 'family' | 'guide' | 'about' | null>(null);

  const handleLogout = async () => {
    if (logoutUser) {
      await logoutUser();
      if (onLoggedOut) onLoggedOut();
    }
  };

  return (
    <div className="w-full bg-[#F5F6FA] min-h-full py-4 px-4 pb-4">
      <div className="max-w-lg mx-auto space-y-3.5">

        {/* ── User Card ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-slate-100 shadow-xs">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-500/20 shadow-sm shrink-0">
            <img src="/female-avatar.jpg" alt="User profile" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">@{currentUser?.username || 'sriharini'}</p>
            <p className="text-[11px] text-teal-700 font-semibold mt-0.5 truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              <span>{currentUser?.village_district || 'Kanchipuram District'}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label={t('more.settingsAndProfile')}
            onClick={onNavigateToSettings}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* ── Healthcare Records & Family Group ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <p className="px-4 pt-3.5 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('more.healthServices')}</p>
          <MenuRow
            icon={<FileText className="w-4.5 h-4.5 text-teal-600" />}
            iconBg="bg-teal-50"
            label={t('more.healthRecords')}
            sublabel={t('more.healthRecordsSub')}
            onClick={() => setActiveModal('records')}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Users className="w-4.5 h-4.5 text-indigo-600" />}
            iconBg="bg-indigo-50"
            label={t('more.familyConnect')}
            sublabel={t('more.familyConnectSub')}
            onClick={() => setActiveModal('family')}
          />
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
            onClick={onNavigateToSettings}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Bell className="w-4.5 h-4.5 text-amber-600" />}
            iconBg="bg-amber-50"
            label={t('more.notifications')}
            sublabel={t('more.notificationsSub')}
            onClick={onNavigateToSettings}
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
            onClick={() => setActiveModal('guide')}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Shield className="w-4.5 h-4.5 text-purple-600" />}
            iconBg="bg-purple-50"
            label={t('more.privacyData')}
            sublabel={t('more.privacyDataSub')}
            onClick={() => alert(t('more.modals.privacyAlert', 'ArogyaVani AI is 100% HIPAA & ABDM (Ayushman Bharat Digital Mission) compliant.'))}
          />
          <div className="h-px bg-slate-100 mx-4" />
          <MenuRow
            icon={<Info className="w-4.5 h-4.5 text-slate-500" />}
            iconBg="bg-slate-100"
            label={t('more.about')}
            sublabel={t('more.aboutSub')}
            onClick={() => setActiveModal('about')}
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

      </div>

      {/* ── INTERACTIVE MODALS ───────────────────────────────────────────── */}

      {/* 1. Health Records Modal */}
      {activeModal === 'records' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{t('more.modals.recordsTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('more.modals.recordsSubtitle')}</p>
                </div>
              </div>
              <button type="button" aria-label={t('common.close')} onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-[#16324F] to-[#0D9488] rounded-2xl p-4 text-white space-y-1 shadow-sm">
              <p className="text-[10px] uppercase font-bold text-teal-200">{t('more.modals.abhaIdTitle')}</p>
              <p className="font-mono text-base font-black tracking-wider">91-8834-0912-7723</p>
              <p className="text-xs text-slate-200">{currentUser?.username || 'Sriharini Devi'} • {currentUser?.village_district || 'Kanchipuram'}</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{t('more.modals.childRecordTitle')}</p>
                  <p className="text-[11px] text-slate-500">{t('more.modals.childRecordSub')}</p>
                </div>
                <span className="text-teal-700 font-bold text-[11px] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">{t('common.verified')}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{t('more.modals.pmjayCardTitle')}</p>
                  <p className="text-[11px] text-slate-500">{t('more.modals.pmjayCardSub')}</p>
                </div>
                <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{t('common.active')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Family & ASHA Connect Modal */}
      {activeModal === 'family' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{t('more.modals.familyTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('more.modals.familySubtitle')}</p>
                </div>
              </div>
              <button type="button" aria-label={t('common.close')} onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{t('more.modals.ashaWorkerTitle')}</p>
                  <p className="text-[11px] text-slate-500">{t('more.modals.ashaWorkerSub')}</p>
                </div>
                <button type="button" onClick={() => alert(t('more.modals.callingAsha', 'Calling ASHA worker: +91 98401 XXXXX'))} className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-bold cursor-pointer">{t('common.call')}</button>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{t('more.modals.husbandTitle')}</p>
                  <p className="text-[11px] text-slate-500">{t('more.modals.husbandSub')}</p>
                </div>
                <span className="text-slate-500 font-medium">{t('common.linked')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Healthcare Worker Guide Modal */}
      {activeModal === 'guide' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{t('more.modals.guideTitle')}</h3>
                  <p className="text-xs text-slate-500">{t('more.modals.guideSubtitle')}</p>
                </div>
              </div>
              <button type="button" aria-label={t('common.close')} onClick={() => setActiveModal(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800">{t('more.modals.howToUseTitle')}</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>{t('more.modals.step1')}</li>
                <li>{t('more.modals.step2')}</li>
                <li>{t('more.modals.step3')}</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 4. About Modal */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D9488] to-[#6366F1] flex items-center justify-center text-white mx-auto shadow-md">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="font-black text-lg text-slate-900">{t('more.modals.aboutTitle')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('more.modals.aboutDesc')}
            </p>
            <button type="button" onClick={() => setActiveModal(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-2xl cursor-pointer">
              {t('common.close')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MoreOverviewScreen;
