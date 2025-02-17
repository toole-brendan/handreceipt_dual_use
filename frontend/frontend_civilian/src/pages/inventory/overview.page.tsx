import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardMetricCard from '@/components/common/DashboardMetricCard';
import DashboardChartCard from '@/components/common/DashboardChartCard';

const InventoryOverview: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Overview
      </Typography>
      
      <Grid container spacing={3}>
        {/* Metrics */}
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Total Products"
            value="1,234"
            trend={{
              value: 5,
              isUpward: true,
              label: "from last month"
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Low Stock Items"
            value="23"
            trend={{
              value: 2,
              isUpward: false,
              label: "from last week"
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Out of Stock"
            value="7"
            trend={{
              value: 1,
              isUpward: true,
              label: "from yesterday"
            }}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <DashboardChartCard
            title="Inventory Levels Over Time"
            subtitle="Last 30 days"
            chart={<Box sx={{ height: 300 }}>Chart will go here</Box>}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardChartCard
            title="Stock Distribution"
            subtitle="By category"
            chart={<Box sx={{ height: 300 }}>Chart will go here</Box>}
          />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <DashboardCard title="Recent Inventory Changes">
            <Typography>Activity feed will go here</Typography>
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryOverview;
