import React from 'react';
import { styled } from '@mui/material';

const StyledLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  left: '-9999px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  '&:focus': {
    position: 'fixed',
    top: theme.spacing(2),
    left: theme.spacing(2),
    width: 'auto',
    height: 'auto',
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    zIndex: theme.zIndex.modal + 1,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    outline: `2px solid ${theme.palette.primary.main}`,
  },
}));

const SkipLink: React.FC = () => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      // Remove tabIndex after focus to prevent outline on click
      setTimeout(() => {
        main.removeAttribute('tabindex');
      }, 100);
    }
  };

  return (
    <StyledLink
      href="#main"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e as any)}
    >
      Skip to main content
    </StyledLink>
  );
};

export default SkipLink;
