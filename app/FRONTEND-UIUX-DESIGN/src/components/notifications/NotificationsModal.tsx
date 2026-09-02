/**
 * NotificationsModal
 *
 * Extracted from AppRouter.tsx — renders the health alerts overlay.
 * Receives isOpen and onClose as props from AppRouter.
 * Visual design is exactly as it was inline.
 */
import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border border-slate-100 relative space-y-3">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-base text-slate-900">Health Alerts</h3>
          </div>
          <button
            type="button"
            id="notifications-close-btn"
            onClick={onClose}
            className="p-1 text-slate-400 cursor-pointer hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification items */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 space-y-1">
            <div className="flex items-center justify-between font-bold text-teal-900">
              <span>PMJAY Card Approved</span>
              <span className="text-[10px] text-teal-600 font-semibold">Today</span>
            </div>
            <p className="text-teal-800">Your family healthcare card up to ₹5 Lakhs is active.</p>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
            <div className="flex items-center justify-between font-bold text-blue-900">
              <span>PHC Immunization Camp</span>
              <span className="text-[10px] text-blue-600 font-semibold">Tomorrow</span>
            </div>
            <p className="text-blue-800">Free polio & BCG vaccination drive at Kanchipuram PHC.</p>
          </div>
        </div>

        <button
          type="button"
          id="notifications-mark-read-btn"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-2xl cursor-pointer"
        >
          Mark as Read
        </button>
      </div>
    </div>
  );
};

export default NotificationsModal;
