import { createTheme } from '@mui/material/styles';
import { colors } from '@shared/styles/theme/colors';
import { BaseTheme } from '@shared/styles/theme';

// Defense theme extends the base dark theme with minimal overrides
export const defenseTheme = createTheme({
  ...BaseTheme,
  components: {
    ...BaseTheme.components,
    // Add any defense-specific component overrides here if needed
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.dark,
          borderBottom: `1px solid ${colors.border.light}`,
        },
      },
    },
  },
});
