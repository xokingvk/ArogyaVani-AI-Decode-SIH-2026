/**
 * SchemeVoiceAssistant Component
 * Dedicated voice search & query card for discovering government schemes.
 * UI/UX ready for RAG-powered scheme assistant integration.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Sparkles, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SchemeVoiceState } from '../types/schemeTypes';
import { SymmetricalWaveform } from '../../voice/components/SymmetricalWaveform';

export interface SchemeVoiceAssistantProps {
  voiceState?: SchemeVoiceState;
  onStartSchemeVoice?: () => void;
  onStopSchemeVoice?: () => void;
  onSubmitSchemeQuestion?: (question: string) => void;
  errorMessage?: string;
  onClearError?: () => void;
}

export const SchemeVoiceAssistant: React.FC<SchemeVoiceAssistantProps> = ({
  voiceState = 'idle',
  onStartSchemeVoice,
  onStopSchemeVoice,
  onSubmitSchemeQuestion,
  errorMessage,
  onClearError,
}) => {
  const { i18n } = useTranslation();
  const [inputText, setInputText] = useState<string>('');
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const isTamil = i18n.language?.startsWith('ta');
  const isTelugu = i18n.language?.startsWith('te');
  const isIndic = isTamil || isTelugu;

  const handleMicClick = () => {
    if (voiceState === 'listening') {
      if (onStopSchemeVoice) {
        onStopSchemeVoice();
      }
    } else if (onStartSchemeVoice) {
      onStartSchemeVoice();
    } else {
      // Presentation placeholder feedback when RAG voice backend is not connected yet
      setInfoNotice('Scheme Voice Assistant is prepared and ready for RAG voice engine integration.');
      setTimeout(() => setInfoNotice(null), 4000);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (onSubmitSchemeQuestion) {
      onSubmitSchemeQuestion(inputText.trim());
      setInputText('');
    } else {
      setInfoNotice(`Searching schemes matching: "${inputText.trim()}"`);
      setTimeout(() => setInfoNotice(null), 3500);
    }
  };

  // State labels
  const titles: Record<SchemeVoiceState, string> = {
    idle: 'Ask Arogya about Schemes',
    listening: 'Listening…',
    processing: 'Understanding your scheme question…',
    response: 'Your scheme results are ready',
    error: 'Could not complete voice query',
  };

  const subtitles: Record<SchemeVoiceState, string> = {
    idle: 'Ask which government health schemes may be relevant to you.',
    listening: 'Speak about the health support or scheme you need.',
    processing: 'Searching trusted government scheme documents…',
    response: 'Here are the relevant scheme findings below.',
    error: 'Please try again or type your question below.',
  };

  const micBg =
    voiceState === 'listening'
      ? 'linear-gradient(135deg, #06B6D4 0%, #0D9488 100%)'
      : voiceState === 'processing'
      ? 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
      : 'linear-gradient(135deg, #0D9488 0%, #087F7A 60%, #102A56 100%)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-2xl p-4 text-white relative overflow-hidden border border-white/15"
      style={{
        background:
          'radial-gradient(circle at 50% 20%, rgba(13,148,136,0.28) 0%, transparent 65%), linear-gradient(160deg, #102A56 0%, #153E65 50%, #086B69 100%)',
        boxShadow: '0 8px 24px -4px rgba(16,42,86,0.3), 0 2px 10px rgba(8,127,122,0.15)',
      }}
    >
      {/* Top subtle highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      <div className="flex flex-col items-center text-center">
        
        {/* Animated Mic Button */}
        <div className="relative flex items-center justify-center mb-1">
          <motion.span
            className="absolute rounded-full border border-teal-300/30 bg-teal-400/10"
            style={{ width: 88, height: 88 }}
            animate={
              voiceState === 'listening'
                ? { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }
                : { scale: [1, 1.05, 1], opacity: [0.35, 0.6, 0.35] }
            }
            transition={{ duration: voiceState === 'listening' ? 1.4 : 3.0, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.button
            type="button"
            id="scheme-voice-mic-btn"
            aria-label={titles[voiceState]}
            onClick={handleMicClick}
            className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer focus:outline-none"
            style={{
              background: micBg,
              boxShadow: '0 4px 16px rgba(13, 148, 136, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
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
                  className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"
                />
              ) : (
                <motion.span
                  key="mic"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                >
                  <Mic className="w-6 h-6 text-white drop-shadow-xs" strokeWidth={2.2} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Waveform container */}
        <div className="my-1">
          <SymmetricalWaveform isActive={voiceState === 'listening'} />
        </div>

        {/* Title & Subtitle */}
        <div className="mb-3 px-2">
          <h2 className={`font-extrabold text-white tracking-tight leading-snug ${isIndic ? 'text-[15px]' : 'text-base'}`}>
            {titles[voiceState]}
          </h2>
          <p className="text-xs text-teal-100/80 mt-0.5 leading-snug max-w-xs">
            {subtitles[voiceState]}
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-rose-500/20 border border-rose-400/30 rounded-xl p-2.5 mb-2.5 text-xs text-rose-200 flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {onClearError && (
              <button type="button" onClick={onClearError} className="p-1 text-rose-300 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}

        {/* Temporary Info Notice */}
        {infoNotice && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="w-full bg-teal-500/20 border border-teal-400/30 rounded-xl p-2.5 mb-2.5 text-xs text-teal-200 flex items-center justify-between gap-2 text-left"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{infoNotice}</span>
            </div>
            <button type="button" onClick={() => setInfoNotice(null)} className="p-1 text-teal-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Voice Trigger Button */}
        <motion.button
          type="button"
          id="scheme-ask-voice-btn"
          onClick={handleMicClick}
          className="w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-transform"
          style={{
            background:
              voiceState === 'listening'
                ? 'rgba(239, 68, 68, 0.85)'
                : 'linear-gradient(135deg, #0D9488 0%, #087F7A 100%)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
          whileTap={{ scale: 0.97 }}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{voiceState === 'listening' ? 'Stop Listening' : '🎙 Ask by Voice'}</span>
        </motion.button>

        {/* Fallback Text Input */}
        <form onSubmit={handleFormSubmit} className="w-full flex items-center gap-2 mt-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Or type your scheme question..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-teal-100/60 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
          <button
            type="submit"
            aria-label="Submit scheme question"
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </motion.div>
  );
};

export default SchemeVoiceAssistant;
