import React from 'react';
import { styled } from '@mui/material/styles';

const StyledSkipLink = styled('a')(({ theme }) => ({
  position: 'absolute',
  left: -9999,
  top: 'auto',
  width: 1,
  height: 1,
  overflow: 'hidden',
  zIndex: theme.zIndex.modal + 1,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
  textDecoration: 'none',
  fontWeight: 500,
  '&:focus': {
    position: 'fixed',
    top: theme.spacing(1),
    left: theme.spacing(1),
    width: 'auto',
    height: 'auto',
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

const SkipLink: React.FC = () => {
  return (
    <StyledSkipLink href="#main">
      Skip to main content
    </StyledSkipLink>
  );
};

export default SkipLink;
