/**
 * VoiceAssistantCard
 *
 * The main voice assistant UI card extracted from HomeScreen.
 * Purely presentational — all state and handlers come from useVoiceRecorder
 * via props.
 *
 * Renders:
 *  - Animated microphone button
 *  - Symmetrical waveform
 *  - Voice state label / subtitle
 *  - Error banner (dismissible)
 *  - Live transcription + AI response with TTS replay button
 *  - "Speak Now" pill button
 *  - Text input fallback form
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VoiceState } from '../types/voiceTypes';
import { SymmetricalWaveform } from './SymmetricalWaveform';

interface VoiceAssistantCardProps {
  voiceState: VoiceState;
  transcription: string;
  aiAnswer: string;
  isSpeakingTts: boolean;
  errorMessage: string;
  textInput: string;
  onSpeak: () => void;
  onClearError: () => void;
  onReplayAudio: () => void;
  onTextInputChange: (value: string) => void;
  onTextSubmit: (e: React.FormEvent) => void;
}

export const VoiceAssistantCard: React.FC<VoiceAssistantCardProps> = ({
  voiceState,
  transcription,
  aiAnswer,
  isSpeakingTts,
  errorMessage,
  textInput,
  onSpeak,
  onClearError,
  onReplayAudio,
  onTextInputChange,
  onTextSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const isTamil   = i18n.language?.startsWith('ta');
  const isTelugu  = i18n.language?.startsWith('te');
  const isIndic   = isTamil || isTelugu;

  const voiceLabel: Record<VoiceState, string> = {
    idle:       t('home.tapAndSpeak'),
    listening:  t('home.listening'),
    processing: t('home.understanding'),
    response:   t('home.voiceRecommendation'),
  };

  const voiceSub: Record<VoiceState, string> = {
    idle:       t('home.samplePrompt'),
    listening:  t('home.speakClearly'),
    processing: t('home.processingQuery'),
    response:   t('home.listenOrRead'),
  };

  const micBg =
    voiceState === 'listening'
      ? 'linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)'
      : voiceState === 'processing'
      ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
      : voiceState === 'response'
      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #0D9488 0%, #087F7A 60%, #164B72 100%)';

  const micShadow =
    voiceState === 'listening'
      ? '0 6px 24px rgba(6, 182, 212, 0.5)'
      : '0 6px 20px rgba(13, 148, 136, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
      className="mx-3 sm:mx-4 rounded-3xl overflow-hidden relative border border-white/10"
      style={{
        background:
          'radial-gradient(circle at 50% 28%, rgba(13,148,136,0.22) 0%, transparent 62%), linear-gradient(155deg, #102A56 0%, #164B72 50%, #087F7A 100%)',
        boxShadow:
          '0 12px 32px -4px rgba(16,42,86,0.36), 0 4px 16px rgba(8,127,122,0.2)',
      }}
    >
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className={`px-4 sm:px-5 pt-5 ${isIndic ? 'pb-5.5 sm:pb-6' : 'pb-5'} flex flex-col items-center text-center`}>

        {/* ── 1. Microphone button + pulse rings ── */}
        <div className="relative flex items-center justify-center mb-1">
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
          <motion.button
            type="button"
            id="home-mic-btn"
            aria-label={voiceLabel[voiceState]}
            onClick={onSpeak}
            className="relative z-10 w-[66px] h-[66px] rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
            style={{ background: micBg, boxShadow: micShadow }}
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
                  className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"
                />
              ) : (
                <motion.span
                  key="mic"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                >
                  <Mic className="w-7 h-7 text-white drop-shadow-sm" strokeWidth={2.2} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* ── 2. Waveform ── */}
        <div className="mt-1 mb-2">
          <SymmetricalWaveform isActive={voiceState === 'listening'} />
        </div>

        {/* ── 3. State label + subtitle ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={voiceState}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center mb-3.5 max-w-full px-2"
          >
            <h2 className={`text-white font-extrabold tracking-tight leading-snug text-center ${isIndic ? 'text-[16.5px] sm:text-[18px]' : 'text-[18px]'}`}>
              {voiceLabel[voiceState]}
            </h2>
            <p className={`text-teal-100/80 font-normal mt-1 leading-snug text-center ${isIndic ? 'text-[12.5px] sm:text-[13px]' : 'text-[13px]'}`}>
              {voiceSub[voiceState]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── 4. Error banner ── */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-500/20 border border-red-400/30 rounded-2xl p-3 mb-3 text-xs text-red-200 flex items-center justify-between gap-2 text-left"
          >
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={onClearError}
              className="p-1 text-red-300 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* ── 5. Transcription + AI response ── */}
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-3.5 mb-3 text-left border border-white/15 text-xs text-white space-y-2"
          >
            <div className="flex items-center gap-1.5 text-teal-200 font-bold">
              <Mic className="w-3.5 h-3.5" />
              <span>{t('home.youSaid')}</span>
            </div>
            <p className="italic text-teal-50 bg-black/20 p-2 rounded-xl border border-white/5">
              "{transcription}"
            </p>

            {aiAnswer && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-teal-300 font-extrabold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    <span>{t('home.aiGuidance')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onReplayAudio}
                    className="p-1 rounded-lg bg-teal-500/20 text-teal-200 hover:bg-teal-500/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] px-2 font-semibold"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${isSpeakingTts ? 'animate-pulse text-teal-300' : ''}`} />
                    <span>{isSpeakingTts ? t('home.reading') : t('home.listen')}</span>
                  </button>
                </div>
                <p className="text-white leading-relaxed font-medium">{aiAnswer}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 6. Speak Now button + text fallback ── */}
        <div className="w-full flex flex-col items-center gap-2.5">
          <motion.button
            type="button"
            id="home-speak-now-btn"
            aria-label={t('home.speakNow')}
            onClick={onSpeak}
            disabled={voiceState === 'listening' || voiceState === 'processing'}
            className={`flex items-center justify-center gap-2 rounded-full font-bold text-white focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed max-w-full ${isIndic ? 'px-6 py-2.5 text-[13px] sm:text-[14px]' : 'px-7 py-2.5 text-[14px]'}`}
            style={{
              background:
                voiceState === 'idle'
                  ? 'linear-gradient(135deg, #0D9488 0%, #087F7A 100%)'
                  : 'rgba(255,255,255,0.18)',
              boxShadow:
                voiceState === 'idle'
                  ? '0 4px 16px rgba(13,148,136,0.38), inset 0 1px 1px rgba(255,255,255,0.25)'
                  : 'none',
              backdropFilter: voiceState !== 'idle' ? 'blur(8px)' : undefined,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 24 }}
          >
            <Mic className="w-4 h-4 shrink-0" strokeWidth={2.4} />
            <span className="whitespace-nowrap leading-none">
              {voiceState === 'idle'
                ? t('home.speakNow')
                : voiceState === 'response'
                ? t('home.askAnother')
                : voiceLabel[voiceState]}
            </span>
          </motion.button>

          {/* Text input fallback */}
          <form onSubmit={onTextSubmit} className="w-full flex items-center gap-2 mt-1">
            <input
              type="text"
              value={textInput}
              onChange={(e) => onTextInputChange(e.target.value)}
              placeholder={t('home.typeSymptom')}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default VoiceAssistantCard;
