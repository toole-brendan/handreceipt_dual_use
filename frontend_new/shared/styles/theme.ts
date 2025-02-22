import { Theme, createTheme } from '@mui/material/styles';
import { colors } from './theme/colors';
import { fontFamilies, fontWeights } from './theme/typography';

/**
 * Base theme shared between civilian and defense apps
 */
export const BaseTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: colors.text.primary,
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: colors.text.primary,
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: fontFamilies.primary,
    h1: {
      fontSize: '2.5rem',
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.01562em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: fontWeights.bold,
      letterSpacing: '-0.00833em',
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: fontWeights.regular,
      letterSpacing: '0.00938em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: fontWeights.regular,
      letterSpacing: '0.01071em',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          fontWeight: fontWeights.medium,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.background.paper,
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          borderRadius: 8,
          border: `1px solid ${colors.border.light}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.light}`,
        },
        head: {
          fontWeight: fontWeights.medium,
          backgroundColor: colors.background.dark,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          borderRadius: 12,
        },
      },
    },
  },
}) as Theme;
