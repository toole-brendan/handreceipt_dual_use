import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingFallback: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px'
    }}
  >
    <CircularProgress />
  </Box>
);

interface LoadingWrapperProps {
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default LoadingWrapper;
