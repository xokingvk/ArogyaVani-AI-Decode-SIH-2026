import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Calendar, Activity } from 'lucide-react';

export type VisualIndicator = 'sparkline' | 'trendUp' | 'mapPin' | 'pulseLine' | 'networkNodes' | 'calendarCheck';

export interface DashboardStatFlashCardProps {
  title: string;
  primaryValue: string;
  secondaryLabel: string;
  backgroundColorClass: string;
  visualIndicator?: VisualIndicator;
  dataSourceKey: string;
  animationDelay?: number;
}

// ── Decorative mini-visuals aligned safely in the card header ──────────────────

const SparklineVisual = () => (
  <svg viewBox="0 0 54 24" className="w-7 h-4 text-indigo-500/50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,18 12,11 20,15 30,6 40,11 52,4" />
    <circle cx="52" cy="4" r="2.5" fill="currentColor" />
  </svg>
);

const TrendUpVisual = () => (
  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700/80 shrink-0">
    <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.4} />
  </div>
);

const CalendarCheckVisual = () => (
  <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700/80 shrink-0">
    <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
  </div>
);

const MapPinVisual = () => (
  <div className="w-6 h-6 rounded-lg bg-slate-500/15 flex items-center justify-center text-slate-700/80 shrink-0">
    <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} />
  </div>
);

const PulseLineVisual = () => (
  <div className="w-6 h-6 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-700/80 shrink-0">
    <Activity className="w-3.5 h-3.5 animate-pulse" strokeWidth={2.2} />
  </div>
);

const NetworkNodesVisual = () => (
  <svg viewBox="0 0 46 28" className="w-7 h-4 text-purple-600/50" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <circle cx="23" cy="14" r="3" />
    <circle cx="7" cy="7" r="2.2" />
    <circle cx="39" cy="7" r="2.2" />
    <circle cx="7" cy="21" r="2.2" />
    <circle cx="39" cy="21" r="2.2" />
    <line x1="23" y1="14" x2="7" y2="7" strokeWidth="1.2" />
    <line x1="23" y1="14" x2="39" y2="7" strokeWidth="1.2" />
    <line x1="23" y1="14" x2="7" y2="21" strokeWidth="1.2" />
    <line x1="23" y1="14" x2="39" y2="21" strokeWidth="1.2" />
  </svg>
);

const VisualMap: Record<VisualIndicator, React.ReactNode> = {
  sparkline: <SparklineVisual />,
  trendUp: <TrendUpVisual />,
  calendarCheck: <CalendarCheckVisual />,
  mapPin: <MapPinVisual />,
  pulseLine: <PulseLineVisual />,
  networkNodes: <NetworkNodesVisual />,
};

// ── Card Component with Content-Aware Sizing & Resilient Text Wrapping ──────

export const DashboardStatFlashCard: React.FC<DashboardStatFlashCardProps> = ({
  title,
  primaryValue,
  secondaryLabel,
  backgroundColorClass,
  visualIndicator,
  animationDelay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: animationDelay, ease: 'easeOut' }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between h-full min-h-[118px] sm:min-h-[124px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border transition-all duration-200 ${backgroundColorClass}`}
      style={{ overflowWrap: 'anywhere' }}
    >
      {/* Subtle top highlight sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/70 pointer-events-none" />

      {/* HEADER: Title (flexible wrap) + Icon (compact, no overlap) */}
      <div className="flex items-start justify-between gap-1 w-full">
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-600/95 uppercase tracking-tight leading-tight flex-1 min-w-0 break-words" style={{ overflowWrap: 'anywhere' }}>
          {title}
        </p>
        {visualIndicator && (
          <div className="shrink-0 select-none -mt-0.5 ml-0.5">
            {VisualMap[visualIndicator]}
          </div>
        )}
      </div>

      {/* CONTENT: Primary value + Secondary text cleanly separated and auto-wrapping */}
      <div className="mt-2 w-full flex flex-col justify-end">
        <p className="text-sm sm:text-base md:text-lg font-black text-slate-800 tracking-tight leading-snug break-words" style={{ overflowWrap: 'anywhere' }}>
          {primaryValue}
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 leading-tight break-words" style={{ overflowWrap: 'anywhere' }}>
          {secondaryLabel}
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardStatFlashCard;
