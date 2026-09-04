import React from 'react';
import { LocateFixed, RefreshCw, AlertCircle, MapPinOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocationState } from '../types/locationTypes';

interface LocationPermissionStateProps {
  state: LocationState;
  errorMessage?: string;
  onLocate: () => void;
  onRetry: () => void;
}

export const LocationPermissionState: React.FC<LocationPermissionStateProps> = ({
  state,
  errorMessage,
  onLocate,
  onRetry,
}) => {
  const { t } = useTranslation();

  if (state === 'idle') {
    return (
      <div className="text-center py-6 px-4">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
          <LocateFixed className="w-7 h-7" />
        </div>
        <h4 className="font-extrabold text-slate-900 text-base mb-1">
          {t('home.nearbyPhc.title')}
        </h4>
        <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed mb-5">
          {t('home.nearbyPhc.desc')}
        </p>
        <button
          type="button"
          onClick={onLocate}
          className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
        >
          <LocateFixed className="w-4 h-4" />
          <span>{t('home.nearbyPhc.useMyLocation')}</span>
        </button>
      </div>
    );
  }

  if (state === 'locating' || state === 'searching') {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="font-bold text-slate-900 text-sm mb-1">
          {state === 'locating'
            ? t('home.nearbyPhc.gettingLocation')
            : t('home.nearbyPhc.findingFacilities')}
        </p>
        <p className="text-slate-400 text-xs">
          {t('home.nearbyPhc.searchingRadius')}
        </p>
      </div>
    );
  }

  if (state === 'permission_denied') {
    return (
      <div className="text-center py-6 px-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <MapPinOff className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">
          {t('home.nearbyPhc.permissionDeniedTitle')}
        </h4>
        <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed mb-4">
          {errorMessage || t('home.nearbyPhc.permissionDeniedSub')}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('home.nearbyPhc.tryAgain')}</span>
        </button>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="text-center py-6 px-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">
          {t('home.nearbyPhc.noFacilitiesTitle')}
        </h4>
        <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed mb-4">
          {t('home.nearbyPhc.noFacilitiesSub')}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('home.nearbyPhc.searchAgain')}</span>
        </button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="text-center py-6 px-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">
          {t('home.nearbyPhc.errorTitle')}
        </h4>
        <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed mb-4">
          {errorMessage || t('home.nearbyPhc.errorSub')}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('home.nearbyPhc.tryAgain')}</span>
        </button>
      </div>
    );
  }

  return null;
};
