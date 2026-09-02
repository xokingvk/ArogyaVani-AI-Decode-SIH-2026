/**
 * SchemeHero Component
 * Compact, dignified government healthcare hero header.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SchemeHero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isTamil = i18n.language?.startsWith('ta');
  const isTelugu = i18n.language?.startsWith('te');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-[#102A56] via-[#143A66] to-[#0A4D5C] rounded-2xl p-4 text-white border border-white/10 shadow-xs relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-8 w-28 h-28 rounded-full bg-blue-400/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
            <Landmark className="w-5 h-5 text-teal-300" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className={`font-black text-white tracking-tight leading-tight ${isTamil || isTelugu ? 'text-base' : 'text-lg'}`}>
                {t('schemes.pageTitle') || 'Government Health Schemes'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-[10px] font-bold text-teal-200">
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                <span>Verified</span>
              </span>
            </div>
            <p className="text-xs text-slate-200/85 mt-1 leading-snug">
              Find government healthcare schemes, maternity benefits, free rations, and insurance support.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SchemeHero;
