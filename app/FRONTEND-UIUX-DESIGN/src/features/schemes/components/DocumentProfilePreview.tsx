/**
 * DocumentProfilePreview Component
 * Shows the structured profile extracted from the uploaded document.
 * Allows the user to correct any field before eligibility evaluation.
 * Unknown fields (null) are shown as "Not found" placeholders.
 * Fully localized with i18n.
 */
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Calendar,
  Tag,
  Edit3,
  Check,
  X,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, EditableProfile } from '../types/schemeTypes';

// ── Helpers ──────────────────────────────────────────────────────────────

function profileToEditable(profile: UserProfile): EditableProfile {
  return {
    name: profile.name ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    age: profile.age !== null ? String(profile.age) : '',
    gender: profile.gender ?? '',
    state: profile.state ?? '',
    district: profile.district ?? '',
    category: profile.category ?? '',
    annual_income: profile.annual_income !== null ? String(profile.annual_income) : '',
    occupation: profile.occupation ?? '',
    pregnancy_status:
      profile.pregnancy_status === true
        ? 'yes'
        : profile.pregnancy_status === false
        ? 'no'
        : 'unknown',
    child_age: profile.child_age !== null ? String(profile.child_age) : '',
  };
}

// ── Field row with inline edit ────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  value: string;
  fieldKey: keyof EditableProfile;
  icon: React.ReactNode;
  onSave: (key: keyof EditableProfile, value: string) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, fieldKey, icon, onSave }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const isEmpty = !value || value === 'unknown';
  const displayValue = isEmpty ? t('common.notFound') : value;

  const handleSave = () => {
    onSave(fieldKey, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10.5px] text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-1.5 mt-1">
            <input
              autoFocus
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
              className="flex-1 text-xs border border-violet-400 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-violet-500"
              aria-label={`${t('common.edit')} ${label}`}
            />
            <button
              type="button"
              onClick={handleSave}
              aria-label={t('common.save')}
              className="p-1 rounded-lg bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              aria-label={t('common.cancel')}
              className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <p
              className={`text-xs font-semibold ${
                isEmpty ? 'text-slate-400 italic' : 'text-slate-900'
              }`}
            >
              {displayValue}
            </p>
            <button
              type="button"
              onClick={() => { setDraft(value); setEditing(true); }}
              aria-label={`${t('common.edit')} ${label}`}
              className="p-1 text-slate-400 hover:text-violet-600 rounded-md hover:bg-violet-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

export interface DocumentProfilePreviewProps {
  profile: UserProfile;
  missingFields: string[];
  onConfirm: (editedProfile: EditableProfile) => void;
  onCancel: () => void;
}

export const DocumentProfilePreview: React.FC<DocumentProfilePreviewProps> = ({
  profile,
  missingFields,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [editable, setEditable] = useState<EditableProfile>(() => profileToEditable(profile));

  const handleSave = useCallback((key: keyof EditableProfile, value: string) => {
    setEditable((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fieldRows: Array<{
    label: string;
    key: keyof EditableProfile;
    icon: React.ReactNode;
  }> = [
    { label: t('schemes.profilePreview.name'), key: 'name', icon: <User className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.age'), key: 'age', icon: <Calendar className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.dob'), key: 'date_of_birth', icon: <Calendar className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.gender'), key: 'gender', icon: <User className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.state'), key: 'state', icon: <MapPin className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.district'), key: 'district', icon: <MapPin className="w-3.5 h-3.5 text-slate-600" /> },
    { label: t('schemes.profilePreview.category'), key: 'category', icon: <Tag className="w-3.5 h-3.5 text-slate-600" /> },
  ];

  // Only show a row if the field has a value OR it's in the missing_fields list
  const relevantFields = fieldRows.filter(
    (f) =>
      editable[f.key] ||
      missingFields.includes(f.key) ||
      missingFields.includes(f.label.toLowerCase().replace(/ /g, '_')),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-violet-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-900">{t('schemes.profilePreview.cardTitle')}</p>
            <p className="text-[10.5px] text-slate-500">
              {t('schemes.profilePreview.cardSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('common.close')}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Field list */}
      <div className="px-4 py-1">
        {relevantFields.map((f) => (
          <FieldRow
            key={f.key}
            label={f.label}
            value={editable[f.key] as string}
            fieldKey={f.key}
            icon={f.icon}
            onSave={handleSave}
          />
        ))}
      </div>

      {/* Missing fields notice */}
      {missingFields.length > 0 && (
        <div className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10.5px] font-bold text-amber-900">
                {t('schemes.eligibilitySummary.missingInformation')}
              </p>
              <p className="text-[10px] text-amber-800 mt-0.5">
                {missingFields
                  .slice(0, 4)
                  .map((f) => f.replace(/_/g, ' '))
                  .join(', ')}
                {missingFields.length > 4 ? ` and ${missingFields.length - 4} more` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm action */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => onConfirm(editable)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
        >
          {t('schemes.profilePreview.confirmAndCheck')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default DocumentProfilePreview;
