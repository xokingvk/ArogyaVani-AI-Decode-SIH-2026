/**
 * EligibilitySummary Component
 * Full eligibility result section rendered after document processing.
 * Shows: AI summary → profile fields → eligibility result cards → sources → missing info notice.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  X,
  Info,
  FileText,
} from 'lucide-react';
import {
  DocumentEligibilityResponse,
  EligibilityResult,
  EligibilityStatus,
} from '../types/schemeTypes';
import { Scheme } from '../types/schemeTypes';
import { GOVERNMENT_SCHEMES_DATA } from '../data/schemes';
import { EligibilityResultCard } from './EligibilityResultCard';

// ── Sort eligibility results ──────────────────────────────────────────────

const STATUS_ORDER: Record<EligibilityStatus, number> = {
  potentially_eligible: 0,
  relevant: 1,
  needs_more_information: 2,
  unable_to_determine: 3,
  not_currently_eligible: 4,
};

function sortResults(results: EligibilityResult[]): EligibilityResult[] {
  return [...results].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      b.relevanceScore - a.relevanceScore,
  );
}

// ── Profile summary ───────────────────────────────────────────────────────

interface ProfileSummaryRowProps {
  label: string;
  value: string | null;
}

const ProfileSummaryRow: React.FC<ProfileSummaryRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-[10.5px] text-slate-500 font-semibold">{label}</span>
    <span
      className={`text-xs font-semibold ${
        value ? 'text-slate-900' : 'text-slate-400 italic'
      }`}
    >
      {value || 'Not found'}
    </span>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

export interface EligibilitySummaryProps {
  data: DocumentEligibilityResponse;
  onClear: () => void;
  onViewSchemeDetails: (scheme: Scheme) => void;
}

export const EligibilitySummary: React.FC<EligibilitySummaryProps> = ({
  data,
  onClear,
  onViewSchemeDetails,
}) => {
  const { profile, summary, schemes, sources, missing_fields } = data;
  const sortedSchemes = sortResults(schemes);

  // Find curated Scheme data by schemeId for each result
  const getSchemeData = (schemeId: string): Scheme | undefined =>
    GOVERNMENT_SCHEMES_DATA.find((s) => s.id.toLowerCase() === schemeId.toLowerCase());

  // Build human-readable profile display
  const profileRows: Array<{ label: string; value: string | null }> = [
    { label: 'Name', value: profile.name },
    {
      label: 'Age',
      value:
        profile.age !== null
          ? String(profile.age)
          : profile.date_of_birth || null,
    },
    { label: 'Gender', value: profile.gender },
    { label: 'State', value: profile.state },
    { label: 'District', value: profile.district },
    { label: 'Category', value: profile.category },
  ].filter((row) => row.value !== null || missing_fields.includes(row.label.toLowerCase()));

  const actionableSchemes = sortedSchemes.filter(
    (s) => s.status !== 'not_currently_eligible',
  );
  const notEligible = sortedSchemes.filter(
    (s) => s.status === 'not_currently_eligible',
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-3.5"
      >
        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-4 space-y-3 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">
                  Arogya AI Eligibility Assistant
                </p>
                <p className="text-[10.5px] text-slate-500">
                  Based on information from your document
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear eligibility results"
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Summary */}
          {summary && (
            <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
          )}

          {/* Profile summary */}
          {profileRows.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
              <p className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide mb-2">
                Your Information
              </p>
              {profileRows.map((row) => (
                <ProfileSummaryRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          )}
        </div>

        {/* ── Actionable eligibility results ── */}
        {actionableSchemes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-xs font-extrabold text-slate-900">
                Relevant Schemes for Your Profile
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold border border-violet-200">
                {actionableSchemes.length}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 px-1">
              Review eligibility details before applying. Final eligibility must be verified officially.
            </p>
            {actionableSchemes.map((result, idx) => (
              <EligibilityResultCard
                key={result.schemeId}
                result={result}
                schemeData={getSchemeData(result.schemeId)}
                index={idx}
                onViewDetails={onViewSchemeDetails}
              />
            ))}
          </div>
        )}

        {/* ── Not currently eligible ── */}
        {notEligible.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 px-1">Not Currently Applicable</h3>
            {notEligible.map((result, idx) => (
              <EligibilityResultCard
                key={result.schemeId}
                result={result}
                schemeData={getSchemeData(result.schemeId)}
                index={idx}
                onViewDetails={onViewSchemeDetails}
              />
            ))}
          </div>
        )}

        {/* ── No results found ── */}
        {schemes.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              Insufficient information found
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We couldn't find enough information from this document to identify relevant schemes.
              Try uploading a different document or use the voice assistant to ask a specific question.
            </p>
          </div>
        )}

        {/* ── Missing information notice ── */}
        {missing_fields.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  More information may improve results
                </p>
                <p className="text-[10.5px] text-amber-800 mt-1">
                  The following could not be found in your document:
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {missing_fields.map((field) => (
                    <span
                      key={field}
                      className="text-[10px] px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-full text-amber-800 font-semibold"
                    >
                      {field.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-amber-700 mt-2">
                  Try asking the voice assistant about specific schemes if you know which one you need.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Verified document sources ── */}
        {sources.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Document Sources</span>
            </div>
            {sources.map((src, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-semibold text-slate-700 truncate">{src.source}</p>
                  <p className="text-[10px] text-slate-500">Page {src.page}</p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-slate-400">
              Informational navigation tool — verify eligibility through official channels.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EligibilitySummary;
