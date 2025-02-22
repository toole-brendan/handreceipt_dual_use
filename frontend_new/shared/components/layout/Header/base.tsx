import React from 'react';
import { AppBar, styled, Theme, SxProps } from '@mui/material';
import { SystemProps } from '@mui/system';

export interface BaseHeaderProps {
  /** Whether the app is in mobile view */
  isMobile: boolean;
  /** Callback when the drawer toggle button is clicked */
  onDrawerToggle: () => void;
  /** Custom theme overrides */
  themeOverrides?: {
    backgroundColor?: string;
    borderColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
  };
  /** Custom content to render in the header */
  children?: React.ReactNode;
}

interface StyledAppBarProps {
  themeOverrides?: BaseHeaderProps['themeOverrides'];
  theme?: Theme;
}

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop: string) => prop !== 'themeOverrides'
})<StyledAppBarProps>(({ themeOverrides, theme }: StyledAppBarProps) => ({
  backgroundColor: themeOverrides?.backgroundColor || 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${themeOverrides?.borderColor || 'rgba(255, 255, 255, 0.1)'}`,
  boxShadow: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(180deg, ${themeOverrides?.gradientStart || 'rgba(255, 255, 255, 0.02)'} 0%, ${themeOverrides?.gradientEnd || 'rgba(255, 255, 255, 0)'} 100%)`,
    pointerEvents: 'none',
  },
}));

export const BaseHeader: React.FC<BaseHeaderProps> = ({
  isMobile,
  onDrawerToggle,
  themeOverrides,
  children,
}) => {
  return (
    <StyledAppBar
      position="fixed"
      elevation={0}
      themeOverrides={themeOverrides}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      {children}
    </StyledAppBar>
  );
};
