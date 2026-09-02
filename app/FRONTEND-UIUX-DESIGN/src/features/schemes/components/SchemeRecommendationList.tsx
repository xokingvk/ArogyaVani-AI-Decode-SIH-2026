/**
 * SchemeRecommendationList Component
 * Reusable list container for scheme results with loading skeleton, header, and clean empty states.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, SearchX, Layers } from 'lucide-react';
import { Scheme } from '../types/schemeTypes';
import { SchemeCard } from './SchemeCard';

export interface SchemeRecommendationListProps {
  schemes: Scheme[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  isRagResult?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
  onViewDetails: (scheme: Scheme) => void;
  onActionClick?: (scheme: Scheme) => void;
}

export const SchemeRecommendationList: React.FC<SchemeRecommendationListProps> = ({
  schemes,
  title,
  subtitle,
  isLoading = false,
  isRagResult = false,
  emptyTitle = 'No schemes found',
  emptySubtitle = 'Try searching with different keywords or selecting another category.',
  onViewDetails,
  onActionClick,
}) => {
  const displayTitle = title || (isRagResult ? 'Relevant Schemes for Your Question' : 'Explore Government Schemes');
  const displaySub = subtitle || (isRagResult
    ? 'These schemes may apply to you — review eligibility details before applying.'
    : 'Browse official healthcare, maternity, and welfare programs.');

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <div className="h-5 w-44 bg-slate-200 rounded-md animate-pulse" />
        <div className="h-3.5 w-64 bg-slate-100 rounded-md animate-pulse" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-full" />
                </div>
              </div>
              <div className="h-8 bg-slate-50 rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            {isRagResult ? (
              <Sparkles className="w-4 h-4 text-teal-600" />
            ) : (
              <Layers className="w-4 h-4 text-slate-700" />
            )}
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              {displayTitle}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {displaySub}
          </p>
        </div>

        <span className="text-xs font-bold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/70">
          {schemes.length} {schemes.length === 1 ? 'Scheme' : 'Schemes'}
        </span>
      </div>

      {/* Scheme Cards Grid / List */}
      {schemes.length > 0 ? (
        <div className="space-y-3">
          {schemes.map((scheme, index) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              index={index}
              isRecommended={isRagResult}
              onViewDetails={onViewDetails}
              onActionClick={onActionClick}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800">{emptyTitle}</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {emptySubtitle}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SchemeRecommendationList;
