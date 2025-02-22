import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Error Loading Data',
  message = 'There was a problem loading the requested information. Please try again.',
  onRetry,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        p: 3,
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <ErrorIcon
          color="error"
          sx={{
            fontSize: 64,
          }}
        />
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        )}
      </Stack>
    </Box>
  );
};
