import { colors } from './colors';
import { typography, fontFamilies, fontWeights } from './typography';

const createThemeConfig = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  return {
    mode,
    colors,
    typography,
    fontFamilies,
    fontWeights,
    
    // Semantic colors based on mode
    semantic: {
      background: {
        primary: isDark ? colors.background.dark : colors.background.default,
        secondary: isDark ? colors.background.paper : colors.background.light,
        elevated: isDark ? colors.background.light : colors.background.paper,
      },
      text: {
        primary: isDark ? colors.text.primary : colors.text.primary,
        secondary: isDark ? colors.text.secondary : colors.text.secondary,
        disabled: isDark ? colors.text.disabled : colors.text.disabled,
      },
      border: {
        light: colors.border.light,
        dark: colors.border.dark,
      },
    },

    // Component-specific theme overrides
    components: {
      button: {
        borderRadius: '4px',
        sizes: {
          small: {
            padding: '6px 16px',
            fontSize: typography.button.fontSize,
          },
          medium: {
            padding: '8px 20px',
            fontSize: typography.subtitle2.fontSize,
          },
          large: {
            padding: '10px 24px',
            fontSize: typography.subtitle1.fontSize,
          },
        },
        variants: {
          contained: {
            background: colors.primary.main,
            color: colors.text.primary,
            hover: colors.primary.dark,
            active: colors.primary.dark,
            disabled: colors.action.disabled,
          },
          outlined: {
            background: 'transparent',
            border: `1px solid ${colors.primary.main}`,
            color: colors.primary.main,
            hover: colors.action.hover,
            active: colors.action.selected,
            disabled: colors.action.disabled,
          },
          text: {
            background: 'transparent',
            color: colors.primary.main,
            hover: colors.action.hover,
            active: colors.action.selected,
            disabled: colors.text.disabled,
          },
        },
      },
      card: {
        borderRadius: '8px',
        background: isDark ? colors.background.paper : colors.background.light,
        border: colors.border.light,
        shadow: isDark
          ? '0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      input: {
        borderRadius: '4px',
        background: isDark ? colors.background.paper : colors.background.light,
        border: colors.border.dark,
        placeholder: colors.text.hint,
        focus: {
          border: colors.primary.main,
          shadow: `0 0 0 2px ${colors.primary.light}`,
        },
      },
      table: {
        background: isDark ? colors.background.paper : colors.background.light,
        headerBackground: isDark ? colors.background.dark : colors.background.paper,
        borderColor: colors.border.light,
        rowHover: isDark ? colors.background.light : colors.background.paper,
      },
      toast: {
        borderRadius: '4px',
        variants: {
          success: {
            background: colors.status.success,
            color: colors.text.primary,
          },
          error: {
            background: colors.status.error,
            color: colors.text.primary,
          },
          warning: {
            background: colors.status.warning,
            color: colors.text.primary,
          },
          info: {
            background: colors.status.info,
            color: colors.text.primary,
          },
        },
      },
    },

    // Layout
    spacing: {
      unit: 8,
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    
    // Breakpoints
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
    },

    // Z-index
    zIndex: {
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
      toast: 1600,
    },
  } as const;
};

export type Theme = ReturnType<typeof createThemeConfig>;
export const createTheme = createThemeConfig;

// Re-export other theme-related types
export * from './colors';
export * from './typography';
