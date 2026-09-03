/**
 * SchemeSearchBar Component
 * Clean, mobile-first search field for government schemes.
 * Fully localized.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface SchemeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SchemeSearchBar: React.FC<SchemeSearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const { t } = useTranslation();
  const searchPlaceholder = placeholder || t('schemes.searchPlaceholder');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.08 }}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 px-3.5 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all"
    >
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={t('common.search')}
        className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.close')}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};

export default SchemeSearchBar;
