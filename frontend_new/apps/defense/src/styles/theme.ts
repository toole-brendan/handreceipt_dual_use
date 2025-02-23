import { Theme } from '@mui/material/styles';
import { BaseTheme } from '@shared/styles/theme';

// Chart colors for property categories
export const categoryChartColors = {
  weapons: '#4CAF50',    // Green
  vehicles: '#FF9800',   // Orange
  communications: '#2196F3', // Blue
  other: '#757575',      // Gray
} as const;

// Extend the base theme with defense-specific overrides if needed
export const defenseTheme: Theme = {
  ...BaseTheme,
  // Add any defense-specific theme overrides here if needed in the future
};

