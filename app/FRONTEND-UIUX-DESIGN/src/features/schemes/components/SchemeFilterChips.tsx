/**
 * SchemeFilterChips Component
 * Horizontally scrollable category filter chips with smooth touch UX.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { SCHEME_CATEGORIES } from '../constants/schemeConstants';
import { SchemeCategory } from '../types/schemeTypes';

export interface SchemeFilterChipsProps {
  selectedCategory: SchemeCategory;
  onSelectCategory: (category: SchemeCategory) => void;
}

export const SchemeFilterChips: React.FC<SchemeFilterChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
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
            {cat.label}
          </button>
        );
      })}
    </motion.div>
  );
};

export default SchemeFilterChips;
