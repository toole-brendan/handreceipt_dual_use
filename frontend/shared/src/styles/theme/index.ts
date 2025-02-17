import { createTheme } from '@mui/material';
import type { CustomTheme } from '../../types/theme';
import { palette, customColors } from './palette';
import { typography } from './typography';
import { components } from './components';

// Create base theme
const baseTheme = createTheme({
  palette: {
    mode: 'dark',
    ...palette
  },
  typography,
  shape: {
    borderRadius: 0, // Military-style sharp corners
  },
  mixins: {
    toolbar: {
      minHeight: 56,
      '@media (min-width:0px) and (orientation: landscape)': {
        minHeight: 48,
      },
      '@media (min-width:600px)': {
        minHeight: 64,
      },
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
});

// Create full theme with components and custom colors
const theme = createTheme({
  ...baseTheme,
  components,
  custom: customColors
}) as CustomTheme;

export type { CustomTheme };
export default theme;
