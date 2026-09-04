/**
 * SchemeDocumentUpload Component
 * Handles document (JPG/PNG/PDF) selection, validation, and upload trigger.
 * States: idle → selected → uploading → processing → success | error
 * Privacy: processes only for scheme discovery, never stores original document.
 * Fully localized with i18n.
 */
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Image,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DocumentUploadState } from '../types/schemeTypes';

// ── Configuration ─────────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

function validateFile(file: File, t: (key: string, options?: any) => string): string | null {
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return t('schemes.documentUpload.errUnsupported', { type: file.type });
  }
  if (file.size === 0) {
    return t('schemes.documentUpload.errEmpty');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return t('schemes.documentUpload.errTooLarge', { size: sizeMB });
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface SchemeDocumentUploadProps {
  uploadState: DocumentUploadState;
  errorMessage?: string;
  onFileSelected: (file: File) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export const SchemeDocumentUpload: React.FC<SchemeDocumentUploadProps> = ({
  uploadState,
  errorMessage,
  onFileSelected,
  onUpload,
  onClear,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const err = validateFile(file, t);
      if (err) {
        setValidationError(err);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setValidationError(null);
      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected, t],
  );

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  }, [onClear]);

  const isLoading = uploadState === 'uploading' || uploadState === 'processing';
  const isSuccess = uploadState === 'success';
  const isError = uploadState === 'error';
  const hasFile = uploadState === 'selected' && selectedFile !== null;

  const fileIcon = selectedFile?.type === 'application/pdf' ? (
    <FileText className="w-5 h-5 text-rose-600" />
  ) : (
    <Image className="w-5 h-5 text-teal-600" />
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center">
            <Upload className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-900">{t('schemes.documentUpload.headerTitle')}</p>
            <p className="text-[10.5px] text-slate-500">
              {t('schemes.documentUpload.headerSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          id="scheme-document-file-input"
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="sr-only"
          aria-label={t('schemes.documentUpload.tapToSelect')}
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {/* Upload area / file display */}
        <AnimatePresence mode="wait">
          {!hasFile && !isLoading && !isSuccess ? (
            <motion.button
              key="upload-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40 transition-all text-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-violet-300 flex items-center justify-center transition-colors shadow-sm">
                <Upload className="w-5 h-5 text-slate-500 group-hover:text-violet-600 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-violet-800">
                  {t('schemes.documentUpload.tapToSelect')}
                </p>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  {t('schemes.documentUpload.formatsInfo')}
                </p>
              </div>
            </motion.button>
          ) : null}

          {/* File selected state */}
          {hasFile && selectedFile && (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {fileIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-[10.5px] text-slate-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('common.remove')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Loading / Processing state */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-xl"
            >
              <Loader2 className="w-5 h-5 text-violet-600 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-violet-900">
                  {uploadState === 'uploading' ? t('schemes.documentUpload.uploadingTitle') : t('schemes.documentUpload.extractingTitle')}
                </p>
                <p className="text-[10.5px] text-violet-700">
                  {uploadState === 'processing'
                    ? t('schemes.documentUpload.identifyingSubtitle')
                    : t('schemes.documentUpload.pleaseWaitSubtitle')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Success state */}
          {isSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-900">{t('schemes.documentUpload.processedTitle')}</p>
                <p className="text-[10.5px] text-emerald-700">
                  {t('schemes.documentUpload.processedSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('common.close')}
                className="p-1 text-emerald-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation or upload error */}
        <AnimatePresence>
          {(validationError || (isError && errorMessage)) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t('schemes.documentUpload.errorTitle', 'Document Processing Error')}</p>
                <p className="mt-0.5 font-normal">{validationError ?? errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleClear}
                aria-label={t('common.close')}
                className="ml-auto text-red-400 hover:text-red-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload action button (only when file is selected and ready) */}
        {hasFile && selectedFile && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            type="button"
            onClick={() => onUpload(selectedFile)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors disabled:opacity-60 shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            {t('schemes.documentUpload.processDocumentBtn')}
          </motion.button>
        )}

        {/* Privacy notice */}
        <div className="flex items-start gap-1.5 text-[10.5px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            {t('schemes.documentUpload.privacyNotice')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchemeDocumentUpload;
