export const colors = {
  // Primary colors - muted grays for a clean, professional look
  primary: {
    50: '#f0f0f0',
    100: '#dcdcdc',
    200: '#c7c7c7',
    300: '#b2b2b2',
    400: '#9e9e9e',
    500: '#8a8a8a', // Main primary color - muted gray
    600: '#757575',
    700: '#616161',
    800: '#4d4d4d',
    900: '#383838',
  },

  // Secondary colors - darker grays for the dark theme
  secondary: {
    50: '#3a3a3a',
    100: '#353535',
    200: '#303030',
    300: '#2b2b2b',
    400: '#262626',
    500: '#212121', // Main secondary color
    600: '#1c1c1c',
    700: '#171717',
    800: '#121212',
    900: '#0d0d0d',
  },

  // Success colors - muted for dark theme
  success: {
    50: '#e0f2e0',
    100: '#c1e3c1',
    200: '#a3d4a3',
    300: '#85c585',
    400: '#66b666',
    500: '#48a748', // Main success color - slightly muted
    600: '#3d8f3d',
    700: '#327732',
    800: '#275f27',
    900: '#1c471c',
  },

  // Error colors - muted for dark theme
  error: {
    50: '#fde7e7',
    100: '#fbd0d0',
    200: '#f9b9b9',
    300: '#f7a2a2',
    400: '#f58b8b',
    500: '#f37474', // Main error color - slightly muted
    600: '#d16464',
    700: '#af5454',
    800: '#8d4444',
    900: '#6b3434',
  },

  // Warning colors - muted for dark theme
  warning: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Main warning color
    600: '#d68100',
    700: '#ad6a00',
    800: '#855300',
    900: '#5c3c00',
  },

  // Info colors - muted for dark theme
  info: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Main info color
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  // Status colors - using muted versions of success/warning/error
  status: {
    active: '#48a748', // success.500
    inactive: '#8a8a8a', // primary.500
    pending: '#ff9800', // warning.500
    blocked: '#f37474', // error.500
  },

  // Classification colors - using muted versions
  classification: {
    unclassified: '#48a748', // success.500
    confidential: '#ff9800', // warning.500
    secret: '#f37474', // error.500
    topSecret: '#9c27b0', // keeping purple for top secret
  },

  // Background colors - dark theme
  background: {
    default: '#000000', // Pure black background
    paper: '#1E1E1E', // Slightly lighter for cards/panels
    dark: '#121212', // Alternative dark shade for contrast
  },

  // Text colors - light text for dark theme
  text: {
    primary: 'rgba(255, 255, 255, 0.9)', // High contrast white
    secondary: 'rgba(255, 255, 255, 0.7)', // Slightly dimmed
    disabled: 'rgba(255, 255, 255, 0.38)', // More dimmed
    hint: 'rgba(255, 255, 255, 0.38)', // Matching disabled
  },

  // Border colors - subtle light borders for dark theme
  border: {
    light: 'rgba(255, 255, 255, 0.12)', // Very subtle
    medium: 'rgba(255, 255, 255, 0.23)', // Slightly more visible
    dark: 'rgba(255, 255, 255, 0.38)', // Most visible
  },
} as const;

export type ColorPalette = typeof colors;
