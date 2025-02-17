import type { Theme as MuiTheme } from '@mui/material/styles';

export interface CustomThemeColors {
  status: {
    verified: string;
    pending: string;
    sensitive: string;
    inactive: string;
  };
  glass: {
    light: string;
    medium: string;
    dark: string;
  };
}

declare module '@mui/material/styles' {
  interface Theme {
    custom: CustomThemeColors;
  }

  interface ThemeOptions {
    custom?: CustomThemeColors;
  }
}

export type CustomTheme = MuiTheme & {
  custom: CustomThemeColors;
};
