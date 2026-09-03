import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  User,
  Heart,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  EmergencyContact,
  getEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../../services/emergencyContactService';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactsUpdated?: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  onContactsUpdated,
}) => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await getEmergencyContacts();
    setContacts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      setIsEditing(false);
      setEditingId(null);
      setName('');
      setRelationship('');
      setPhone('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  const handleStartAdd = () => {
    if (contacts.length >= 3) {
      setErrorMessage(t('emergency.maxContactsReached', 'Maximum 3 emergency contacts allowed.'));
      return;
    }
    setEditingId(null);
    setName('');
    setRelationship('');
    setPhone('');
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleStartEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setErrorMessage('');
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setRelationship('');
    setPhone('');
    setErrorMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedRel = relationship.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedRel || !trimmedPhone) {
      setErrorMessage(t('emergency.allFieldsRequired', 'All fields are required.'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    if (editingId) {
      const res = await updateEmergencyContact(editingId, {
        name: trimmedName,
        relationship: trimmedRel,
        phone: trimmedPhone,
      });
      setIsSaving(false);
      if (res.success) {
        setSuccessMessage(t('emergency.contactUpdated', 'Contact updated successfully.'));
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsEditing(false);
        setEditingId(null);
        await loadContacts();
        if (onContactsUpdated) onContactsUpdated();
      } else {
        setErrorMessage(res.error || t('emergency.saveFailed', 'Failed to save contact.'));
      }
    } else {
      const res = await createEmergencyContact({
        name: trimmedName,
        relationship: trimmedRel,
        phone: trimmedPhone,
      });
      setIsSaving(false);
      if (res.success) {
        setSuccessMessage(t('emergency.contactSaved', 'Contact saved successfully.'));
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsEditing(false);
        await loadContacts();
        if (onContactsUpdated) onContactsUpdated();
      } else {
        setErrorMessage(res.error || t('emergency.saveFailed', 'Failed to save contact.'));
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteEmergencyContact(id);
    if (res.success) {
      setSuccessMessage(t('emergency.contactDeleted', 'Contact deleted.'));
      setTimeout(() => setSuccessMessage(''), 3000);
      await loadContacts();
      if (onContactsUpdated) onContactsUpdated();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <Heart className="w-5 h-5 fill-rose-100" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight leading-none">
                  {t('emergency.contactsTitle', 'Emergency Contacts')}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {t('emergency.contactsSubtitle', 'Trusted family & emergency helpers')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback banners */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </motion.div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-3 py-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('emergency.name', 'Full Name')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('emergency.namePlaceholder', 'e.g. Lakshmi Devi')}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('emergency.relationship', 'Relationship')}
                  </label>
                  <div className="relative">
                    <Heart className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder={t('emergency.relPlaceholder', 'e.g. Mother / Spouse / Brother')}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('emergency.phone', 'Phone Number')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('emergency.phonePlaceholder', 'e.g. +91 98765 43210')}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? t('emergency.saving', 'Saving...') : t('emergency.save', 'Save Contact')}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {t('emergency.cancel', 'Cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {isLoading ? (
                  <div className="space-y-2 py-4">
                    <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                    <div className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="py-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                      <Phone className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      {t('emergency.noContactsYet', 'No emergency contacts added yet.')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                      {t('emergency.noContactsDesc', 'Add trusted contacts so you can call them in one tap during an emergency.')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-slate-900 truncate">
                              {contact.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                              {contact.relationship}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                            {contact.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(contact)}
                            aria-label={t('emergency.editContact', 'Edit Contact')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(contact.id)}
                            aria-label={t('emergency.deleteContact', 'Delete Contact')}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {contacts.length < 3 && (
                  <button
                    type="button"
                    onClick={handleStartAdd}
                    className="w-full py-2.5 mt-2 rounded-2xl border-2 border-dashed border-rose-300 hover:border-rose-400 bg-rose-50/50 hover:bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('emergency.addContact', 'Add Emergency Contact')}</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Privacy footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('emergency.privacyNotice', 'Stored privately in your secure profile')}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmergencyContactsModal;
