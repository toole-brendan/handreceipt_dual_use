import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingFallbackProps {
  message?: string;
  size?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading...',
  size = 40,
  color = 'primary'
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={200}
      gap={2}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Box
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Box>
      )}
    </Box>
  );
};

export default LoadingFallback;
