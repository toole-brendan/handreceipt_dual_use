import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import DashboardPage from './DashboardPage';
import { mockDashboardData } from './mockData';

const DashboardDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleViewAllActivities = () => {
    console.log('View all activities clicked');
  };

  const handleViewAllAlerts = () => {
    console.log('View all alerts clicked');
  };

  return (
    <Container maxWidth={false} disableGutters>
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 1,
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              Supply Chain Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 'md' }}
            >
              Real-time overview of inventory, shipments, and supply chain activities
            </Typography>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <DashboardPage
          data={mockDashboardData}
          loading={loading}
          onViewAllActivities={handleViewAllActivities}
          onViewAllAlerts={handleViewAllAlerts}
        />
      </Container>
    </Container>
  );
};

export default DashboardDemo;
