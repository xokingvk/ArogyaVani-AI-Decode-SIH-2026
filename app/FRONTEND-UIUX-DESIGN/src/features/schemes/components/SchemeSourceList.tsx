/**
 * SchemeSourceList Component
 * Displays verified source documents and official citations.
 */
import React from 'react';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { SchemeSource } from '../types/schemeTypes';
import { openExternalUrl } from '../utils/schemeHelpers';

export interface SchemeSourceListProps {
  sources: SchemeSource[];
}

export const SchemeSourceList: React.FC<SchemeSourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <h4 className="text-xs font-bold text-slate-800">Verified Official Sources</h4>
      </div>

      <div className="space-y-2">
        {sources.map((src, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">{src.title}</p>
                {src.documentName && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {src.documentName} {src.page ? `• Page ${src.page}` : ''}
                  </p>
                )}
              </div>
            </div>

            {src.url && (
              <button
                type="button"
                onClick={() => openExternalUrl(src.url)}
                className="text-teal-700 hover:text-teal-800 p-1 flex items-center gap-1 font-semibold text-[11px]"
              >
                <span>View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemeSourceList;
