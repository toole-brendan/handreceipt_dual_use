import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.2)',
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '8rem',
            fontWeight: 700,
            color: 'primary.main',
            mb: 2,
            letterSpacing: '-0.05em',
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
          <br />
          <code style={{ opacity: 0.7 }}>{location.pathname}</code>
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Home size={16} />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Go Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
