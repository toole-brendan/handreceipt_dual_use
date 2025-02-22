// Core color palette for minimalist dark theme
export const colors = {
  background: {
    default: '#121212', // Main app background
    paper: '#1E1E1E',   // Card and surface background
    dark: '#0A0A0A',    // Darker elements like headers
    light: '#2C2C2C',   // Lighter surfaces for contrast
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#E0E0E0',
    disabled: '#757575',
    hint: '#9E9E9E',
  },
  primary: {
    main: '#2196F3',      // Bright blue for primary actions
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#424242',      // Subtle gray for secondary elements
    light: '#616161',
    dark: '#212121',
    contrastText: '#FFFFFF',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(255, 255, 255, 0.23)',
  },
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
  action: {
    active: '#FFFFFF',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
} as const;

export type ColorPalette = typeof colors;
