import { Theme, alpha } from '@mui/material/styles';
import { BaseTheme } from '@shared/styles/theme';

/**
 * Defense-specific theme overrides
 */
export const defenseTheme: Partial<Theme> = {
  ...BaseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#1B5E20', // Military green
      light: '#4C8C4A',
      dark: '#003300',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#455A64', // Blue grey
      light: '#718792',
      dark: '#1C313A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    htmlFontSize: 16,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    button: {
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03em',
    },
    overline: {
      fontSize: '0.75rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
};

/**
 * Defense-specific CSS variables
 */
export const defenseVariables = {
  '--color-primary': '#1B5E20',
  '--color-secondary': '#455A64',
  '--bg-primary': '#121212',
  '--bg-secondary': '#1E1E1E',
  '--text-primary': '#FFFFFF',
  '--text-secondary': 'rgba(255, 255, 255, 0.7)',
  '--border-color': 'rgba(255, 255, 255, 0.12)',
  '--space-xs': '4px',
  '--space-sm': '8px',
  '--space-md': '16px',
  '--space-lg': '24px',
  '--space-xl': '32px',
  '--z-modal': '1300',
  '--z-tooltip': '1400',
  '--z-snackbar': '1500',
} as const;

export const defenseDashboardStyles = (theme: Theme) => ({
  dashboardContainer: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    background: '#121212',
    color: '#FFFFFF',
  },
  
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    },
    '& .unit-logo': {
      width: 60,
      height: 60,
      objectFit: 'contain',
    },
    '& .commander-info': {
      flex: 1,
      '& h4': {
        color: '#FFFFFF',
        marginBottom: theme.spacing(0.5),
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
      '& p': {
        color: alpha('#FFFFFF', 0.7),
        fontSize: '0.875rem',
        letterSpacing: '0.015em',
      },
    },
  },

  metricsCard: {
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2.5),
    transition: 'all 0.2s ease',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    },
    '& .metric-value': {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#FFFFFF',
      letterSpacing: '0.02em',
      marginBottom: theme.spacing(1),
    },
    '& .metric-label': {
      color: alpha('#FFFFFF', 0.7),
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 500,
    },
  },

  categoryChart: {
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    transition: 'all 0.2s ease',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    },
  },

  notifications: {
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    '& .notification-item': {
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${alpha('#FFFFFF', 0.1)}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: alpha('#FFFFFF', 0.05),
      },
    },
  },

  recentActivity: {
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    '& .activity-item': {
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${alpha('#FFFFFF', 0.1)}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: alpha('#FFFFFF', 0.05),
      },
    },
  },

  personnelOverview: {
    backgroundColor: alpha('#1E1E1E', 0.6),
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2.5),
    '& .stat-item': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${alpha('#FFFFFF', 0.1)}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '& .stat-label': {
        color: alpha('#FFFFFF', 0.7),
        fontSize: '0.875rem',
        fontWeight: 500,
      },
      '& .stat-value': {
        fontSize: '1rem',
        fontWeight: 600,
        '&.success': { color: theme.palette.success.main },
        '&.warning': { color: theme.palette.warning.main },
        '&.error': { color: theme.palette.error.main },
      },
    },
  },
});

export const categoryChartColors = {
  weapons: '#4CAF50',
  vehicles: '#FFC107',
  communications: '#2196F3',
  other: '#9E9E9E',
};
