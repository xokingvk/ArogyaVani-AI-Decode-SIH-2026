import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone, Hospital, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NearbyPHCFacility } from '../types/locationTypes';

interface NearbyPHCCardProps {
  facility: NearbyPHCFacility;
  index: number;
}

export const NearbyPHCCard: React.FC<NearbyPHCCardProps> = ({ facility, index }) => {
  const { t } = useTranslation();

  const isPhc = facility.facility_type === 'Primary Health Centre';
  const isGovt = facility.facility_type === 'Government Health Facility';

  // Distance formatting: < 1000m -> '850 m away', >= 1000m -> '1.2 km away'
  const formattedDistance =
    facility.distance_m < 1000
      ? t('home.nearbyPhc.awayM', { m: facility.distance_m })
      : t('home.nearbyPhc.awayKm', { km: facility.distance_km });

  const handleDirections = () => {
    if (facility.maps_url) {
      window.open(facility.maps_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCall = () => {
    if (facility.phone) {
      window.location.href = `tel:${facility.phone.replace(/\s+/g, '')}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        isPhc
          ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
          : isGovt
          ? 'bg-blue-50/40 border-blue-200/70'
          : 'bg-slate-50 border-slate-200/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        <div className="flex items-start gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              isPhc
                ? 'bg-emerald-600 text-white shadow-xs'
                : isGovt
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {isPhc ? (
              <Hospital className="w-4 h-4" />
            ) : isGovt ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              {facility.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                  isPhc
                    ? 'bg-emerald-100 text-emerald-800'
                    : isGovt
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {facility.facility_type === 'Primary Health Centre'
                  ? t('home.nearbyPhc.primaryHealthCentre')
                  : facility.facility_type === 'Government Health Facility'
                  ? t('home.nearbyPhc.govtHealthFacility')
                  : t('home.nearbyPhc.healthcareFacility')}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-700">
                • {formattedDistance}
              </span>
            </div>
          </div>
        </div>
      </div>

      {facility.address && (
        <div className="flex items-start gap-1.5 text-slate-500 text-xs mt-2 pl-0.5">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <p className="line-clamp-2 leading-relaxed">{facility.address}</p>
        </div>
      )}

      {/* Actions: Directions + Call (if phone exists) */}
      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
        <button
          type="button"
          onClick={handleDirections}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{t('home.nearbyPhc.directions')}</span>
        </button>

        {facility.phone && (
          <button
            type="button"
            onClick={handleCall}
            aria-label={`Call ${facility.name}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('home.nearbyPhc.call')}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
