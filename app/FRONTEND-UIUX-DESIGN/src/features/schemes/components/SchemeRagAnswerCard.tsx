/**
 * SchemeRagAnswerCard Component
 * Reusable AI answer presentation card for RAG and General Voice responses.
 * Cleanly displays parsed visual answer (headings, bullets, bold), curated official links,
 * source grounding badges, and audio playback.
 * Fully localized with i18n.
 */
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, BookOpen, X, HeartPulse, ExternalLink, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SchemeRagResult } from '../types/schemeTypes';
import { GOVERNMENT_SCHEMES_DATA } from '../data/schemes';

export interface SchemeRagAnswerCardProps {
  ragResult: SchemeRagResult;
  onClear?: () => void;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
}

// ── Inline Text Formatter (Bold parsing) ────────────────────────────────────

function renderInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ── Block Structure Parser ──────────────────────────────────────────────────

interface FormattedBlock {
  type: 'heading' | 'bullet' | 'numbered' | 'paragraph';
  content: string;
  num?: string;
}

function parseAnswerToBlocks(text: string): FormattedBlock[] {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks: FormattedBlock[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headingMatch = line.match(/^#{1,6}\s*(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', content: headingMatch[1].replace(/\*\*/g, '').trim() });
      continue;
    }

    const bulletMatch = line.match(/^[-*+•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', content: bulletMatch[1].trim() });
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      blocks.push({ type: 'numbered', num: numberedMatch[1], content: numberedMatch[2].trim() });
      continue;
    }

    blocks.push({ type: 'paragraph', content: line });
  }

  return blocks;
}

export const SchemeRagAnswerCard: React.FC<SchemeRagAnswerCardProps> = ({
  ragResult,
  onClear,
  onPlayAudio,
  isPlayingAudio = false,
}) => {
  const { t } = useTranslation();
  const isSchemeRag = ragResult.mode === 'scheme_rag';

  const blocks = useMemo(() => parseAnswerToBlocks(ragResult.answer), [ragResult.answer]);

  const curatedOfficialPortals = useMemo(() => {
    if (!isSchemeRag || !ragResult.schemes || ragResult.schemes.length === 0) {
      return [];
    }
    const matchedIds = new Set(ragResult.schemes.map((s) => s.schemeId.toLowerCase()));
    return GOVERNMENT_SCHEMES_DATA.filter(
      (scheme) => matchedIds.has(scheme.id.toLowerCase()) && (scheme.officialWebsite || scheme.applicationUrl)
    );
  }, [isSchemeRag, ragResult.schemes]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl border ${
        isSchemeRag ? 'border-teal-200' : 'border-blue-200'
      } shadow-sm p-4 text-slate-800 space-y-3.5 relative overflow-hidden`}
    >
      {/* Top Accent Line */}
      <div
        className={`absolute inset-x-0 top-0 h-1 ${
          isSchemeRag
            ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600'
            : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500'
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg ${
              isSchemeRag
                ? 'bg-teal-50 border border-teal-200 text-teal-600'
                : 'bg-blue-50 border border-blue-200 text-blue-600'
            } flex items-center justify-center`}
          >
            {isSchemeRag ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <HeartPulse className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900">
                {t('schemes.ragCard.aiGuidance')}
              </span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                  isSchemeRag
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {t('common.verified')}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500">
              {t('schemes.ragCard.groundedInDocs')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {ragResult.audioBase64 && onPlayAudio && (
            <button
              type="button"
              onClick={onPlayAudio}
              className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-pulse text-teal-600' : ''}`} />
              <span className="text-[11px]">{isPlayingAudio ? t('schemes.ragCard.reading') : t('schemes.ragCard.listen')}</span>
            </button>
          )}

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label={t('common.close')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Query echo */}
      {ragResult.question && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 text-xs">
          <span className="font-bold text-slate-700">{t('schemes.ragCard.youAsked')} </span>
          <span className="italic text-slate-600">"{ragResult.question}"</span>
        </div>
      )}

      {/* Structured Visual Answer Body */}
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed font-normal">
        {blocks.map((block, idx) => {
          if (block.type === 'heading') {
            return (
              <h4 key={idx} className="text-xs font-extrabold text-slate-900 pt-1.5 tracking-tight">
                {block.content}
              </h4>
            );
          }
          if (block.type === 'bullet') {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span className="flex-1">{renderInlineText(block.content)}</span>
              </div>
            );
          }
          if (block.type === 'numbered') {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {block.num}
                </span>
                <span className="flex-1">{renderInlineText(block.content)}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="text-slate-700">
              {renderInlineText(block.content)}
            </p>
          );
        })}
      </div>

      {/* Curated Official Portals */}
      {isSchemeRag && curatedOfficialPortals.length > 0 && (
        <div className="pt-2.5 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('schemes.details.officialSources')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {curatedOfficialPortals.map((scheme) => {
              const targetUrl = scheme.officialWebsite || scheme.applicationUrl;
              if (!targetUrl) return null;

              return (
                <a
                  key={scheme.id}
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-left group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-teal-900">
                      {scheme.name}
                    </p>
                    <p className="text-[10.5px] text-slate-500 truncate">
                      {targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Grounded Sources Footer */}
      {isSchemeRag && ragResult.sources && ragResult.sources.length > 0 && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {ragResult.sources.length} {t('schemes.details.verifiedSources')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{t('schemes.eligibilitySummary.verifiedSourcesNotice')}</span>
        </div>
      )}
    </motion.div>
  );
};

export default SchemeRagAnswerCard;
