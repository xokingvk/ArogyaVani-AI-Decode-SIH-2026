import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info, RefreshCw } from 'lucide-react';
import { NearbyPHCFacility } from '../types/locationTypes';
import { NearbyPHCCard } from './NearbyPHCCard';

interface NearbyPHCListProps {
  facilities: NearbyPHCFacility[];
  hasPhcMatch: boolean;
  onRefresh: () => void;
}

export const NearbyPHCList: React.FC<NearbyPHCListProps> = ({
  facilities,
  hasPhcMatch,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Header with count and refresh */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm">
            {t('home.nearbyPhc.resultsTitle')}
          </h4>
          <p className="text-slate-500 text-xs">
            {facilities.length === 1
              ? t('home.nearbyPhc.facilityFound')
              : t('home.nearbyPhc.facilitiesFound', { count: facilities.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('home.nearbyPhc.refresh')}</span>
        </button>
      </div>

      {/* Fallback Notice if no exact PHC match */}
      {!hasPhcMatch && (
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {t('home.nearbyPhc.fallbackNotice')}
          </p>
        </div>
      )}

      {/* Cards list */}
      <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
        {facilities.map((fac, idx) => (
          <NearbyPHCCard key={fac.id} facility={fac} index={idx} />
        ))}
      </div>
    </div>
  );
};
