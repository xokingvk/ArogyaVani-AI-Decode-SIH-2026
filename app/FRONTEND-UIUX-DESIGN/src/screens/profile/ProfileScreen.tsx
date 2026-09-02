import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Globe,
  Volume2,
  HelpCircle,
  Shield,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggleSelector } from '../../components/common/LanguageToggleSelector';

interface ProfileScreenProps {
  onNavigateBack: () => void;
  onLoggedOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateBack,
  onLoggedOut,
}) => {
  const { t } = useTranslation();
  const { currentUser, logoutUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      onLoggedOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col select-none pb-24">
      {/* Contextual Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 shadow-xs">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateBack}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span>Back</span>
          </button>
          <h1 className="text-sm font-extrabold text-[#16324F] tracking-tight">User Profile & Account</h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">

        {/* 1. Female AI Profile Card */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#0D9488]/20 shadow-md mb-3">
            <img
              src="/female-avatar.jpg"
              alt="Sriharini Devi profile avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-1.5 justify-center mb-0.5">
            <h2 className="text-lg font-black text-slate-900">
              {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1) : 'Sriharini Devi'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200">
              <CheckCircle2 className="w-3 h-3 text-teal-600" />
              Verified
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">@{currentUser?.username || 'sriharini'}</p>

          <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="font-semibold">{currentUser?.village_district || 'Kanchipuram District, Tamil Nadu'}</span>
          </div>
        </section>

        {/* 2. ABHA Digital Health Card */}
        <section className="bg-gradient-to-br from-[#112940] via-[#164B72] to-[#087F7A] rounded-3xl p-5 text-white shadow-md space-y-2 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-teal-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">ABHA Health Card</span>
            </div>
            <span className="text-[10px] font-semibold bg-teal-400/20 text-teal-200 px-2 py-0.5 rounded-full border border-teal-300/30">ABDM Linked</span>
          </div>

          <div className="py-1">
            <p className="text-[10px] text-teal-200/80 uppercase font-semibold">Ayushman Bharat Health Account ID</p>
            <p className="font-mono text-lg font-black tracking-widest text-white mt-0.5">91-8834-0912-7723</p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-200 pt-1">
            <span>Linked PHC: Kanchipuram Main</span>
            <span>Blood Group: O+</span>
          </div>
        </section>

        {/* 3. Language & Speech Selector */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Language & Speech</h3>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs font-semibold text-slate-800">Select Application Language:</p>
            <LanguageToggleSelector variant="pills" />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Voice Assistance Audio</p>
                <p className="text-[11px] text-slate-400">Read medical responses aloud</p>
              </div>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-slate-300 cursor-pointer"
            />
          </div>
        </section>

        {/* 4. Emergency Health Contacts */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked ASHA Worker</h3>
          </div>

          <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <p className="font-extrabold text-indigo-950">Smt. Lakshmi Devi</p>
              <p className="text-[11px] text-indigo-700">Kanchipuram Health Buddy • PHC 04</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Calling ASHA worker Smt. Lakshmi Devi: +91 98401 XXXXX')}
              className="p-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 5. Support & Logout */}
        <section className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2">
          <button
            type="button"
            onClick={() => alert('Data is encrypted locally and HIPAA/ABDM compliant.')}
            className="w-full flex items-center justify-between py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl px-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Privacy & Patient Data Protection</span>
            </div>
            <span className="text-slate-400">HIPAA Compliant</span>
          </button>

          <button
            type="button"
            onClick={() => alert('Healthcare Worker & Family User Guide v1.0')}
            className="w-full flex items-center justify-between py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl px-2 transition-colors border-t border-slate-100"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Healthcare Worker Guide</span>
            </div>
            <span className="text-slate-400">View</span>
          </button>

          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-[#B33A3A] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('more.logOut')}</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
};

export default ProfileScreen;
