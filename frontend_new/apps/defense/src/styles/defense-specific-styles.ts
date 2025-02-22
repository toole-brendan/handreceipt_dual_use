import { Theme } from '@mui/material/styles';
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
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
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
