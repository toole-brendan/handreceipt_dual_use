import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#121212',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 700, marginBottom: 2 }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: 500, marginBottom: 4 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate(-1)}
        sx={{
          color: '#FFFFFF',
          borderColor: 'rgba(255, 255, 255, 0.23)',
          '&:hover': {
            borderColor: '#FFFFFF',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        Go Back
      </Button>
    </Box>
  );
};

export default NotFoundPage;
