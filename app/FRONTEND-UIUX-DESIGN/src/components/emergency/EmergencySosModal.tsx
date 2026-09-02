import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PhoneCall, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState<number>(3);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string>('connecting');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && countdown > 0 && !isCalling) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && countdown === 0 && !isCalling) {
      triggerEmergencyCall();
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, isCalling]);

  const triggerEmergencyCall = () => {
    setIsCalling(true);
    setDispatchStatus('connecting');
    setTimeout(() => {
      setDispatchStatus('dispatched');
    }, 2500);
  };

  const handleReset = () => {
    setCountdown(3);
    setIsCalling(false);
    setDispatchStatus('connecting');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#450A0A] rounded-3xl p-6 text-white shadow-2xl border border-red-500/30 relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Glowing red accent */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={handleReset}
            className="absolute top-4 right-4 p-2 text-red-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {!isCalling ? (
            <>
              {/* Header Icon */}
              <div className="w-14 h-14 rounded-2xl bg-red-600/40 border border-red-400/30 flex items-center justify-center mb-3 text-red-200">
                <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
              </div>

              <h2 className="text-xl font-black tracking-tight text-white mb-1">
                {t('history.emergencySos')}
              </h2>
              <p className="text-xs text-red-200 font-medium mb-6 px-2">
                {t('history.callsNearestAsha')}
              </p>

              {/* Countdown circle */}
              <div className="relative flex items-center justify-center mb-6">
                <motion.span
                  className="absolute w-28 h-28 rounded-full bg-red-500/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-lg border-2 border-white/40 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">{countdown}</span>
                </div>
              </div>

              <p className="text-xs font-bold text-red-200 uppercase tracking-widest mb-4">
                Auto-connecting in {countdown} seconds...
              </p>

              {/* Action buttons */}
              <div className="w-full space-y-2.5">
                <button
                  type="button"
                  onClick={triggerEmergencyCall}
                  className="w-full py-3.5 rounded-2xl bg-white text-red-700 font-black text-sm shadow-md hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 fill-current" />
                  <span>Call Emergency Now</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-2xl bg-white/10 text-red-200 font-semibold text-xs hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel SOS
                </button>
              </div>
            </>
          ) : (
            <div className="w-full py-4 flex flex-col items-center">
              {dispatchStatus === 'connecting' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 relative">
                    <PhoneCall className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-1">Connecting to ASHA Helpline...</h3>
                  <p className="text-xs text-red-200 mb-6">Dispatching live GPS location</p>
                  <div className="w-full bg-white/10 rounded-2xl p-3 text-left space-y-2 border border-white/10 mb-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-200">ASHA Worker:</span>
                      <span className="font-bold text-white">Smt. Lakshmi Devi</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-200">Phone:</span>
                      <span className="font-bold text-white">+91 98401 XXXXX</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-200">PHC Center:</span>
                      <span className="font-bold text-white">Kanchipuram Main PHC</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-1">Emergency Dispatch Active!</h3>
                  <p className="text-xs text-emerald-200 mb-6">ASHA worker & nearest ambulance notified.</p>
                  <div className="w-full bg-emerald-950/60 rounded-2xl p-4 text-left border border-emerald-500/30 mb-6 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Stay Calm & Safe</span>
                    </div>
                    <p className="text-emerald-100/90 leading-relaxed">
                      Smt. Lakshmi Devi (ASHA) is heading to your registered location. Help is on the way.
                    </p>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3 rounded-2xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition-colors cursor-pointer"
              >
                Close Emergency View
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencySosModal;
