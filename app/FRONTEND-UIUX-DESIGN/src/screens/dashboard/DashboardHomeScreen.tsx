import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { DashboardStatFlashCard } from '../../components/dashboard/DashboardStatFlashCard';
import { getDashboardStats } from '../../services/dashboardService';
import { getNearestPDS } from '../../services/pdsService';
import { DashboardStatsData } from '../../types/dashboardTypes';

interface DashboardHomeScreenProps {
  isActive?: boolean;
  onNavigateToSettings?: () => void;
  onNavigateToEmergencySos?: () => void;
}

// ──────────────────────────────────────────────────────────────
// PDS card state machine
// ──────────────────────────────────────────────────────────────
type PdsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; name: string; distanceLabel: string; subLabel: string; mapsUrl: string | null }
  | { status: 'error'; message: string };

export const DashboardHomeScreen: React.FC<DashboardHomeScreenProps> = ({
  isActive = true,
  onNavigateToEmergencySos,
}) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pds, setPds] = useState<PdsState>({ status: 'loading' });
  const isPdsFetchingRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const loadStats = useCallback(async () => {
    const requestId = ++loadRequestIdRef.current;
    try {
      const data = await getDashboardStats(currentUser);
      if (requestId === loadRequestIdRef.current) {
        setStats(data);
        setIsLoading(false);
      }
    } catch {
      if (requestId === loadRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  // ── Auto-fetch PDS centre (one-shot GPS on tab activation) ───
  const fetchPds = useCallback(async (_force: boolean = false) => {
    if (isPdsFetchingRef.current) return;
    isPdsFetchingRef.current = true;
    setPds({ status: 'loading' });

    try {
      const result = await getNearestPDS();
      if (result.centre) {
        setPds({
          status: 'found',
          name: result.centre.name || 'Fair Price Shop',
          distanceLabel: `${result.centre.distance_km} km`,
          subLabel: result.subLabel,
          mapsUrl: result.mapsUrl,
        });
      } else {
        setPds({ status: 'error', message: 'No nearby PDS found' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Location lookup failed';
      setPds({ status: 'error', message: msg });
    } finally {
      isPdsFetchingRef.current = false;
    }
  }, []);

  // ── Load stats & trigger PDS lookup whenever screen is active ──
  useEffect(() => {
    if (isActive) {
      loadStats();
      fetchPds();
    }

    const handleContactsUpdated = () => {
      loadStats();
    };
    const handleSchemeLogged = () => {
      loadStats();
    };

    window.addEventListener('arogya:emergency_contacts_updated', handleContactsUpdated);
    window.addEventListener('arogya:scheme_check_logged', handleSchemeLogged);

    return () => {
      window.removeEventListener('arogya:emergency_contacts_updated', handleContactsUpdated);
      window.removeEventListener('arogya:scheme_check_logged', handleSchemeLogged);
    };
  }, [isActive, loadStats, fetchPds]);

  // ── Card click handler (Open Maps when found, or retry if error) ──
  const handlePdsTap = useCallback(() => {
    if (pds.status === 'found' && pds.mapsUrl) {
      window.open(pds.mapsUrl, '_blank', 'noopener,noreferrer');
    } else if (pds.status === 'error' || pds.status === 'idle') {
      fetchPds(true);
    }
  }, [pds, fetchPds]);

  // ── Derive PDS card display values ───────────────────────────
  const pdsCardValue = (): string => {
    switch (pds.status) {
      case 'idle':
      case 'loading': return t('common.locating', 'Locating…');
      case 'found':   return pds.name;
      case 'error':   return t('common.unavailable', 'Location unavailable');
    }
  };

  const pdsCardSub = (): string => {
    switch (pds.status) {
      case 'idle':
      case 'loading': return 'Finding nearest PDS…';
      case 'found':   return `${pds.distanceLabel} away • Tap for maps`;
      case 'error':   return pds.message || 'No nearby PDS found';
    }
  };

  // ── Card definitions ─────────────────────────────────────────
  const cardDefs = stats
    ? [
        {
          title: t('history.voiceQueriesToday'),
          primaryValue: stats.voice_queries_today.primaryValue,
          secondaryLabel: stats.voice_queries_today.secondaryLabel,
          backgroundColorClass: 'bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border-[#C7D2FE]',
          visualIndicator: 'sparkline' as const,
          dataSourceKey: 'voice_queries_today',
        },
        {
          title: t('history.schemeStatus'),
          primaryValue: stats.scheme_status.primaryValue,
          secondaryLabel: stats.scheme_status.secondaryLabel,
          backgroundColorClass: 'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border-[#A7F3D0]',
          visualIndicator: 'trendUp' as const,
          dataSourceKey: 'scheme_status',
        },
        {
          title: t('history.lastSchemeCheck'),
          primaryValue: stats.last_scheme_check.primaryValue,
          secondaryLabel: stats.last_scheme_check.secondaryLabel,
          backgroundColorClass: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-[#FDE68A]',
          visualIndicator: 'calendarCheck' as const,
          dataSourceKey: 'last_scheme_check',
        },
        {
          title: t('history.nearestPdsCentre'),
          primaryValue: pdsCardValue(),
          secondaryLabel: pdsCardSub(),
          backgroundColorClass: 'bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] border-[#CBD5E1]',
          visualIndicator: 'mapPin' as const,
          dataSourceKey: 'nearest_pds_centre',
          onTap: pds.status !== 'loading' ? handlePdsTap : undefined,
        },
        {
          title: t('history.activeAlerts'),
          primaryValue: stats.active_alerts.primaryValue,
          secondaryLabel: stats.active_alerts.secondaryLabel,
          backgroundColorClass: 'bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] border-[#FECDD3]',
          visualIndicator: 'pulseLine' as const,
          dataSourceKey: 'active_alerts',
        },
        {
          title: t('history.familyConnected'),
          primaryValue: stats.family_connected_status.primaryValue,
          secondaryLabel: stats.family_connected_status.secondaryLabel,
          backgroundColorClass: 'bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-[#E9D5FF]',
          visualIndicator: 'networkNodes' as const,
          dataSourceKey: 'family_connected_status',
        },
      ]
    : [];

  return (
    <div className="w-full bg-[#F5F6FA] flex-1 flex flex-col py-3 px-3 sm:px-4">
      <div className="max-w-lg mx-auto space-y-3 w-full flex-1 flex flex-col">

        {/* ── 1. GREETING HERO CARD ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="bg-gradient-to-br from-[#112940] via-[#17385B] to-[#1E4973] rounded-2xl p-4 sm:p-4.5 text-white shadow-sm relative overflow-hidden border border-white/10"
        >
          {/* Subtle geometric glowing background accents */}
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-white/[0.03] skew-x-12 pointer-events-none" />

          <div className="relative z-10" style={{ overflowWrap: 'anywhere' }}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug flex-1 min-w-0 break-words" style={{ overflowWrap: 'anywhere' }}>
                {t('history.greeting', { name: currentUser?.username || 'User' })}
              </h2>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10.5px] font-semibold border border-teal-400/20 shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
                <span>{t('history.aiActive')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200/90 mt-1 font-medium leading-snug break-words" style={{ overflowWrap: 'anywhere' }}>
              {t('history.subtitle')}
            </p>

            <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-medium backdrop-blur-xs border border-white/10">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-300" />
              <span className="capitalize">{currentUser?.village_district || 'India'}</span>
            </div>
          </div>
        </motion.div>

        {/* ── 2 & 3. STAT CARDS GRID ─────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-stretch w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-200/60 animate-pulse min-h-[118px]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 items-stretch w-full">
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
                onTap={'onTap' in card ? card.onTap : undefined}
              />
            ))}
          </div>
        )}

        {/* PDS loading indicator (shown below cards when GPS is running) */}
        {pds.status === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium"
          >
            <Navigation className="w-3.5 h-3.5 animate-spin text-teal-500" />
            <span>Finding nearest PDS centre…</span>
          </motion.div>
        )}

        {/* PDS directions shortcut (shown after found) */}
        {pds.status === 'found' && pds.mapsUrl && (
          <motion.a
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            href={pds.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-teal-600" />
            <span>Get directions to nearest PDS centre</span>
          </motion.a>
        )}

        {/* ── 4. EMERGENCY SOS CARD ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
          className="w-full bg-gradient-to-br from-[#E11D48] via-[#DC2626] to-[#BE123C] rounded-2xl py-5 px-3.5 sm:py-6 sm:px-5 flex flex-col items-center justify-between min-h-[195px] gap-3.5 shadow-lg shadow-red-950/20 border border-red-400/25 relative overflow-hidden"
          style={{ overflowWrap: 'anywhere' }}
        >
          {/* Subtle radial sheen */}
          <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          {/* ZONE 1: TOP */}
          <div className="text-center relative z-10 px-1 w-full" style={{ overflowWrap: 'anywhere' }}>
            <h3 className="text-white font-black text-sm sm:text-base tracking-tight leading-snug break-words">
              {t('history.emergencySos')}
            </h3>
            <p className="text-red-100 text-[11px] sm:text-xs font-medium mt-0.5 leading-snug break-words">
              {t('history.tapForEmergency')}
            </p>
          </div>

          {/* ZONE 2: CENTER – Pulsing SOS button */}
          <div className="relative flex items-center justify-center py-1.5 z-10">
            <motion.span
              className="absolute w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-white/15"
              animate={{ scale: [1, 1.65, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
            <button
              type="button"
              id="history-sos-trigger-btn"
              onClick={onNavigateToEmergencySos}
              className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-white shadow-xl shadow-black/20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform focus:outline-none hover:shadow-2xl"
              aria-label="Emergency SOS"
            >
              <span className="text-[#DC2626] font-black text-base sm:text-lg tracking-widest leading-none">
                SOS
              </span>
            </button>
          </div>

          {/* ZONE 3: BOTTOM */}
          <div className="flex items-center justify-center gap-1.5 text-red-100 text-[11px] sm:text-xs font-medium text-center relative z-10 px-1 max-w-full" style={{ overflowWrap: 'anywhere' }}>
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-200" />
            <span className="leading-snug break-words">{t('history.callsNearestAsha')}</span>
          </div>
        </motion.div>

        {/* ── 5. BOTTOM CLEARANCE SPACER ────────────────────────────────── */}
        <div className="h-6 sm:h-8 w-full shrink-0" aria-hidden="true" />

      </div>
    </div>
  );
};

export default DashboardHomeScreen;
