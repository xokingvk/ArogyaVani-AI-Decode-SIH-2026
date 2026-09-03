/**
 * SchemeFilterChips Component
 * Horizontally scrollable category filter chips with smooth touch UX.
 * Fully localized with i18n.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SCHEME_CATEGORIES } from '../constants/schemeConstants';
import { SchemeCategory } from '../types/schemeTypes';

export interface SchemeFilterChipsProps {
  selectedCategory: SchemeCategory;
  onSelectCategory: (category: SchemeCategory) => void;
}

const CATEGORY_I18N_KEYS: Record<string, string> = {
  all: 'schemes.categories.all',
  'women-maternity': 'schemes.categories.womenMaternity',
  children: 'schemes.categories.children',
  insurance: 'schemes.categories.insurance',
  'family-health': 'schemes.categories.familyHealth',
  preventive: 'schemes.categories.preventive',
  'state-schemes': 'schemes.categories.stateSchemes',
  other: 'schemes.categories.other',
};

export const SchemeFilterChips: React.FC<SchemeFilterChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {SCHEME_CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const i18nKey = CATEGORY_I18N_KEYS[cat.id];
        const label = i18nKey ? t(i18nKey) : cat.label;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            aria-pressed={isSelected}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#0D9488] text-white border-teal-700 shadow-xs scale-[1.02]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
};

export default SchemeFilterChips;
