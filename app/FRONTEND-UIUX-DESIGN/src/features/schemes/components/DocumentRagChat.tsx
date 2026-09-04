/**
 * DocumentRagChat Component
 * "Ask About This Document" section rendered below document eligibility summary.
 * Allows citizens to ask questions grounded strictly in their uploaded document.
 * Displays clean plain-text answers with source page citations.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  queryDocumentRag,
  DocumentRagSource,
} from '../../../services/documentRagService';

export interface DocumentRagChatProps {
  documentSessionId: string | null;
  fileName?: string;
  onClear?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What information is in this document?',
  'What benefits are mentioned?',
  'What documents are required?',
  'What income is mentioned?',
  'What is the eligibility information?',
];

export const DocumentRagChat: React.FC<DocumentRagChatProps> = ({
  documentSessionId,
  fileName,
  onClear,
}) => {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState<string>('');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<DocumentRagSource[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const handleAsk = useCallback(
    async (qText?: string) => {
      const q = (qText || question).trim();
      if (!q || !documentSessionId || isQuerying) return;

      setIsQuerying(true);
      setErrorMessage(null);
      setIsSessionExpired(false);

      try {
        const res = await queryDocumentRag(
          documentSessionId,
          q,
          i18n.language || 'en-IN',
        );

        if (!res.success) {
          if (res.session_expired) {
            setIsSessionExpired(true);
            setErrorMessage(
              t(
                'schemes.documentRag.sessionExpired',
                'Document session expired. Please upload the document again.',
              ),
            );
          } else {
            setErrorMessage(
              res.error ||
                t(
                  'schemes.documentRag.errGeneral',
                  'Unable to answer from this document.',
                ),
            );
          }
          return;
        }

        setAnswer(res.answer || null);
        setSources(res.sources || []);
      } catch {
        setErrorMessage(
          t(
            'schemes.documentRag.errGeneral',
            'Unable to answer from this document.',
          ),
        );
      } finally {
        setIsQuerying(false);
      }
    },
    [question, documentSessionId, isQuerying, i18n.language, t],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const handleSelectSuggested = (sq: string) => {
    setQuestion(sq);
    handleAsk(sq);
  };

  if (!documentSessionId && !isSessionExpired) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-3">
      {/* Section Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-violet-50/70 to-indigo-50/40 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900">
              {t('schemes.documentRag.title', 'Ask About This Document')}
            </h3>
            {fileName && (
              <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
                {fileName}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Suggested Question Chips */}
        {!answer && !isQuerying && (
          <div>
            <p className="text-[10.5px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-violet-500" />
              {t('schemes.documentRag.suggestedTitle', 'Suggested Questions:')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggested(sq)}
                  disabled={isQuerying || isSessionExpired}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-700 border border-slate-200 transition-colors text-left cursor-pointer disabled:opacity-50"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Input Form */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isQuerying || isSessionExpired}
              maxLength={1000}
              placeholder={t(
                'schemes.documentRag.inputPlaceholder',
                'Ask a question about your document...',
              )}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-500 bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={!question.trim() || isQuerying || isSessionExpired}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs cursor-pointer shrink-0"
          >
            {isQuerying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('schemes.documentRag.askBtn', 'Ask')}</span>
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        <AnimatePresence>
          {isQuerying && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-violet-50 border border-violet-100"
            >
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin shrink-0" />
              <p className="text-xs text-violet-800 font-medium">
                {t(
                  'schemes.documentRag.searchingText',
                  'Finding relevant information in your document...',
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / Session Expired State */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                {isSessionExpired && onClear && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('schemes.documentRag.uploadAgain', 'Upload Again')}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Box */}
        <AnimatePresence>
          {answer && !isQuerying && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-md">
                  {t('schemes.documentRag.answerBadge', 'Document Answer')}
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                {answer}
              </p>

              {/* Source Page Badges */}
              {sources && sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200/70 flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500">
                    {t('schemes.documentRag.sourcesLabel', 'Sources:')}
                  </span>
                  {sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs"
                    >
                      <FileText className="w-2.5 h-2.5 text-violet-600" />
                      {t('schemes.documentRag.page', 'Page')} {src.page}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentRagChat;
