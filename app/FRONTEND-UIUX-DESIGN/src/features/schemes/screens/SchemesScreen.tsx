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
 */
import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
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
import { uploadSchemeDocument } from '../../../services/voiceService';

export interface SchemesScreenProps {
  initialSelectedSchemeId?: string;
}

export const SchemesScreen: React.FC<SchemesScreenProps> = ({
  initialSelectedSchemeId,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SchemeCategory>('all');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(() => {
    if (initialSelectedSchemeId) {
      return GOVERNMENT_SCHEMES_DATA.find((s) => s.id === initialSelectedSchemeId) || null;
    }
    return null;
  });

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
    const allSchemes = filterSchemes(GOVERNMENT_SCHEMES_DATA, '', 'all');
    const matchedIds = new Set(ragResult.schemes.map((s) => s.schemeId.toLowerCase()));
    return allSchemes.filter((s) => matchedIds.has(s.id.toLowerCase()));
  }, [isRagRecommendation, ragResult]);

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
        setDocErrorMessage(result.error || 'Failed to process document. Please try again.');
        return;
      }

      setDocUploadState('success');
      setPreviewProfile(result.profile);
      setPreviewMissingFields(result.missing_fields || []);
      setDocumentResponse(result);
      setIsReviewingProfile(true);
    } catch {
      setDocUploadState('error');
      setDocErrorMessage('An unexpected error occurred while processing the document.');
    }
  }, []);

  const handleClearDocument = useCallback(() => {
    setDocUploadState('idle');
    setDocErrorMessage('');
    setDocumentResponse(null);
    setIsReviewingProfile(false);
    setPreviewProfile(null);
    setPreviewMissingFields([]);
  }, []);

  const handleConfirmProfile = useCallback(
    (edited: EditableProfile) => {
      if (!documentResponse) return;

      const updatedProfile: UserProfile = {
        name: edited.name || null,
        date_of_birth: edited.date_of_birth || null,
        age: edited.age ? parseInt(edited.age, 10) || null : null,
        gender: edited.gender || null,
        state: edited.state || null,
        district: edited.district || null,
        category: edited.category || null,
        annual_income: edited.annual_income ? parseFloat(edited.annual_income) || null : null,
        occupation: edited.occupation || null,
        pregnancy_status:
          edited.pregnancy_status === 'yes'
            ? true
            : edited.pregnancy_status === 'no'
            ? false
            : null,
        child_age: edited.child_age ? parseFloat(edited.child_age) || null : null,
      };

      setDocumentResponse({
        ...documentResponse,
        profile: updatedProfile,
      });
      setIsReviewingProfile(false);
    },
    [documentResponse]
  );

  // ── Static Catalog ───────────────────────────────────────────────────────
  const staticCatalogSchemes = useMemo(() => {
    return filterSchemes(GOVERNMENT_SCHEMES_DATA, searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

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
    <div className="w-full bg-[#F8FAFC] min-h-full py-3 px-4 pb-28 space-y-3.5">
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
          OR
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
        placeholder="Search government schemes, benefits, eligibility..."
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
