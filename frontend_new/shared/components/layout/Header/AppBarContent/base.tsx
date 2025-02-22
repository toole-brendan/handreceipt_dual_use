import React from 'react';
import {
  Toolbar,
  IconButton,
  Box,
  Typography,
  useTheme,
  styled,
  Theme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface StyledToolbarProps {
  themeOverrides?: {
    textColor?: string;
    iconColor?: string;
  };
  theme?: Theme;
}

export interface BaseAppBarContentProps {
  /** Whether the app is in mobile view */
  isMobile: boolean;
  /** Callback when the drawer toggle button is clicked */
  onDrawerToggle: () => void;
  /** Custom theme overrides */
  themeOverrides?: {
    textColor?: string;
    iconColor?: string;
  };
  /** User display name to show in the header */
  userDisplayName?: string;
  /** Custom content to render in the toolbar */
  children?: React.ReactNode;
}

const StyledToolbar = styled(Toolbar, {
  shouldForwardProp: (prop: string) => prop !== 'themeOverrides'
})<StyledToolbarProps>(({ theme = useTheme(), themeOverrides }: StyledToolbarProps) => ({
  minHeight: theme?.spacing(8) || '64px',
  color: themeOverrides?.textColor || theme?.palette.text.primary || 'inherit',
  '& .MuiIconButton-root': {
    color: themeOverrides?.iconColor || 'inherit',
  },
}));

export const BaseAppBarContent: React.FC<BaseAppBarContentProps> = ({
  isMobile,
  onDrawerToggle,
  themeOverrides,
  userDisplayName = 'User',
  children,
}) => {
  return (
    <StyledToolbar themeOverrides={themeOverrides}>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          padding: '4px 8px',
          borderRadius: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            {userDisplayName}
          </Typography>
        </Box>
      </Box>
    </StyledToolbar>
  );
};
