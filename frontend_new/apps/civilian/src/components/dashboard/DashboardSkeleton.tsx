import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Title Skeleton */}
      <Skeleton variant="text" width={300} height={40} sx={{ mb: 3 }} />

      {/* Stats Bar Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Main Content Skeleton */}
      <Grid container spacing={3}>
        {/* Inventory Health Card Skeleton */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={400} />
        </Grid>

        {/* Order Timeline Skeleton */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={400} />
        </Grid>

        {/* Quick Actions Card Skeleton */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={300} />
        </Grid>

        {/* Smart Contract Alerts Card Skeleton */}
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={300} />
        </Grid>

        {/* Supply Chain Map Skeleton */}
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={300} />
        </Grid>
      </Grid>

      {/* Welcome Text Skeleton */}
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </Box>
    </Box>
  );
};

export default DashboardSkeleton;
