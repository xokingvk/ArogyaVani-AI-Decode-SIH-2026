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
  <svg viewBox="0 0 54 24" className="w-11 h-6 text-indigo-500/45" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,18 12,11 20,15 30,6 40,11 52,4" />
    <circle cx="52" cy="4" r="2.5" fill="currentColor" />
  </svg>
);

const TrendUpVisual = () => (
  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700/75">
    <TrendingUp className="w-4 h-4" strokeWidth={2.4} />
  </div>
);

const CalendarCheckVisual = () => (
  <div className="w-7 h-7 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-700/70">
    <Calendar className="w-4 h-4" strokeWidth={2.2} />
  </div>
);

const MapPinVisual = () => (
  <div className="w-7 h-7 rounded-xl bg-slate-500/15 flex items-center justify-center text-slate-700/70">
    <MapPin className="w-4 h-4" strokeWidth={2.2} />
  </div>
);

const PulseLineVisual = () => (
  <div className="w-7 h-7 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-700/75">
    <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.2} />
  </div>
);

const NetworkNodesVisual = () => (
  <svg viewBox="0 0 46 28" className="w-10 h-6 text-purple-600/45" fill="currentColor" stroke="currentColor" strokeWidth="1">
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

// ── Card Component with Content-Aware Sizing & Header Icon Placement ─────────

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
      className={`relative rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between h-full min-h-[110px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border transition-all duration-200 ${backgroundColorClass}`}
    >
      {/* Subtle top highlight sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/70 pointer-events-none" />

      {/* HEADER: Title (flexible wrap) + Icon (reserved top-right area, no overlap) */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <p className="text-[11px] sm:text-[11.5px] font-bold text-slate-600/95 uppercase tracking-wider leading-snug flex-1 min-w-0 break-words">
          {title}
        </p>
        {visualIndicator && (
          <div className="shrink-0 select-none -mt-0.5 ml-1">
            {VisualMap[visualIndicator]}
          </div>
        )}
      </div>

      {/* CONTENT: Primary value + Secondary text cleanly separated */}
      <div className="mt-3 w-full">
        <p className="text-xl sm:text-[22px] font-black text-slate-800 tracking-tight leading-tight">
          {primaryValue}
        </p>
        <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug break-words">
          {secondaryLabel}
        </p>
      </div>
    </motion.div>
  );
};

export default DashboardStatFlashCard;
