import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  X,
  ShieldAlert,
  Plus,
  AlertTriangle,
  Heart,
  Phone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  EmergencyContact,
  getEmergencyContacts,
  formatPhoneForCall,
} from '../../services/emergencyContactService';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContactSetup?: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  onOpenContactSetup,
}) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getEmergencyContacts().then((data) => {
        setContacts(data);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  const handleCall = (phone: string) => {
    const sanitized = formatPhoneForCall(phone);
    if (sanitized) {
      window.location.href = `tel:${sanitized}`;
    }
  };

  const handleOpenSetup = () => {
    onClose();
    if (onOpenContactSetup) {
      onOpenContactSetup();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          className="w-full max-w-sm bg-gradient-to-b from-[#991B1B] via-[#7F1D1D] to-[#450A0A] rounded-3xl p-5 sm:p-6 text-white shadow-2xl border border-red-500/30 relative overflow-hidden flex flex-col items-center text-center max-h-[90vh]"
        >
          {/* Glowing red accent */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute top-4 right-4 p-2 text-red-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Icon */}
          <div className="w-13 h-13 rounded-2xl bg-red-600/40 border border-red-400/30 flex items-center justify-center mb-2.5 text-red-200">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mb-0.5">
            {t('history.emergencySos')}
          </h2>
          <p className="text-xs text-red-200 font-medium mb-4 px-2">
            {t('emergency.tapToCallDesc', 'Tap below to immediately call your emergency contacts or national helpline.')}
          </p>

          {/* Contacts Container */}
          <div className="w-full overflow-y-auto space-y-2.5 max-h-[48vh] pr-0.5 my-1 text-left">
            {isLoading ? (
              <div className="space-y-2 py-4">
                <div className="h-14 rounded-2xl bg-white/10 animate-pulse" />
                <div className="h-14 rounded-2xl bg-white/10 animate-pulse" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 my-2">
                <Heart className="w-8 h-8 text-red-300 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-white mb-1">
                  {t('emergency.noContactsYet', 'No emergency contacts added yet.')}
                </p>
                <p className="text-[11px] text-red-200 mb-3">
                  {t('emergency.addContactsPrompt', 'Add trusted contacts so you can reach family in an emergency.')}
                </p>
                <button
                  type="button"
                  onClick={handleOpenSetup}
                  className="w-full py-2.5 px-3 rounded-xl bg-white text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('emergency.addContact', 'Add Emergency Contact')}</span>
                </button>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">
                        {contact.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/40 text-red-100 border border-red-400/30 shrink-0">
                        {contact.relationship}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-200 mt-0.5 truncate font-medium">
                      {contact.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCall(contact.phone)}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-red-50 text-red-700 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5 fill-current" />
                    <span>{t('emergency.callPrefix', 'Call')} {contact.relationship}</span>
                  </button>
                </div>
              ))
            )}

            {/* National Ambulance 108 Helpline */}
            <div className="bg-red-950/70 border border-red-400/30 rounded-2xl p-3 flex items-center justify-between gap-2.5">
              <div>
                <span className="text-xs font-black text-white">
                  {t('emergency.ambulanceTitle', 'National Ambulance')}
                </span>
                <p className="text-[10.5px] text-red-200 font-medium">
                  {t('emergency.ambulanceSub', 'Toll-free 24x7 medical emergency')} (108)
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCall('108')}
                className="py-2 px-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>{t('emergency.callPrefix', 'Call')} 108</span>
              </button>
            </div>
          </div>

          {/* Footer Warning & Setup Link */}
          <div className="w-full mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-red-200">
            <div className="flex items-center gap-1 text-left">
              <AlertTriangle className="w-3.5 h-3.5 text-red-300 shrink-0" />
              <span className="text-[10px]">{t('emergency.urgentNotice', 'Stay calm. Help will connect immediately.')}</span>
            </div>
            {contacts.length > 0 && onOpenContactSetup && (
              <button
                type="button"
                onClick={handleOpenSetup}
                className="text-[11px] text-white font-bold underline hover:text-red-100 cursor-pointer shrink-0 ml-2"
              >
                {t('emergency.manageContacts', 'Manage')}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencySosModal;
