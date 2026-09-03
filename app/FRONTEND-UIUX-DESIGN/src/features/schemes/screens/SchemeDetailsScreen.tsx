/**
 * SchemeDetailsScreen Component
 * Detailed, comprehensive breakdown of a government scheme.
 * Includes Overview, Eligibility Criteria, Key Benefits, Documents Checklist, Step-by-Step Application, and Official Sources.
 * Fully localized with i18n.
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  Building,
  Clock,
  Landmark,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Scheme } from '../types/schemeTypes';
import { openExternalUrl, getActionLabel } from '../utils/schemeHelpers';
import { getLocalizedScheme } from '../data/localizedSchemes';
import { SchemeSourceList } from '../components/SchemeSourceList';

export interface SchemeDetailsScreenProps {
  scheme: Scheme;
  onBack: () => void;
}

export const SchemeDetailsScreen: React.FC<SchemeDetailsScreenProps> = ({
  scheme: rawScheme,
  onBack,
}) => {
  const { t, i18n } = useTranslation();
  const scheme = getLocalizedScheme(rawScheme, i18n.language);

  const ACTION_LABEL_KEYS: Record<string, string> = {
    apply: t('schemes.actions.apply', 'Apply Online'),
    eligibility: t('schemes.actions.eligibility', 'Check Eligibility'),
    access: t('schemes.actions.access', 'How to Access'),
    details: t('schemes.actions.details', 'View Details'),
  };
  const actionLabel = ACTION_LABEL_KEYS[scheme.actionType] || getActionLabel(scheme.actionType);

  const handleApplyClick = () => {
    if (scheme.applicationUrl) {
      openExternalUrl(scheme.applicationUrl);
    } else if (scheme.officialWebsite) {
      openExternalUrl(scheme.officialWebsite);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28 }}
      className="w-full bg-[#F8FAFC] min-h-full py-3 px-4 pb-4 space-y-4"
    >
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('schemes.details.backToSchemes')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>{t('schemes.details.backToSchemes')}</span>
        </button>

        {scheme.categoryLabel && (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {scheme.categoryLabel}
          </span>
        )}
      </div>

      {/* ── Header Banner Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-snug tracking-tight">
              {scheme.name}
            </h1>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {scheme.shortDescription}
            </p>
          </div>

          {scheme.tag && (
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                scheme.tagColor || 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
            >
              {scheme.tag}
            </span>
          )}
        </div>

        {/* Coverage Highlight */}
        {scheme.coverageHighlight && (
          <div className="p-3 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-center gap-2.5 text-xs font-bold text-teal-900">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>{scheme.coverageHighlight}</span>
          </div>
        )}
      </div>

      {/* ── Overview Section ─────────────────────────────────────────────── */}
      {scheme.description && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Landmark className="w-4 h-4 text-teal-600" />
            <span>{t('schemes.details.overview')}</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {scheme.description}
          </p>
        </div>
      )}

      {/* ── Who Can Benefit / Eligibility ────────────────────────────────── */}
      {scheme.eligibility && scheme.eligibility.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('schemes.details.eligibilityCriteria')}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">{t('common.verified')}</span>
          </div>

          <div className="space-y-2">
            {scheme.eligibility.map((criterion, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-150 text-xs text-slate-700 leading-snug"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Key Benefits ─────────────────────────────────────────────────── */}
      {scheme.benefits && scheme.benefits.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{t('schemes.details.keyBenefits')}</span>
          </div>

          <div className="space-y-2">
            {scheme.benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-50/40 border border-teal-100 text-xs text-slate-800 leading-snug"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Required Documents ───────────────────────────────────────────── */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{t('schemes.details.requiredDocs')}</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {scheme.documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step-by-Step How to Apply / Access ───────────────────────────── */}
      {scheme.howToApply && scheme.howToApply.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{t('schemes.details.stepByStep')}</span>
          </div>

          <div className="space-y-2.5">
            {scheme.howToApply.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5 shadow-2xs">
                  {i + 1}
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 leading-snug">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scheme.howToAccess && scheme.howToAccess.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Building className="w-4 h-4 text-teal-600" />
            <span>{t('schemes.details.howToApply')}</span>
          </div>

          <div className="space-y-2.5">
            {scheme.howToAccess.map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5 shadow-2xs">
                  {i + 1}
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 leading-snug">
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Verified Sources ────────────────────────────────────────────── */}
      {scheme.source && (
        <SchemeSourceList sources={[scheme.source]} />
      )}

      {/* ── Official Government Source & Actions ─────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <Landmark className="w-4 h-4 text-teal-600" />
          <span>{t('schemes.details.officialSources')}</span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t('schemes.eligibilitySummary.verifiedSourcesNotice')}
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          {scheme.officialWebsite && (
            <button
              type="button"
              onClick={() => openExternalUrl(scheme.officialWebsite)}
              className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{t('schemes.details.officialPortal')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}

          {(scheme.applicationUrl || scheme.actionType === 'apply') && (
            <button
              type="button"
              onClick={handleApplyClick}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0b7c72] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SchemeDetailsScreen;
