import React from 'react';
import { Box, Typography } from '@mui/material';
import { Settings } from '@/features/settings/components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h4">
        Settings
      </Typography>
      <Settings />
    </Box>
  );
};

export default SettingsPage;
