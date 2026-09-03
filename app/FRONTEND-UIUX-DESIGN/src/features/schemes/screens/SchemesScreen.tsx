/**
 * SchemesScreen Component
 * The main Government Health Scheme Discovery experience.
 * Features:
 *  1. Hero Header
 *  2. Dedicated Voice Assistant (Ask by Voice)
 *  3. Document-Based Eligibility Assistant (Upload Document Details)
 *  4. Search & Category Filters
 *  5. Grounded RAG & Document Eligibility Result presentations
 *  6. Curated static scheme catalog
 * Fully localized with i18n.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Scheme,
  SchemeCategory,
  SchemeRagResult,
  SchemeVoiceState,
  DocumentUploadState,
  DocumentEligibilityResponse,
  UserProfile,
  EditableProfile,
} from '../types/schemeTypes';
import { GOVERNMENT_SCHEMES_DATA } from '../data/schemes';
import { getLocalizedSchemes } from '../data/localizedSchemes';
import { filterSchemes } from '../utils/schemeHelpers';
import { SchemeHero } from '../components/SchemeHero';
import { SchemeVoiceAssistant } from '../components/SchemeVoiceAssistant';
import { SchemeDocumentUpload } from '../components/SchemeDocumentUpload';
import { DocumentProfilePreview } from '../components/DocumentProfilePreview';
import { EligibilitySummary } from '../components/EligibilitySummary';
import { SchemeSearchBar } from '../components/SchemeSearchBar';
import { SchemeFilterChips } from '../components/SchemeFilterChips';
import { SchemeRagAnswerCard } from '../components/SchemeRagAnswerCard';
import { SchemeRecommendationList } from '../components/SchemeRecommendationList';
import { SchemeDetailsScreen } from './SchemeDetailsScreen';
import { useVoiceRecorder } from '../../voice/hooks/useVoiceRecorder';
import { VoiceQuerySuccessResponse } from '../../voice/types/voiceTypes';
import { uploadSchemeDocument, evaluateSchemeEligibility } from '../../../services/voiceService';

export interface SchemesScreenProps {
  initialSelectedSchemeId?: string;
}

export const SchemesScreen: React.FC<SchemesScreenProps> = ({
  initialSelectedSchemeId,
}) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(() => {
    if (initialSelectedSchemeId) {
      return GOVERNMENT_SCHEMES_DATA.find((s) => s.id === initialSelectedSchemeId) || null;
    }
    return null;
  });

  const localizedAllSchemes = useMemo(() => {
    return getLocalizedSchemes(GOVERNMENT_SCHEMES_DATA, i18n.language);
  }, [i18n.language]);

  // ── Voice RAG State ──────────────────────────────────────────────────────
  const [ragResult, setRagResult] = useState<SchemeRagResult | null>(null);

  const handleVoiceResult = useCallback((res: VoiceQuerySuccessResponse) => {
    const isSchemeRag =
      res.mode === 'scheme_rag' && Array.isArray(res.schemes) && res.schemes.length > 0;

    const matchedSchemes = isSchemeRag
      ? (res.schemes || []).map((s) => ({
          schemeId: s.schemeId,
          schemeName: s.schemeName,
          relevanceScore: s.relevanceScore,
          reason: s.reason,
        }))
      : [];

    const sources = isSchemeRag
      ? (res.sources || []).map((src) => ({
          source: src.source,
          page: src.page,
          score: src.score,
        }))
      : [];

    setRagResult({
      question: res.transcript || 'Voice Inquiry',
      answer: res.response_text,
      mode: res.mode || (isSchemeRag ? 'scheme_rag' : 'general'),
      schemes: matchedSchemes,
      sources: sources,
      audioBase64: res.audio_base64,
    });
  }, []);

  const {
    voiceState,
    errorMessage,
    startRecording,
    stopRecording,
    clearError,
  } = useVoiceRecorder({
    onResult: handleVoiceResult,
  });

  const schemeVoiceState: SchemeVoiceState =
    errorMessage ? 'error' : (voiceState as SchemeVoiceState);

  // Authoritative condition for Voice RAG scheme recommendations
  const isRagRecommendation = Boolean(
    ragResult && ragResult.mode === 'scheme_rag' && ragResult.schemes && ragResult.schemes.length > 0
  );

  const ragMatchedSchemes = useMemo(() => {
    if (!isRagRecommendation || !ragResult) return [];
    const matchedIds = new Set(ragResult.schemes.map((s) => s.schemeId.toLowerCase()));
    return localizedAllSchemes.filter((s) => matchedIds.has(s.id.toLowerCase()));
  }, [isRagRecommendation, ragResult, localizedAllSchemes]);

  // ── Document Eligibility State ───────────────────────────────────────────
  const [docUploadState, setDocUploadState] = useState<DocumentUploadState>('idle');
  const [docErrorMessage, setDocErrorMessage] = useState<string>('');
  const [documentResponse, setDocumentResponse] = useState<DocumentEligibilityResponse | null>(null);
  const [isReviewingProfile, setIsReviewingProfile] = useState<boolean>(false);
  const [previewProfile, setPreviewProfile] = useState<UserProfile | null>(null);
  const [previewMissingFields, setPreviewMissingFields] = useState<string[]>([]);

  const handleDocumentSelected = useCallback((_file: File) => {
    setDocUploadState('selected');
    setDocErrorMessage('');
  }, []);

  const handleDocumentUpload = useCallback(async (file: File) => {
    setDocUploadState('uploading');
    setDocErrorMessage('');

    try {
      const result = await uploadSchemeDocument(file);

      if (!result.success) {
        setDocUploadState('error');
        setDocErrorMessage(result.error || t('schemes.documentUpload.errUnsupported', { type: file.type }));
        return;
      }

      setDocUploadState('success');
      setPreviewProfile(result.profile);
      setPreviewMissingFields(result.missing_fields || []);
      setDocumentResponse(result);
      setIsReviewingProfile(true);
    } catch {
      setDocUploadState('error');
      setDocErrorMessage(t('schemes.errorState'));
    }
  }, [t]);

  const handleClearDocument = useCallback(() => {
    setDocUploadState('idle');
    setDocErrorMessage('');
    setDocumentResponse(null);
    setIsReviewingProfile(false);
    setPreviewProfile(null);
    setPreviewMissingFields([]);
  }, []);

  const handleConfirmProfile = useCallback(
    async (edited: EditableProfile) => {
      // Parse and strictly validate numeric inputs
      let parsedAge: number | null = null;
      if (edited.age && edited.age.trim()) {
        const a = parseInt(edited.age.trim(), 10);
        if (!isNaN(a) && a >= 0 && a <= 125) {
          parsedAge = a;
        }
      }

      let parsedIncome: number | null = null;
      if (edited.annual_income && edited.annual_income.trim()) {
        const inc = parseFloat(edited.annual_income.trim().replace(/,/g, ''));
        if (!isNaN(inc) && inc >= 0) {
          parsedIncome = inc;
        }
      }

      let parsedChildAge: number | null = null;
      if (edited.child_age && edited.child_age.trim()) {
        const ca = parseFloat(edited.child_age.trim());
        if (!isNaN(ca) && ca >= 0 && ca <= 18) {
          parsedChildAge = ca;
        }
      }

      const updatedProfile: UserProfile = {
        name: edited.name ? edited.name.trim() : null,
        date_of_birth: edited.date_of_birth ? edited.date_of_birth.trim() : null,
        age: parsedAge,
        gender: edited.gender ? edited.gender.trim() : null,
        state: edited.state ? edited.state.trim() : null,
        district: edited.district ? edited.district.trim() : null,
        category: edited.category ? edited.category.trim() : null,
        annual_income: parsedIncome,
        occupation: edited.occupation ? edited.occupation.trim() : null,
        pregnancy_status:
          edited.pregnancy_status === 'yes'
            ? true
            : edited.pregnancy_status === 'no'
            ? false
            : null,
        child_age: parsedChildAge,
      };

      setPreviewProfile(updatedProfile);

      // Recalculate eligibility with backend
      try {
        const recalcRes = await evaluateSchemeEligibility(updatedProfile);
        if (recalcRes.success) {
          setDocumentResponse(recalcRes);
          setPreviewMissingFields(recalcRes.missing_fields || []);
        } else if (documentResponse) {
          setDocumentResponse({
            ...documentResponse,
            profile: updatedProfile,
          });
        }
      } catch {
        if (documentResponse) {
          setDocumentResponse({
            ...documentResponse,
            profile: updatedProfile,
          });
        }
      }

      setIsReviewingProfile(false);
    },
    [documentResponse]
  );

  // ── Static Catalog ───────────────────────────────────────────────────────
  const staticCatalogSchemes = useMemo(() => {
    return filterSchemes(localizedAllSchemes, searchQuery, selectedCategory);
  }, [localizedAllSchemes, searchQuery, selectedCategory]);

  // If a scheme is selected for detailed view, show SchemeDetailsScreen
  if (selectedScheme) {
    return (
      <SchemeDetailsScreen
        scheme={selectedScheme}
        onBack={() => setSelectedScheme(null)}
      />
    );
  }

  return (
    <div className="w-full bg-[#F8FAFC] min-h-full py-3 px-3 sm:px-4 pb-4 space-y-3.5 max-w-full">
      {/* ── 1. Hero Header ─────────────────────────────────────────────── */}
      <SchemeHero />

      {/* ── 2. Dedicated Scheme Voice Assistant ────────────────────────── */}
      <SchemeVoiceAssistant
        voiceState={schemeVoiceState}
        onStartSchemeVoice={startRecording}
        onStopSchemeVoice={stopRecording}
        onSubmitSchemeQuestion={(question) => {
          setSearchQuery(question);
        }}
        errorMessage={errorMessage}
        onClearError={clearError}
      />

      {/* ── 3. OR Separator ────────────────────────────────────────────── */}
      <div className="relative flex py-0.5 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {t('common.or')}
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* ── 4. Document-Based Scheme Eligibility Assistant ─────────────── */}
      <SchemeDocumentUpload
        uploadState={docUploadState}
        errorMessage={docErrorMessage}
        onFileSelected={handleDocumentSelected}
        onUpload={handleDocumentUpload}
        onClear={handleClearDocument}
      />

      {/* ── 5. Document Profile Review (shown after extraction) ────────── */}
      <AnimatePresence>
        {isReviewingProfile && previewProfile && (
          <DocumentProfilePreview
            profile={previewProfile}
            missingFields={previewMissingFields}
            onConfirm={handleConfirmProfile}
            onCancel={handleClearDocument}
          />
        )}
      </AnimatePresence>

      {/* ── 6. Document Eligibility Summary & Relevant Schemes ─────────── */}
      <AnimatePresence>
        {documentResponse && !isReviewingProfile && (
          <EligibilitySummary
            data={documentResponse}
            onClear={handleClearDocument}
            onViewSchemeDetails={(scheme) => setSelectedScheme(scheme)}
          />
        )}
      </AnimatePresence>

      {/* ── 7. Search Bar ──────────────────────────────────────────────── */}
      <SchemeSearchBar
        value={searchQuery}
        onChange={(val) => setSearchQuery(val)}
        placeholder={t('schemes.searchPlaceholder')}
      />

      {/* ── 8. Category Filter Chips ───────────────────────────────────── */}
      <SchemeFilterChips
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* ── 9. Voice RAG / General AI Answer Card (if active) ──────────── */}
      <AnimatePresence>
        {ragResult && (
          <SchemeRagAnswerCard
            ragResult={ragResult}
            onClear={() => setRagResult(null)}
          />
        )}
      </AnimatePresence>

      {/* ── 10. Voice RAG Relevant Scheme Results (only when scheme_rag) ── */}
      {isRagRecommendation && ragMatchedSchemes.length > 0 && (
        <SchemeRecommendationList
          schemes={ragMatchedSchemes}
          isRagResult={true}
          onViewDetails={(scheme) => setSelectedScheme(scheme)}
        />
      )}

      {/* ── 11. Static Browseable Scheme Catalog (always visible) ───────── */}
      <SchemeRecommendationList
        schemes={staticCatalogSchemes}
        isRagResult={false}
        onViewDetails={(scheme) => setSelectedScheme(scheme)}
      />
    </div>
  );
};

export default SchemesScreen;
