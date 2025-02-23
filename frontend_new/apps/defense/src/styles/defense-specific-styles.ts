import { Theme } from '@mui/material/styles';
import { BaseTheme } from '@shared/styles/theme';

/**
 * Defense-specific theme overrides - minimalist version
 */
export const defenseTheme = {
  ...BaseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#4CAF50', // Military green
      light: '#81C784',
      dark: '#2E7D32',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#607D8B', // Blue grey
      light: '#90A4AE',
      dark: '#455A64',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0F14',
      paper: '#1A2027',
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", monospace',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
};

// Essential defense-specific variables
export const defenseVariables = {
  '--color-primary': '#4CAF50',
  '--color-secondary': '#607D8B',
  '--bg-primary': '#0A0F14',
  '--bg-secondary': '#1A2027',
} as const;

// Chart colors for consistency
export const categoryChartColors = [
  '#4CAF50', // Primary green
  '#81C784', // Light green
  '#2E7D32', // Dark green
  '#607D8B', // Blue grey
  '#90A4AE', // Light blue grey
  '#455A64', // Dark blue grey
];

export const defenseDashboardStyles = (theme: Theme) => ({
  dashboardContainer: {
    padding: theme.spacing(3),
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0A0F14 0%, #1A2027 100%)',
    color: '#FFFFFF',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("/assets/images/tactical-pattern.png") repeat',
      opacity: 0.03,
      pointerEvents: 'none',
    },
  },
  
  companyInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    padding: theme.spacing(3),
    marginBottom: theme.spacing(4),
    backgroundColor: 'rgba(26, 32, 39, 0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '2px',
      background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
      opacity: 0.8,
    },
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
    '& .unit-logo': {
      width: 64,
      height: 64,
      objectFit: 'contain',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    },
    '& .commander-info': {
      flex: 1,
      '& h4': {
        color: '#FFFFFF',
        marginBottom: theme.spacing(0.5),
        fontWeight: 600,
        letterSpacing: '0.02em',
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
      '& p': {
        color: 'rgba(255, 255, 255, 0.87)',
        fontSize: '0.875rem',
        letterSpacing: '0.015em',
        fontFamily: '"Roboto Mono", monospace',
      },
    },
  },

  metricsCard: {
    backgroundColor: 'rgba(26, 32, 39, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    padding: theme.spacing(2.5),
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '2px',
      background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
      opacity: 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      '&::after': {
        opacity: 0.8,
      },
    },
    '& .metric-value': {
      fontSize: '2.25rem',
      fontWeight: 600,
      color: '#FFFFFF',
      letterSpacing: '0.02em',
      marginBottom: theme.spacing(1),
      fontFamily: '"Roboto Mono", monospace',
      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    '& .metric-label': {
      color: 'rgba(255, 255, 255, 0.87)',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontWeight: 500,
      fontFamily: '"Roboto Mono", monospace',
    },
  },

  categoryChart: {
    backgroundColor: 'rgba(26, 32, 39, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    },
  },

  notifications: {
    backgroundColor: 'rgba(26, 32, 39, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    padding: theme.spacing(2),
    '& .notification-item': {
      padding: theme.spacing(1.5),
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
    },
  },

  recentActivity: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2),
    '& .activity-item': {
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${'rgba(255, 255, 255, 0.1)'}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      },
    },
  },

  personnelOverview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(2.5),
    '& .stat-item': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing(1.5),
      borderBottom: `1px solid ${'rgba(255, 255, 255, 0.1)'}`,
      '&:last-child': {
        borderBottom: 'none',
      },
      '& .stat-label': {
        color: 'rgba(255, 255, 255, 0.7)',
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
