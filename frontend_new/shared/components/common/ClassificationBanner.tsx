import React from 'react';
import { Box, styled } from '@mui/material';

const BannerContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  textAlign: 'center',
  padding: theme.spacing(0.5),
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontSize: '0.875rem',
  boxShadow: theme.shadows[2],
}));

const ClassificationBanner: React.FC = () => {
  return (
    <BannerContainer>
      SECRET
    </BannerContainer>
  );
};

export default ClassificationBanner;
