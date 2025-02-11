import React from 'react';
import { Box, keyframes } from '@mui/material';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner: React.FC = () => (
  <Box
    sx={{
      width: '24px',
      height: '24px',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderTopColor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      animation: `${spin} 0.8s linear infinite`,
      marginRight: 2,
    }}
  />
);
