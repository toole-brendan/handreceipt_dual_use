import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';

const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Critical Alerts Banner Skeleton */}
      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />

      {/* Quick Action Bar Skeleton */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={150} height={40} />
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards Skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                width={280}
                height={120}
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Box>
        </Grid>

        {/* Map Component Skeleton */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Grid>

        {/* Priority Widgets Skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="50%" height={300} />
            <Skeleton variant="rectangular" width="50%" height={300} />
          </Box>
        </Grid>

        {/* Equipment Readiness Chart Skeleton */}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Grid>

        {/* Chain of Custody Feed Skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={40} />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={80} />
            ))}
          </Box>
        </Grid>

        {/* Role-Based Widgets Skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={60} />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={100} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;
