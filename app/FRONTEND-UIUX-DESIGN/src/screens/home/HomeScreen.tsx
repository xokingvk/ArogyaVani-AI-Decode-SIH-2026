import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Hospital,
  Landmark,
  ScanText,
  ChevronRight,
  Phone,
  MapPin,
  FileCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useVoiceRecorder } from '../../features/voice/hooks/useVoiceRecorder';
import { VoiceAssistantCard } from '../../features/voice/components/VoiceAssistantCard';
import { QuickAction } from '../../features/voice/types/voiceTypes';

interface HomeScreenProps {
  onNavigateToSchemes?: () => void;
}

type ActiveModal = 'symptoms' | 'hospital' | 'scan' | null;

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

  // ── Voice recorder state (all MediaRecorder logic lives in the hook) ─────
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

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setTextInput('');
    // Per spec: no /text-query endpoint — prompt user to use the mic
    // The error banner provides the message within the existing voice card design
    clearError();
    setTimeout(() => {
      // Brief delay so clearing and setting feels responsive
    }, 0);
  }, [textInput, clearError]);

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
      id: 'scan',
      label: t('home.scanTitle'),
      subLabel: t('home.scanDesc'),
      Icon: ScanText,
      gradientFrom: '#FFF7ED',
      gradientTo: '#FFEDD5',
      border: '#FDBA74',
      iconColor: '#EA580C',
      onClick: () => setActiveModal('scan'),
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

      {/* ── VOICE ASSISTANT CARD ───────────────────────────────────── */}
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

      {/* 1. Check Symptoms */}
      {activeModal === 'symptoms' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl rounded-b-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100 relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Check Health Symptoms</h3>
                <p className="text-xs text-slate-500">Fast AI symptom assessment for rural users</p>
              </div>
            </div>
            <div className="space-y-3 mb-5 text-xs">
              <label className="block text-slate-700 font-bold">Select primary symptom:</label>
              <div className="grid grid-cols-2 gap-2">
                {['Fever & Chills', 'Persistent Cough', 'Joint / Muscle Pain', 'Stomachache / Diarrhea'].map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-950 text-left font-medium transition-colors cursor-pointer"
                  >
                    {symptom}
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
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Hospital className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Nearby Health Centers</h3>
                <p className="text-xs text-slate-500">Government PHCs & Empanelled Hospitals</p>
              </div>
            </div>
            <div className="space-y-2.5 mb-4 text-xs">
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Kanchipuram Main PHC</p>
                  <p className="text-slate-500 text-[11px]">Primary Health Center • Open 24/7</p>
                  <p className="text-emerald-700 font-semibold text-[10px] mt-0.5">1.2 KM away</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Calling Kanchipuram Main PHC: +91 44 2722 0000')}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Government General Hospital</p>
                  <p className="text-slate-500 text-[11px]">Secondary Care • Ayushman Empanelled</p>
                  <p className="text-emerald-700 font-semibold text-[10px] mt-0.5">4.8 KM away</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Opening map directions to District General Hospital')}
                  className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Scan Document */}
      {activeModal === 'scan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <ScanText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Scan Medical / Scheme Doc</h3>
                <p className="text-xs text-slate-500">AI OCR extraction for ration card, prescriptions & PMJAY</p>
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-amber-50/50 transition-colors mb-4 cursor-pointer">
              <FileCheck className="w-10 h-10 text-amber-500 mb-2" />
              <p className="text-xs font-bold text-slate-800">Tap to Upload or Take Photo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports JPG, PNG, PDF up to 10MB</p>
            </div>
            <button
              type="button"
              onClick={() => {
                alert('Document scanned! AI extracted Ration Card ID & Ayushman Eligibility.');
                setActiveModal(null);
              }}
              className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
            >
              Simulate Document Scan
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomeScreen;
