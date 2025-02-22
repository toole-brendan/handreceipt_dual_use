import { Theme, createTheme } from '@mui/material/styles';
import { colors } from './theme/colors';
import { fontFamilies, fontWeights } from './theme/typography';

/**
 * Base theme shared between civilian and defense apps
 * Implements a minimalist, clean, dark design
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
    },
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    action: colors.action,
  },
  shape: {
    borderRadius: 0,
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
    h3: {
      fontSize: '1.75rem',
      fontWeight: fontWeights.medium,
      letterSpacing: '0em',
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: fontWeights.medium,
      letterSpacing: '0.00735em',
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: fontWeights.medium,
      letterSpacing: '0em',
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: fontWeights.medium,
      letterSpacing: '0.0075em',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 0,
          fontWeight: fontWeights.medium,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: colors.border.light,
          '&:hover': {
            borderColor: colors.border.dark,
            backgroundColor: colors.action.hover,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.background.paper,
          borderRadius: 0,
        },
        elevation1: {
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.paper,
          borderRadius: 0,
          border: `1px solid ${colors.border.light}`,
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: colors.border.dark,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border.light}`,
          padding: '16px',
        },
        head: {
          fontWeight: fontWeights.medium,
          backgroundColor: colors.background.dark,
          color: colors.text.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          borderRadius: 0,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: colors.background.light,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.dark,
          borderBottom: `1px solid ${colors.border.light}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          borderRight: `1px solid ${colors.border.light}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border.light,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
        },
      },
    },
  },
}) as Theme;
