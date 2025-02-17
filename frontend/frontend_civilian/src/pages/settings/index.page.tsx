import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Settings } from '@/features/settings/components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure your application settings and preferences
        </Typography>
        <Settings />
      </Box>
    </Container>
  );
};

export default SettingsPage;
