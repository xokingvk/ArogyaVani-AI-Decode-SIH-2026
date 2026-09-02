/**
 * Voice feature types.
 * All voice-related interfaces live here to avoid scattering across files.
 */
import { LucideIcon } from 'lucide-react';

// ── Voice State Machine ────────────────────────────────────────────────────
// idle → listening (user taps mic)
// listening → processing (user taps stop / auto-stop)
// processing → response (backend responds) | idle (error)
// response → listening (user taps mic again) | idle (clear)

export type VoiceState = 'idle' | 'listening' | 'processing' | 'response';

// ── Backend API Response Shapes ────────────────────────────────────────────

export interface SchemeMatch {
  schemeId: string;
  schemeName: string;
  relevanceScore?: number;
  reason?: string;
}

export interface SchemeSourceDoc {
  source: string;
  page: number;
  score?: number;
}

export interface VoiceQuerySuccessResponse {
  success: true;
  transcript: string;
  language_code: string;
  response_text: string;
  audio_base64: string;
  mode?: 'scheme_rag' | 'general';
  schemes?: SchemeMatch[];
  sources?: SchemeSourceDoc[];
}

export interface VoiceQueryErrorResponse {
  success: false;
  error: string;
}

export type VoiceQueryResponse = VoiceQuerySuccessResponse | VoiceQueryErrorResponse;

// ── Home Screen Quick Actions ──────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  subLabel: string;
  Icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  border: string;
  iconColor: string;
  onClick: () => void;
}
