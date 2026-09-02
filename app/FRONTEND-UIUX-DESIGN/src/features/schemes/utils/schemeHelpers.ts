/**
 * Scheme Utilities & Helper Functions
 */
import { Scheme, SchemeCategory, SchemeActionType } from '../types/schemeTypes';
import { SCHEME_ACTION_LABELS } from '../constants/schemeConstants';

/**
 * Filter schemes by text query and category chip
 */
export function filterSchemes(
  schemes: Scheme[],
  query: string,
  category: SchemeCategory
): Scheme[] {
  const cleanQuery = query.trim().toLowerCase();

  return schemes.filter((scheme) => {
    const matchesCategory =
      category === 'all' || scheme.category === category;

    if (!matchesCategory) return false;

    if (!cleanQuery) return true;

    const inName = scheme.name.toLowerCase().includes(cleanQuery);
    const inShortDesc = scheme.shortDescription.toLowerCase().includes(cleanQuery);
    const inDesc = scheme.description ? scheme.description.toLowerCase().includes(cleanQuery) : false;
    const inCategory = scheme.categoryLabel ? scheme.categoryLabel.toLowerCase().includes(cleanQuery) : false;
    const inBenefits = scheme.benefits ? scheme.benefits.some((b) => b.toLowerCase().includes(cleanQuery)) : false;
    const inEligibility = scheme.eligibility ? scheme.eligibility.some((e) => e.toLowerCase().includes(cleanQuery)) : false;

    return inName || inShortDesc || inDesc || inCategory || inBenefits || inEligibility;
  });
}

/**
 * Resolves user-facing label for a scheme action button
 */
export function getActionLabel(actionType: SchemeActionType, customLabel?: string): string {
  if (customLabel) return customLabel;
  return SCHEME_ACTION_LABELS[actionType] || 'View Details';
}

/**
 * Safely open verified government portal URL in browser or external viewer
 */
export function openExternalUrl(url?: string): void {
  if (!url) return;
  try {
    const targetUrl = url.trim();
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    console.warn('[schemeHelpers] Failed to open external link:', err);
  }
}
