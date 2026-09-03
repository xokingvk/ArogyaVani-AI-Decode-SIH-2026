import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Hospital,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Phone,
  MapPin,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useVoiceRecorder } from '../../features/voice/hooks/useVoiceRecorder';
import { VoiceAssistantCard } from '../../features/voice/components/VoiceAssistantCard';
import { QuickAction } from '../../features/voice/types/voiceTypes';
import { EmergencyContactsModal } from '../../components/emergency/EmergencyContactsModal';

interface HomeScreenProps {
  onNavigateToSchemes?: () => void;
}

type ActiveModal = 'symptoms' | 'hospital' | 'contacts' | null;

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSchemes }) => {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const isTamil  = i18n.language?.startsWith('ta');
  const isTelugu = i18n.language?.startsWith('te');
  const isIndic  = isTamil || isTelugu;

  const displayName =
    currentUser?.username
      ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)
      : 'there';

  // ── Voice recorder state & shared AI query dispatcher ───────────────────
  const {
    voiceState,
    transcription,
    aiAnswer,
    isSpeakingTts,
    errorMessage,
    startRecording,
    stopRecording,
    clearError,
    replayAudio,
    submitTextQuery,
  } = useVoiceRecorder();

  // ── Local UI state ────────────────────────────────────────────────────────
  const [textInput, setTextInput]       = useState('');
  const [activeModal, setActiveModal]   = useState<ActiveModal>(null);

  // ── Voice interaction handlers ────────────────────────────────────────────
  const handleSpeak = useCallback(() => {
    if (voiceState === 'idle' || voiceState === 'response') {
      startRecording();
    } else if (voiceState === 'listening') {
      stopRecording();
    }
  }, [voiceState, startRecording, stopRecording]);

  // ── Direct Text query handler ─────────────────────────────────────────────
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = textInput.trim();
    if (!query) return;
    setTextInput('');
    clearError();
    submitTextQuery(query, i18n.language);
  }, [textInput, clearError, submitTextQuery, i18n.language]);

  // ── Check Symptoms selection handler ──────────────────────────────────────
  const handleSymptomSelect = useCallback((symptomKey: string) => {
    setActiveModal(null);
    clearError();

    const queryMap: Record<string, string> = {
      feverChills: 'I have fever and chills. What general health guidance should I follow?',
      persistentCough: 'I have a persistent cough. What general health guidance should I follow?',
      jointPain: 'I have joint or muscle pain. What general health guidance should I follow?',
      stomachAche: 'I have stomachache or diarrhea. What general health guidance should I follow?',
    };

    const query = queryMap[symptomKey] || 'I have a health symptom. What general health guidance should I follow?';
    submitTextQuery(query, i18n.language);
  }, [clearError, submitTextQuery, i18n.language]);

  // ── Quick action definitions ──────────────────────────────────────────────
  const quickActions: QuickAction[] = [
    {
      id: 'symptoms',
      label: t('home.symptomsTitle'),
      subLabel: t('home.symptomsDesc'),
      Icon: Stethoscope,
      gradientFrom: '#EEF2FF',
      gradientTo: '#E0E7FF',
      border: '#C7D2FE',
      iconColor: '#6366F1',
      onClick: () => setActiveModal('symptoms'),
    },
    {
      id: 'hospital',
      label: t('home.hospitalTitle'),
      subLabel: t('home.hospitalDesc'),
      Icon: Hospital,
      gradientFrom: '#ECFDF5',
      gradientTo: '#D1FAE5',
      border: '#6EE7B7',
      iconColor: '#059669',
      onClick: () => setActiveModal('hospital'),
    },
    {
      id: 'schemes',
      label: t('home.schemesTitle'),
      subLabel: t('home.schemesDesc'),
      Icon: Landmark,
      gradientFrom: '#EFF6FF',
      gradientTo: '#DBEAFE',
      border: '#93C5FD',
      iconColor: '#2563EB',
      onClick: () => { if (onNavigateToSchemes) onNavigateToSchemes(); },
    },
    {
      id: 'sos',
      label: t('emergency.contactsTitle', 'Emergency Contacts'),
      subLabel: t('emergency.contactsDesc', 'Configure trusted emergency contacts'),
      Icon: ShieldAlert,
      gradientFrom: '#FFF1F2',
      gradientTo: '#FFE4E6',
      border: '#FECDD3',
      iconColor: '#E11D48',
      onClick: () => setActiveModal('contacts'),
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-full bg-slate-50 pb-8">

      {/* ── GREETING ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`font-black text-[#16324F] leading-snug tracking-tight ${isIndic ? 'text-[20px] sm:text-[22px]' : 'text-[22px]'}`}
        >
          {t('home.greeting', { name: displayName })}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className={`text-slate-500 mt-1 font-medium leading-snug ${isIndic ? 'text-[13px] sm:text-sm' : 'text-sm'}`}
        >
          {t('home.howCanIHelp')}
        </motion.p>
      </div>

      {/* ── VOICE & TEXT ASSISTANT CARD ────────────────────────────── */}
      <VoiceAssistantCard
        voiceState={voiceState}
        transcription={transcription}
        aiAnswer={aiAnswer}
        isSpeakingTts={isSpeakingTts}
        errorMessage={errorMessage}
        textInput={textInput}
        onSpeak={handleSpeak}
        onClearError={clearError}
        onReplayAudio={replayAudio}
        onTextInputChange={setTextInput}
        onTextSubmit={handleTextSubmit}
      />

      {/* ── QUICK ACTIONS GRID ─────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {t('home.quickActions')}
        </p>
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3 items-stretch">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              id={`home-quick-${action.id}`}
              type="button"
              aria-label={action.label}
              onClick={action.onClick}
              className="text-left rounded-2xl p-3.5 sm:p-4 border cursor-pointer focus:outline-none active:scale-95 transition-transform flex flex-col justify-between h-full min-h-[120px] sm:min-h-[132px] max-w-full overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${action.gradientFrom}, ${action.gradientTo})`,
                borderColor: action.border,
                boxShadow: `0 2px 10px ${action.border}55`,
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.18 + i * 0.07, ease: 'easeOut' }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="flex items-start justify-between mb-2 w-full">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${action.iconColor}18` }}
                >
                  <span style={{ color: action.iconColor }}>
                    <action.Icon className="w-5 h-5" strokeWidth={1.8} />
                  </span>
                </div>
                <span style={{ color: action.iconColor, opacity: 0.6 }} className="shrink-0 p-1">
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-end w-full mt-1">
                <p
                  className={`font-bold leading-snug break-words ${isIndic ? 'text-[12px] sm:text-[12.5px] line-clamp-3' : 'text-[13px] line-clamp-2'}`}
                  style={{ color: '#16324F' }}
                >
                  {action.label}
                </p>
                <p className={`text-slate-400 font-medium mt-0.5 leading-snug break-words ${isIndic ? 'text-[10px] sm:text-[10.5px] line-clamp-3' : 'text-[10.5px] line-clamp-2'}`}>
                  {action.subLabel}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── QUICK ACTION MODALS ────────────────────────────────────── */}

      {/* 1. Check Symptoms Modal (Functional AI Query Dispatch) */}
      {activeModal === 'symptoms' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl rounded-b-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label={t('common.close')}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{t('home.modals.symptomsTitle')}</h3>
                <p className="text-xs text-slate-500">{t('home.modals.symptomsSubtitle')}</p>
              </div>
            </div>
            <div className="space-y-3 mb-5 text-xs">
              <label className="block text-slate-700 font-bold">{t('home.modals.selectPrimarySymptom')}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'feverChills', label: t('home.modals.feverChills') },
                  { key: 'persistentCough', label: t('home.modals.persistentCough') },
                  { key: 'jointPain', label: t('home.modals.jointPain') },
                  { key: 'stomachAche', label: t('home.modals.stomachAche') },
                ].map((symptom) => (
                  <button
                    key={symptom.key}
                    type="button"
                    onClick={() => handleSymptomSelect(symptom.key)}
                    className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 active:scale-95 text-indigo-950 text-left font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    {symptom.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Find Hospital */}
      {activeModal === 'hospital' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              aria-label={t('common.close')}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Hospital className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{t('home.modals.hospitalTitle')}</h3>
                <p className="text-xs text-slate-500">{t('home.modals.hospitalSubtitle')}</p>
              </div>
            </div>
            <div className="space-y-2.5 mb-4 text-xs">
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{t('home.modals.mainPhcTitle')}</p>
                  <p className="text-slate-500 text-[11px]">{t('home.modals.mainPhcSub')}</p>
                  <p className="text-emerald-700 font-semibold text-[10px] mt-0.5">{t('home.modals.kmAway', { km: '1.2' })}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('common.call')}
                  onClick={() => { window.location.href = 'tel:104'; }}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{t('home.modals.distHospitalTitle')}</p>
                  <p className="text-slate-500 text-[11px]">{t('home.modals.distHospitalSub')}</p>
                  <p className="text-emerald-700 font-semibold text-[10px] mt-0.5">{t('home.modals.kmAway', { km: '4.8' })}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('common.search')}
                  onClick={() => { window.location.href = 'tel:108'; }}
                  className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Emergency Contacts Management Modal */}
      <EmergencyContactsModal
        isOpen={activeModal === 'contacts'}
        onClose={() => setActiveModal(null)}
      />

    </div>
  );
};

export default HomeScreen;
