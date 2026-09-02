/**
 * Scheme Constants & Filter Configuration
 */
import { SchemeCategory } from '../types/schemeTypes';

export interface SchemeCategoryItem {
  id: SchemeCategory;
  label: string;
  iconName?: string;
}

export const SCHEME_CATEGORIES: SchemeCategoryItem[] = [
  { id: 'all', label: 'All Schemes' },
  { id: 'women-maternity', label: 'Women & Maternity' },
  { id: 'children', label: 'Children & Immunization' },
  { id: 'insurance', label: 'Health Insurance & Cover' },
  { id: 'family-health', label: 'Family & Nutrition' },
  { id: 'preventive', label: 'Preventive Care' },
  { id: 'state-schemes', label: 'State Schemes' },
  { id: 'other', label: 'Welfare & Housing' },
];

export const SCHEME_ACTION_LABELS: Record<string, string> = {
  apply: 'Apply Online',
  eligibility: 'Check Eligibility',
  access: 'How to Access',
  details: 'View Details',
};
