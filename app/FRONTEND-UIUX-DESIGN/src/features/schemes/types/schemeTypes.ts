/**
 * Scheme Types & Interfaces
 * Comprehensive type definitions for Government Health Schemes, RAG assistant,
 * and Document-Based Eligibility integration.
 */

export type SchemeActionType = 'apply' | 'eligibility' | 'access' | 'details';

export type SchemeCategory =
  | 'all'
  | 'women-maternity'
  | 'children'
  | 'insurance'
  | 'family-health'
  | 'preventive'
  | 'state-schemes'
  | 'other';

export interface SchemeSource {
  title: string;
  page?: number;
  documentName?: string;
  url?: string;
}

export interface Scheme {
  id: string;
  name: string;
  shortDescription: string;
  description?: string;
  category: SchemeCategory;
  categoryLabel?: string;
  tag?: string;
  tagColor?: string;
  iconName?: string;

  /** Key financial or service coverage highlight (e.g., 'Up to ₹5 Lakhs / year') */
  coverageHighlight?: string;

  /** Eligibility criteria list */
  eligibility?: string[];

  /** Structured benefits list */
  benefits?: string[];

  /** Required documents for verification */
  documents?: string[];

  /** Step-by-step instructions for online or portal application */
  howToApply?: string[];

  /** Step-by-step instructions to access at government healthcare facility */
  howToAccess?: string[];

  /** Dynamic action button type */
  actionType: SchemeActionType;

  /** Verified official government portal link */
  officialWebsite?: string;

  /** Direct official online application portal link */
  applicationUrl?: string;

  /** Source document metadata for RAG verification */
  source?: SchemeSource;
}

/** Voice Assistant UI states */
export type SchemeVoiceState = 'idle' | 'listening' | 'processing' | 'response' | 'error';

// ── Voice RAG Types ──────────────────────────────────────────────────────────

export interface SchemeRagMatch {
  schemeId: string;
  schemeName: string;
  relevanceScore?: number;
  reason?: string;
}

export interface SchemeRagSource {
  source: string;
  page: number;
  score?: number;
}

export interface SchemeRagResult {
  question: string;
  answer: string;
  mode?: 'scheme_rag' | 'general';
  schemes: SchemeRagMatch[];
  sources: SchemeRagSource[];
  audioBase64?: string;
}

// ── Document-Based Eligibility Types ────────────────────────────────────────

/** Upload flow UI state machine */
export type DocumentUploadState =
  | 'idle'
  | 'selected'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error';

/**
 * Structured profile extracted from an uploaded document.
 * Fields are null when not found — never inferred from name or appearance.
 */
export interface UserProfile {
  name: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  state: string | null;
  district: string | null;
  /** SC/ST/OBC/General — only if explicitly visible in document */
  category: string | null;
  /** Only if explicitly stated in the document */
  annual_income: number | null;
  occupation: string | null;
  /** null = unknown; never inferred from name or photo */
  pregnancy_status: boolean | null;
  child_age: number | null;
}

/** Confidence level for a single extracted field */
export type FieldConfidence = 'high' | 'medium' | 'low';

/** Per-field extraction confidence (only for populated fields) */
export type ProfileConfidence = Partial<Record<keyof UserProfile, FieldConfidence>>;

/**
 * Eligibility assessment status.
 * Uses conservative language — never claims definitive eligibility
 * when required criteria are unknown.
 */
export type EligibilityStatus =
  | 'potentially_eligible'
  | 'relevant'
  | 'needs_more_information'
  | 'not_currently_eligible'
  | 'unable_to_determine';

/** Single scheme eligibility evaluation result */
export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  status: EligibilityStatus;
  relevanceScore: number;
  reason: string;
  matchedCriteria: string[];
  missingCriteria: string[];
  confidence: 'high' | 'medium' | 'low';
}

/** Source reference from RAG grounding */
export interface EligibilitySource {
  source: string;
  page: number;
  score: number;
}

/** Full response from POST /scheme-document */
export interface DocumentEligibilityResponse {
  success: true;
  profile: UserProfile;
  confidence: ProfileConfidence;
  missing_fields: string[];
  summary: string;
  schemes: EligibilityResult[];
  sources: EligibilitySource[];
}

/**
 * Editable profile state (allows user to correct AI-extracted values).
 * All fields are strings in the UI to simplify controlled inputs.
 */
export interface EditableProfile {
  name: string;
  date_of_birth: string;
  age: string;
  gender: string;
  state: string;
  district: string;
  category: string;
  annual_income: string;
  occupation: string;
  pregnancy_status: string; // 'yes' | 'no' | 'unknown'
  child_age: string;
}

/** Discriminated input mode for the Schemes screen */
export type SchemeInputMode = 'voice' | 'document' | 'browse';
