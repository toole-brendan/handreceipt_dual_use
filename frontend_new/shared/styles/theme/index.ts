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
        secondary: isDark ? '#1e1e1e' : colors.background.paper,
        elevated: isDark ? '#2d2d2d' : colors.neutral.white,
      },
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.87)' : colors.text.primary,
        secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : colors.text.secondary,
        disabled: isDark ? 'rgba(255, 255, 255, 0.38)' : colors.text.disabled,
      },
      border: {
        light: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border.light,
        medium: isDark ? 'rgba(255, 255, 255, 0.23)' : colors.border.medium,
        dark: isDark ? 'rgba(255, 255, 255, 0.38)' : colors.border.dark,
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
            background: colors.primary[500],
            color: colors.neutral.white,
            hover: colors.primary[600],
            active: colors.primary[700],
            disabled: colors.primary[200],
          },
          outlined: {
            background: 'transparent',
            border: `1px solid ${colors.primary[500]}`,
            color: colors.primary[500],
            hover: colors.primary[50],
            active: colors.primary[100],
            disabled: colors.neutral.white,
          },
          text: {
            background: 'transparent',
            color: colors.primary[500],
            hover: colors.primary[50],
            active: colors.primary[100],
            disabled: colors.text.disabled,
          },
        },
      },
      card: {
        borderRadius: '8px',
        background: isDark ? '#2d2d2d' : colors.neutral.white,
        border: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border.light,
        shadow: isDark
          ? '0 2px 4px rgba(0, 0, 0, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      input: {
        borderRadius: '4px',
        background: isDark ? '#1e1e1e' : colors.neutral.white,
        border: isDark ? 'rgba(255, 255, 255, 0.23)' : colors.border.medium,
        placeholder: isDark ? 'rgba(255, 255, 255, 0.38)' : colors.text.hint,
        focus: {
          border: colors.primary[500],
          shadow: `0 0 0 2px ${colors.primary[100]}`,
        },
      },
      table: {
        background: isDark ? '#2d2d2d' : colors.neutral.white,
        headerBackground: isDark ? '#1e1e1e' : colors.background.paper,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border.light,
        rowHover: isDark ? '#3d3d3d' : colors.background.paper,
      },
      toast: {
        borderRadius: '4px',
        variants: {
          success: {
            background: colors.success[500],
            color: colors.neutral.white,
          },
          error: {
            background: colors.error[500],
            color: colors.neutral.white,
          },
          warning: {
            background: colors.warning[500],
            color: colors.neutral.white,
          },
          info: {
            background: colors.info[500],
            color: colors.neutral.white,
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
