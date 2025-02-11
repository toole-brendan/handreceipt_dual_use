import { Box, Container, Grid, Stack } from '@mui/material';
import { AppBarContent } from './layout/mui/AppBarContent';
import { Spacer } from './layout/mui/Spacer';

// Re-export MUI components
export { Box, Container, Grid, Stack };

// Export custom layout components
export { AppBarContent, Spacer };

// Export types
export type {
  BoxProps,
  ContainerProps,
  GridProps,
  StackProps
} from '@mui/material';
