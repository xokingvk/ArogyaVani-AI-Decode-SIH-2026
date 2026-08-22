import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Stethoscope,
  Hospital,
  Landmark,
  ScanText,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface HomeScreenProps {
  onNavigateToSchemes?: () => void;
}

/* ─── Voice States ─────────────────────────────────────────────── */
type VoiceState = 'idle' | 'listening' | 'processing';

/* ─── Quick Action Config ──────────────────────────────────────── */
interface QuickAction {
  id: string;
  label: string;
  subLabel: string;
  Icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  border: string;
  iconColor: string;
  onClick?: () => void;
}

/* ─── Symmetrical Waveform Config ────────────────────── */
const SYMMETRICAL_WAVE_BARS = [
  { minH: 4, maxH: 12, delay: 0.32 },
  { minH: 6, maxH: 18, delay: 0.24 },
  { minH: 9, maxH: 24, delay: 0.16 },
  { minH: 13, maxH: 28, delay: 0.08 },
  { minH: 16, maxH: 30, delay: 0 },
  { minH: 13, maxH: 28, delay: 0.08 },
  { minH: 9, maxH: 24, delay: 0.16 },
  { minH: 6, maxH: 18, delay: 0.24 },
  { minH: 4, maxH: 12, delay: 0.32 },
];

/* ─── Wave Bar (voice visualizer) ─────────────────────────────── */
const SymmetricalWaveform: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-8">
    {SYMMETRICAL_WAVE_BARS.map((bar, idx) => (
      <motion.span
        key={idx}
        className="w-1 rounded-full bg-teal-200/60"
        animate={
          isActive
            ? {
              height: [bar.minH, bar.maxH, bar.minH],
              opacity: [0.6, 1, 0.6],
              backgroundColor: ['rgba(94, 234, 212, 0.6)', 'rgba(255, 255, 255, 0.95)', 'rgba(94, 234, 212, 0.6)'],
            }
            : {
              height: [bar.minH, bar.minH + 3, bar.minH],
              opacity: [0.35, 0.55, 0.35],
              backgroundColor: 'rgba(94, 234, 212, 0.45)',
            }
        }
        transition={{
          duration: isActive ? 0.75 : 2.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: bar.delay,
        }}
      />
    ))}
  </div>
);

/* ─── Main Component ───────────────────────────────────────────── */
export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSchemes }) => {
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');

  const isTamil = i18n.language?.startsWith('ta');

  const displayName =
    currentUser?.username
      ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)
      : 'there';

  /* Simulate voice interaction cycle */
  const handleSpeak = useCallback(() => {
    if (voiceState !== 'idle') return;
    setVoiceState('listening');
    setTimeout(() => setVoiceState('processing'), 3000);
    setTimeout(() => setVoiceState('idle'), 5500);
  }, [voiceState]);

  const voiceLabel: Record<VoiceState, string> = {
    idle: t('home.tapAndSpeak'),
    listening: t('home.listening'),
    processing: t('home.understanding'),
  };

  const voiceSub: Record<VoiceState, string> = {
    idle: t('home.samplePrompt'),
    listening: t('home.speakClearly'),
    processing: t('home.processingQuery'),
  };

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
      onClick: onNavigateToSchemes,
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
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-full bg-slate-50 pb-6">

      {/* ── GREETING ─────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`font-black text-[#16324F] leading-snug tracking-tight ${
            isTamil ? 'text-[20px] sm:text-[22px]' : 'text-[22px]'
          }`}
        >
          {t('home.greeting', { name: displayName })}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
          className={`text-slate-500 mt-1 font-medium leading-snug ${
            isTamil ? 'text-[13px] sm:text-sm' : 'text-sm'
          }`}
        >
          {t('home.howCanIHelp')}
        </motion.p>
      </div>

      {/* ── VOICE ASSISTANT CARD (Responsive Vertical Height for Tamil) ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
        className="mx-4 rounded-3xl overflow-hidden relative border border-white/10"
        style={{
          background: 'radial-gradient(circle at 50% 28%, rgba(13,148,136,0.22) 0%, transparent 62%), linear-gradient(155deg, #102A56 0%, #164B72 50%, #087F7A 100%)',
          boxShadow: '0 12px 32px -4px rgba(16,42,86,0.36), 0 4px 16px rgba(8,127,122,0.2)',
        }}
      >
        {/* Subtle top inner sheen */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Card Content - Clean Centered Vertical Hierarchy with enough bottom clearance */}
        <div className={`px-4 sm:px-5 pt-5 ${isTamil ? 'pb-5.5 sm:pb-6' : 'pb-5'} flex flex-col items-center text-center`}>

          {/* 1. TOP: Microphone Area with Concentric Rings & Visualizer */}
          <div className="relative flex items-center justify-center mb-1">
            {/* Outer concentric ring */}
            <motion.span
              className="absolute rounded-full border border-teal-400/20 bg-teal-500/5"
              style={{ width: 116, height: 116 }}
              animate={
                voiceState === 'idle'
                  ? { scale: [1, 1.05, 1], opacity: [0.45, 0.75, 0.45] }
                  : { scale: [1, 1.12, 1], opacity: [0.6, 0.9, 0.6] }
              }
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Middle concentric ring */}
            <motion.span
              className="absolute rounded-full border border-teal-300/30 bg-teal-400/10"
              style={{ width: 90, height: 90 }}
              animate={
                voiceState === 'listening'
                  ? { scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }
                  : { scale: [1, 1.04, 1], opacity: [0.5, 0.7, 0.5] }
              }
              transition={{ duration: voiceState === 'listening' ? 1.4 : 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            {/* Mic button */}
            <motion.button
              type="button"
              id="home-mic-btn"
              aria-label={voiceLabel[voiceState]}
              onClick={handleSpeak}
              className="relative z-10 w-[66px] h-[66px] rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
              style={{
                background:
                  voiceState === 'listening'
                    ? 'linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)'
                    : voiceState === 'processing'
                      ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                      : 'linear-gradient(135deg, #0D9488 0%, #087F7A 60%, #164B72 100%)',
                boxShadow:
                  voiceState === 'listening'
                    ? '0 6px 24px rgba(6, 182, 212, 0.5)'
                    : '0 6px 20px rgba(13, 148, 136, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
              }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 450, damping: 22 }}
            >
              <AnimatePresence mode="wait">
                {voiceState === 'processing' ? (
                  <motion.span
                    key="proc"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  />
                ) : (
                  <motion.span
                    key="mic"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mic className="w-7 h-7 text-white drop-shadow-sm" strokeWidth={2.2} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Symmetrical Waveform */}
          <div className="mt-1 mb-2">
            <SymmetricalWaveform isActive={voiceState === 'listening'} />
          </div>

          {/* 2. MIDDLE: State Label & Prompt */}
          <AnimatePresence mode="wait">
            <motion.div
              key={voiceState}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center mb-3.5 max-w-full px-2"
            >
              <h2 className={`text-white font-extrabold tracking-tight leading-snug text-center ${
                isTamil ? 'text-[16.5px] sm:text-[18px]' : 'text-[18px]'
              }`}>
                {voiceLabel[voiceState]}
              </h2>
              <p className={`text-teal-100/80 font-normal mt-1 leading-snug text-center ${
                isTamil ? 'text-[12.5px] sm:text-[13px]' : 'text-[13px]'
              }`}>
                {voiceSub[voiceState]}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* 3. LOWER MIDDLE: Speak Now button (Fully Contained & Centered) */}
          <motion.button
            type="button"
            id="home-speak-now-btn"
            aria-label={t('home.speakNow')}
            onClick={handleSpeak}
            disabled={voiceState !== 'idle'}
            className={`flex items-center justify-center gap-2 rounded-full font-bold text-white focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed max-w-full ${
              isTamil ? 'px-6 py-2.5 text-[13px] sm:text-[14px]' : 'px-7 py-2.5 text-[14px]'
            }`}
            style={{
              background:
                voiceState === 'idle'
                  ? 'linear-gradient(135deg, #0D9488 0%, #087F7A 100%)'
                  : 'rgba(255,255,255,0.12)',
              boxShadow:
                voiceState === 'idle'
                  ? '0 4px 16px rgba(13,148,136,0.38), inset 0 1px 1px rgba(255,255,255,0.25)'
                  : 'none',
              backdropFilter: voiceState !== 'idle' ? 'blur(8px)' : undefined,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={voiceState === 'idle' ? { scale: 0.96 } : {}}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
          >
            <Mic className="w-4 h-4 shrink-0" strokeWidth={2.4} />
            <span className="whitespace-nowrap leading-none">{voiceState === 'idle' ? t('home.speakNow') : voiceLabel[voiceState]}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ── QUICK ACTIONS (Equal Row Heights + No Collision) ─────────────────────────────────────────── */}
      <div className="px-4 mt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {t('home.quickActions')}
        </p>
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              id={`home-quick-${action.id}`}
              type="button"
              aria-label={action.label}
              onClick={action.onClick}
              className="text-left rounded-2xl p-3.5 sm:p-4 border cursor-pointer focus:outline-none active:scale-95 transition-transform flex flex-col justify-between h-full min-h-[128px] sm:min-h-[132px]"
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
              {/* Icon & Arrow in protected top row */}
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

              {/* Text content area with natural multi-line wrapping */}
              <div className="flex-1 flex flex-col justify-end w-full mt-1">
                <p
                  className={`font-bold leading-snug break-words ${
                    isTamil ? 'text-[12px] sm:text-[12.5px] line-clamp-3' : 'text-[13px] line-clamp-2'
                  }`}
                  style={{ color: '#16324F' }}
                >
                  {action.label}
                </p>
                <p
                  className={`text-slate-400 font-medium mt-0.5 leading-snug break-words ${
                    isTamil ? 'text-[10px] sm:text-[10.5px] line-clamp-3' : 'text-[10.5px] line-clamp-2'
                  }`}
                >
                  {action.subLabel}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Spin keyframe for processing spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default HomeScreen;
