import { createTheme } from '@mui/material/styles';
import type { CustomTheme } from '@shared/types/theme';
import { colors } from '@shared/styles/theme/colors';
import { BaseTheme } from '@shared/styles/theme';

// Defense theme extends the base dark theme with military-specific styling
const defenseOverrides = {
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderColor: colors.border.light,
          '&.sensitive-item': {
            borderColor: colors.status.warning,
            borderWidth: 2,
          },
          '&.classified': {
            borderColor: colors.status.error,
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.status-serviceable': {
            backgroundColor: colors.status.success,
            color: '#FFFFFF',
          },
          '&.status-unserviceable': {
            backgroundColor: colors.status.error,
            color: '#FFFFFF',
          },
          '&.status-maintenance': {
            backgroundColor: colors.status.warning,
            color: '#000000',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.dark,
          borderBottom: `1px solid ${colors.border.light}`,
          '& .classification-banner': {
            backgroundColor: colors.status.error,
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '4px 0',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .sensitive-row': {
            backgroundColor: `${colors.status.warning}10`,
          },
          '& .classified-row': {
            backgroundColor: `${colors.status.error}10`,
          },
        },
      },
    },
    // Military-specific form styling
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: colors.primary.main,
            },
          },
          '&.military-id': {
            '& input': {
              textTransform: 'uppercase',
            },
          },
        },
      },
    },
    // Status indicators
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '&.alert-sensitive': {
            backgroundColor: `${colors.status.warning}20`,
            borderLeft: `4px solid ${colors.status.warning}`,
          },
          '&.alert-classified': {
            backgroundColor: `${colors.status.error}20`,
            borderLeft: `4px solid ${colors.status.error}`,
          },
        },
      },
    },
  },
  // Add any other theme customizations here
  custom: {
    status: {
      verified: colors.status.success,
      pending: colors.status.warning,
      sensitive: colors.status.warning,
      inactive: colors.status.error,
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.05)',
      dark: 'rgba(0, 0, 0, 0.1)',
    },
  },
};

export const defenseTheme = createTheme({
  ...BaseTheme,
  ...defenseOverrides,
}) as CustomTheme;
