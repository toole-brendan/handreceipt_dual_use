export const fontFamilies = {
  primary: '"Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", monospace',
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.bold,
    fontSize: '2rem', // 32px
    lineHeight: 1.3,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.semibold,
    fontSize: '1.75rem', // 28px
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.semibold,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '1.125rem', // 18px
    lineHeight: 1.5,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    letterSpacing: '-0.005em',
  },
  subtitle1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  body1: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  body2: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0.01em',
  },
  button: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
    textTransform: 'none' as const,
  },
  caption: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.regular,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  overline: {
    fontFamily: fontFamilies.primary,
    fontWeight: fontWeights.medium,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  code: {
    fontFamily: fontFamilies.mono,
    fontWeight: fontWeights.regular,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
} as const;

export type Typography = typeof typography;
export type FontFamily = typeof fontFamilies;
export type FontWeight = typeof fontWeights;
