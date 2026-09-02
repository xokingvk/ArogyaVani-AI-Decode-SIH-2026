import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { DashboardStatFlashCard } from '../../components/dashboard/DashboardStatFlashCard';
import { getDashboardStats } from '../../services/dashboardService';
import { DashboardStatsData } from '../../types/dashboardTypes';

interface DashboardHomeScreenProps {
  onNavigateToSettings?: () => void;
  onNavigateToEmergencySos?: () => void;
}

export const DashboardHomeScreen: React.FC<DashboardHomeScreenProps> = ({
  onNavigateToEmergencySos,
}) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getDashboardStats().then((data) => {
      if (isMounted) {
        setStats(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const cardDefs = stats
    ? [
      {
        title: t('history.voiceQueriesToday'),
        primaryValue: stats.voice_queries_today.primaryValue,
        secondaryLabel: t('history.voiceQueriesSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border-[#C7D2FE]',
        visualIndicator: 'sparkline' as const,
        dataSourceKey: 'voice_queries_today',
      },
      {
        title: t('history.schemeStatus'),
        primaryValue: stats.scheme_status.primaryValue,
        secondaryLabel: t('history.schemeStatusSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border-[#A7F3D0]',
        visualIndicator: 'trendUp' as const,
        dataSourceKey: 'scheme_status',
      },
      {
        title: t('history.lastSchemeCheck'),
        primaryValue: stats.last_scheme_check.primaryValue,
        secondaryLabel: t('history.lastSchemeCheckSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-[#FDE68A]',
        visualIndicator: 'calendarCheck' as const,
        dataSourceKey: 'last_scheme_check',
      },
      {
        title: t('history.nearestPdsCentre'),
        primaryValue: stats.nearest_pds_centre.primaryValue,
        secondaryLabel: t('history.nearestPdsSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border-[#CBD5E1]',
        visualIndicator: 'mapPin' as const,
        dataSourceKey: 'nearest_pds_centre',
      },
      {
        title: t('history.activeAlerts'),
        primaryValue: stats.active_alerts.primaryValue,
        secondaryLabel: t('history.activeAlertsSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] border-[#FECDD3]',
        visualIndicator: 'pulseLine' as const,
        dataSourceKey: 'active_alerts',
      },
      {
        title: t('history.familyConnected'),
        primaryValue: stats.family_connected_status.primaryValue,
        secondaryLabel: t('history.familyConnectedSub'),
        backgroundColorClass: 'bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-[#E9D5FF]',
        visualIndicator: 'networkNodes' as const,
        dataSourceKey: 'family_connected_status',
      },
    ]
    : [];

  return (
    <div className="w-full bg-[#F5F6FA] flex-1 flex flex-col py-3 px-3.5 sm:px-4.5">
      <div className="max-w-lg mx-auto space-y-3 w-full flex-1 flex flex-col">

        {/* ── 1. GREETING HERO CARD (Responsive & Collision-Free) ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-br from-[#112940] via-[#17385B] to-[#1E4973] rounded-2xl p-4 sm:p-4.5 text-white shadow-sm relative overflow-hidden border border-white/10"
        >
          {/* Subtle geometric glowing background accents */}
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-white/[0.03] skew-x-12 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-2.5">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white leading-snug flex-1 min-w-0 break-words">
                {t('history.greeting', { name: currentUser?.username || 'sriharini' })}
              </h2>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold border border-teal-400/20 shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>{t('history.aiActive')}</span>
              </div>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-200/90 mt-1 font-medium leading-snug break-words">
              {t('history.subtitle')}
            </p>

            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-medium backdrop-blur-xs border border-white/10">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-300" />
              <span className="capitalize">{currentUser?.village_district || 'kanchipuram'}</span>
            </div>
          </div>
        </motion.div>

        {/* ── 2 & 3. 2-COLUMN STAT CARDS GRID (Content-Aware, Equal Row Heights) ──── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-200/60 animate-pulse min-h-[110px]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 items-stretch">
            {cardDefs.map((card, idx) => (
              <DashboardStatFlashCard
                key={card.dataSourceKey}
                title={card.title}
                primaryValue={card.primaryValue}
                secondaryLabel={card.secondaryLabel}
                backgroundColorClass={card.backgroundColorClass}
                visualIndicator={card.visualIndicator}
                dataSourceKey={card.dataSourceKey}
                animationDelay={0.02 + idx * 0.035}
              />
            ))}
          </div>
        )}

        {/* ── 4. EMERGENCY SOS CARD (Proper Self-Contained Flex Layout) ───────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
          className="w-full bg-gradient-to-br from-[#E11D48] via-[#DC2626] to-[#BE123C] rounded-2xl py-6 px-4 sm:py-7 sm:px-5 flex flex-col items-center justify-between min-h-[205px] sm:min-h-[215px] gap-4 shadow-lg shadow-red-950/20 border border-red-400/25 relative overflow-hidden"
        >
          {/* Subtle radial sheen */}
          <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* ZONE 1: TOP (Title & Subtitle) */}
          <div className="text-center relative z-10 px-2 w-full">
            <h3 className="text-white font-black text-base sm:text-[17px] tracking-tight leading-snug break-words">
              {t('history.emergencySos')}
            </h3>
            <p className="text-red-100 text-xs font-medium mt-0.5 leading-snug break-words">
              {t('history.tapForEmergency')}
            </p>
          </div>

          {/* ZONE 2: CENTER (Prominent Circular SOS Button with Pulse Ripples) */}
          <div className="relative flex items-center justify-center py-2 z-10">
            <motion.span
              className="absolute w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute w-24 h-24 sm:w-26 sm:h-26 rounded-full bg-white/15"
              animate={{ scale: [1, 1.65, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
            <button
              type="button"
              id="history-sos-trigger-btn"
              onClick={onNavigateToEmergencySos}
              className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white shadow-xl shadow-black/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform focus:outline-none hover:shadow-2xl"
              aria-label="Emergency SOS"
            >
              <span className="text-[#DC2626] font-black text-lg sm:text-xl tracking-widest leading-none">
                SOS
              </span>
            </button>
          </div>

          {/* ZONE 3: BOTTOM (Warning / Help Text) */}
          <div className="flex items-center justify-center gap-1.5 text-red-100 text-xs font-medium text-center relative z-10 px-2 max-w-full">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-200" />
            <span className="leading-snug break-words">{t('history.callsNearestAsha')}</span>
          </div>
        </motion.div>

        {/* ── 5. INTENTIONAL BOTTOM CLEARANCE SPACER ───────────────────────────────── */}
        <div className="h-6 sm:h-8 w-full shrink-0" aria-hidden="true" />

      </div>
    </div>
  );
};

export default DashboardHomeScreen;
