/**
 * GovernmentSchemesScreen
 * Entry screen for the Schemes tab, backed by the modular feature architecture.
 */
import React from 'react';
import { SchemesScreen } from '../../features/schemes';

export interface GovernmentSchemesScreenProps {
  initialSelectedSchemeId?: string;
}

export const GovernmentSchemesScreen: React.FC<GovernmentSchemesScreenProps> = (props) => {
  return <SchemesScreen {...props} />;
};

export default GovernmentSchemesScreen;
