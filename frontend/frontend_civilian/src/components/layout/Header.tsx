/* frontend/src/components/layout/Header.tsx */

import React from 'react';
import { AppBar, styled } from '@mui/material';
import { AppBarContent } from './mui/AppBarContent';

interface HeaderProps {
  isMobile: boolean;
  onDrawerToggle: () => void;
}

const StyledAppBar = styled(AppBar)(() => ({
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none',
  },
}));

const Header: React.FC<HeaderProps> = ({ isMobile, onDrawerToggle }) => {
  return (
    <StyledAppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <AppBarContent isMobile={isMobile} onDrawerToggle={onDrawerToggle} />
    </StyledAppBar>
  );
};

export default Header;
