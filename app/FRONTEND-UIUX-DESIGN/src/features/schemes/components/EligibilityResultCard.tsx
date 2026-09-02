/**
 * EligibilityResultCard Component
 * Displays a single scheme eligibility evaluation with status badge,
 * matched/missing criteria, reason, and curated official links.
 * Reuses existing SchemeCard layout conventions.
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  HelpCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { EligibilityResult, EligibilityStatus } from '../types/schemeTypes';
import { Scheme } from '../types/schemeTypes';
import { openExternalUrl } from '../utils/schemeHelpers';

// ── Status helpers ────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

function getStatusConfig(status: EligibilityStatus): StatusConfig {
  switch (status) {
    case 'potentially_eligible':
      return {
        label: 'Potentially Eligible',
        className: 'bg-teal-50 text-teal-800 border-teal-200',
        icon: <CheckCircle2 className="w-3 h-3 text-teal-600" />,
      };
    case 'relevant':
      return {
        label: 'Relevant',
        className: 'bg-blue-50 text-blue-800 border-blue-200',
        icon: <AlertCircle className="w-3 h-3 text-blue-500" />,
      };
    case 'needs_more_information':
      return {
        label: 'More Info Needed',
        className: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <HelpCircle className="w-3 h-3 text-amber-500" />,
      };
    case 'not_currently_eligible':
      return {
        label: 'Not Currently Eligible',
        className: 'bg-red-50 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3 text-red-500" />,
      };
    case 'unable_to_determine':
    default:
      return {
        label: 'Unable to Determine',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: <HelpCircle className="w-3 h-3 text-slate-500" />,
      };
  }
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface EligibilityResultCardProps {
  result: EligibilityResult;
  schemeData?: Scheme; // Curated metadata for official links and details
  index?: number;
  onViewDetails?: (scheme: Scheme) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export const EligibilityResultCard: React.FC<EligibilityResultCardProps> = ({
  result,
  schemeData,
  index = 0,
  onViewDetails,
}) => {
  const statusConfig = getStatusConfig(result.status);
  const officialUrl = schemeData?.officialWebsite || schemeData?.applicationUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl border shadow-sm p-4 space-y-3 ${
        result.status === 'potentially_eligible'
          ? 'border-teal-200 ring-1 ring-teal-400/15'
          : result.status === 'not_currently_eligible'
          ? 'border-red-100'
          : 'border-slate-200'
      }`}
    >
      {/* Header: Name + Status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-slate-900 leading-snug">{result.schemeName}</p>
          {schemeData?.shortDescription && (
            <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2">
              {schemeData.shortDescription}
            </p>
          )}
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold shrink-0 ${statusConfig.className}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Reason */}
      {result.reason && (
        <p className="text-xs text-slate-600 leading-relaxed">{result.reason}</p>
      )}

      {/* Matched criteria */}
      {result.matchedCriteria.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide">
            Matching criteria
          </p>
          {result.matchedCriteria.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0 mt-0.5" />
              <span className="text-[10.5px] text-slate-600">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Missing criteria */}
      {result.missingCriteria.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wide">
            Information needed
          </p>
          {result.missingCriteria.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <HelpCircle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-[10.5px] text-slate-600">{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {schemeData && onViewDetails && (
          <button
            type="button"
            onClick={() => onViewDetails(schemeData)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        {officialUrl && (
          <button
            type="button"
            onClick={() => openExternalUrl(officialUrl)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors"
          >
            {schemeData?.actionType === 'apply' ? 'Apply Online' : 'Official Website'}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EligibilityResultCard;
