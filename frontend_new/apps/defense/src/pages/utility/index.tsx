import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { DashboardCard } from '../../components/common';

const UtilityPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Defense Utilities
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: '#121212', 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              System Metrics
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 3 }}>
              <DashboardCard title="System Status">
                <Typography variant="h6" color="success.main">
                  Operational
                </Typography>
              </DashboardCard>

              <DashboardCard title="Active Users">
                <Typography variant="h6">
                  0
                </Typography>
              </DashboardCard>

              <DashboardCard title="Security Level">
                <Typography variant="h6" color="warning.main">
                  Level 3
                </Typography>
              </DashboardCard>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: '#121212', 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              System Logs
            </Typography>

            <Box sx={{ 
              bgcolor: '#1A1A1A', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: 'rgba(255, 255, 255, 0.7)',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <pre>No logs available</pre>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UtilityPage;
