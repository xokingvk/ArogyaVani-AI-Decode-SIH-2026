import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hospital } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNearbyPHC } from '../hooks/useNearbyPHC';
import { LocationPermissionState } from './LocationPermissionState';
import { NearbyPHCList } from './NearbyPHCList';

interface NearbyPHCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NearbyPHCModal: React.FC<NearbyPHCModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    state,
    facilities,
    hasPhcMatch,
    errorMessage,
    findNearbyPHC,
    retry,
    reset,
  } = useNearbyPHC();

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen && state === 'idle') {
      // Keep idle so user taps 'Use My Location' explicitly
    } else if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md bg-white rounded-3xl rounded-b-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-100 relative max-h-[88vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-3.5 pb-2.5 border-b border-slate-100 shrink-0 pr-8">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {t('home.nearbyPhc.title')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('home.nearbyPhc.modalSub')}
              </p>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto">
            {state === 'results' ? (
              <NearbyPHCList
                facilities={facilities}
                hasPhcMatch={hasPhcMatch}
                onRefresh={retry}
              />
            ) : (
              <LocationPermissionState
                state={state}
                errorMessage={errorMessage}
                onLocate={findNearbyPHC}
                onRetry={retry}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
