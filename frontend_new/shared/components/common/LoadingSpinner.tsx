import React from 'react';
import { Box, keyframes, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  color,
  centered = false 
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.palette.primary.main;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        border: `2px solid ${alpha(spinnerColor, 0.1)}`,
        borderTopColor: alpha(spinnerColor, 0.7),
        borderRadius: '50%',
        animation: `${spin} 0.8s linear infinite`,
        ...(centered && {
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        })
      }}
    />
  );
};

export const CenteredLoadingSpinner: React.FC<Omit<LoadingSpinnerProps, 'centered'>> = (props) => (
  <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 100 }}>
    <LoadingSpinner {...props} centered />
  </Box>
);
