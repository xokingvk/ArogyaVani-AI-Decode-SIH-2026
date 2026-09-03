/**
 * SchemeCard Component
 * Polished, information-dense government scheme card.
 * Supports differentiated actions (Apply Online, Check Eligibility, How to Access, View Details).
 * Fully localized with i18n across English, Tamil, Hindi, and Telugu.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Heart,
  Baby,
  Shield,
  ShieldCheck,
  Wheat,
  Home,
  Syringe,
  ExternalLink,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Scheme } from '../types/schemeTypes';
import { getActionLabel, openExternalUrl } from '../utils/schemeHelpers';
import { getLocalizedScheme } from '../data/localizedSchemes';

export interface SchemeCardProps {
  scheme: Scheme;
  onViewDetails: (scheme: Scheme) => void;
  onActionClick?: (scheme: Scheme) => void;
  isRecommended?: boolean;
  matchReason?: string;
  index?: number;
}

const getSchemeIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Heart':
      return <Heart className="w-5 h-5 text-rose-600" />;
    case 'Baby':
      return <Baby className="w-5 h-5 text-pink-600" />;
    case 'ShieldCheck':
      return <ShieldCheck className="w-5 h-5 text-purple-600" />;
    case 'Shield':
      return <Shield className="w-5 h-5 text-indigo-600" />;
    case 'Wheat':
      return <Wheat className="w-5 h-5 text-amber-600" />;
    case 'Home':
      return <Home className="w-5 h-5 text-sky-600" />;
    case 'Syringe':
      return <Syringe className="w-5 h-5 text-blue-600" />;
    default:
      return <Shield className="w-5 h-5 text-teal-600" />;
  }
};

const getIconBackground = (iconName?: string) => {
  switch (iconName) {
    case 'Heart':
      return 'bg-rose-50 border-rose-100';
    case 'Baby':
      return 'bg-pink-50 border-pink-100';
    case 'ShieldCheck':
      return 'bg-purple-50 border-purple-100';
    case 'Shield':
      return 'bg-indigo-50 border-indigo-100';
    case 'Wheat':
      return 'bg-amber-50 border-amber-100';
    case 'Home':
      return 'bg-sky-50 border-sky-100';
    case 'Syringe':
      return 'bg-blue-50 border-blue-100';
    default:
      return 'bg-teal-50 border-teal-100';
  }
};

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme: rawScheme,
  onViewDetails,
  onActionClick,
  isRecommended = false,
  matchReason,
  index = 0,
}) => {
  const { t, i18n } = useTranslation();
  const scheme = getLocalizedScheme(rawScheme, i18n.language);

  const handlePrimaryAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onActionClick) {
      onActionClick(scheme);
      return;
    }

    if (scheme.actionType === 'apply' && scheme.applicationUrl) {
      openExternalUrl(scheme.applicationUrl);
    } else if (scheme.actionType === 'eligibility' && scheme.officialWebsite) {
      openExternalUrl(scheme.officialWebsite);
    } else {
      onViewDetails(scheme);
    }
  };

  const ACTION_LABEL_KEYS: Record<string, string> = {
    apply: t('schemes.actions.apply'),
    eligibility: t('schemes.actions.eligibility'),
    access: t('schemes.actions.access'),
    details: t('schemes.actions.details'),
  };
  const actionLabel = ACTION_LABEL_KEYS[scheme.actionType] || getActionLabel(scheme.actionType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.3) }}
      onClick={() => onViewDetails(scheme)}
      className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer ${
        isRecommended
          ? 'border-teal-300 ring-1 ring-teal-400/20 bg-gradient-to-b from-teal-50/20 to-white'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Recommended / Relevance Banner */}
      {isRecommended && (
        <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/60 text-[11px] font-bold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>{t('schemes.card.relevantToQuery')}</span>
        </div>
      )}

      {/* Header with Icon, Title, and Tag */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getIconBackground(
            scheme.iconName
          )}`}
        >
          {getSchemeIcon(scheme.iconName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug tracking-tight">
              {scheme.name}
            </h3>
            {scheme.tag && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  scheme.tagColor || 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {scheme.tag}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
            {scheme.shortDescription}
          </p>
        </div>
      </div>

      {/* Specific match reason for future RAG answers */}
      {matchReason && (
        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-150 text-[11px] text-slate-700 leading-snug">
          <span className="font-semibold text-slate-900">{t('schemes.card.whyMatches')}: </span>
          {matchReason}
        </div>
      )}

      {/* Key Benefit Highlight */}
      {scheme.coverageHighlight && (
        <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50/80 border border-slate-150 text-[11.5px] font-semibold text-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="truncate">{scheme.coverageHighlight}</span>
        </div>
      )}

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(scheme);
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{t('schemes.actions.details')}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={handlePrimaryAction}
          className="flex-1 py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0b7c72] text-white text-xs font-bold text-center transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>{actionLabel}</span>
          {(scheme.actionType === 'apply' || scheme.actionType === 'eligibility') && (
            <ExternalLink className="w-3 h-3 opacity-90" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default SchemeCard;
