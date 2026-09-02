/**
 * EligibilitySummary Component
 * Full eligibility result section rendered after document processing or profile review.
 * Strictly separates:
 *  1. Relevant / Potentially Eligible Schemes
 *  2. More Information Needed
 *  3. Not Currently Applicable
 *  4. Missing information checklist
 *  5. Grounded source document citations
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  X,
  Info,
  FileText,
  HelpCircle,
  Ban,
} from 'lucide-react';
import { DocumentEligibilityResponse, Scheme } from '../types/schemeTypes';
import { GOVERNMENT_SCHEMES_DATA } from '../data/schemes';
import { EligibilityResultCard } from './EligibilityResultCard';

// ── Profile summary row ────────────────────────────────────────────────────

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

  // Find curated Scheme data by schemeId for each result
  const getSchemeData = (schemeId: string): Scheme | undefined =>
    GOVERNMENT_SCHEMES_DATA.find((s) => s.id.toLowerCase() === schemeId.toLowerCase());

  // 1. Relevant / Potentially eligible schemes (ONLY these appear in main section)
  const eligibleOrRelevantSchemes = schemes.filter(
    (s) => s.status === 'potentially_eligible' || s.status === 'relevant'
  );

  // 2. Schemes needing additional information
  const needsMoreInfoSchemes = schemes.filter(
    (s) => s.status === 'needs_more_information'
  );

  // 3. Not currently eligible schemes
  const notEligibleSchemes = schemes.filter(
    (s) => s.status === 'not_currently_eligible'
  );

  // Profile rows display
  const profileRows: Array<{ label: string; value: string | null }> = [
    { label: 'Name', value: profile.name },
    {
      label: 'Age',
      value: profile.age !== null ? `${profile.age} years` : profile.date_of_birth || null,
    },
    { label: 'Gender', value: profile.gender },
    { label: 'State', value: profile.state },
    { label: 'District', value: profile.district },
    { label: 'Category', value: profile.category },
    {
      label: 'Annual Income',
      value: profile.annual_income !== null ? `₹${profile.annual_income.toLocaleString('en-IN')}` : null,
    },
    {
      label: 'Pregnancy Status',
      value:
        profile.pregnancy_status === true
          ? 'Yes (Active Pregnancy)'
          : profile.pregnancy_status === false
          ? 'No'
          : null,
    },
  ].filter((row) => row.value !== null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        {/* ── 1. Header Card ── */}
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
                  Document-grounded scheme discovery
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
              <p className="text-[10.5px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Your Information
              </p>
              {profileRows.map((row) => (
                <ProfileSummaryRow key={row.label} label={row.label} value={row.value} />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. Relevant / Potentially Eligible Schemes ── */}
        {eligibleOrRelevantSchemes.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Relevant / Potentially Eligible Schemes
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
                  {eligibleOrRelevantSchemes.length}
                </span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-500 px-1">
              These schemes match criteria found in your profile. Final eligibility must be verified officially.
            </p>
            {eligibleOrRelevantSchemes.map((result, idx) => (
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

        {/* ── 3. More Information Needed ── */}
        {needsMoreInfoSchemes.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 px-1">
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-800">
                More Information Needed
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                {needsMoreInfoSchemes.length}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 px-1">
              Key criteria are missing from your document to assess eligibility for these schemes.
            </p>
            {needsMoreInfoSchemes.map((result, idx) => (
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

        {/* ── 4. Not Currently Applicable ── */}
        {notEligibleSchemes.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 px-1">
              <Ban className="w-3.5 h-3.5 text-slate-400" />
              <h3 className="text-xs font-bold text-slate-600">
                Not Currently Applicable
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                {notEligibleSchemes.length}
              </span>
            </div>
            {notEligibleSchemes.map((result, idx) => (
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

        {/* ── 5. Missing Fields Checklist ── */}
        {missing_fields.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Unverified Profile Attributes
                </p>
                <p className="text-[10.5px] text-amber-800 mt-0.5">
                  The following could not be verified from your document:
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {missing_fields.map((field) => (
                    <span
                      key={field}
                      className="text-[10px] px-2 py-0.5 bg-amber-100/90 border border-amber-200 rounded-full text-amber-800 font-semibold"
                    >
                      {field.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. Verified Document Sources ── */}
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
              Informational navigation tool — verify official eligibility guidelines before enrollment.
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EligibilitySummary;
