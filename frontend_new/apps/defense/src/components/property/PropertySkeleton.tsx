import React from 'react';
import { Box, Card, Grid, Skeleton, Stack } from '@mui/material';

export const PropertySkeleton: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={3}>
        {/* Header Skeleton */}
        <Box>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={24} sx={{ mt: 1 }} />
        </Box>

        {/* Summary Cards Skeleton */}
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={80} height={40} />
                  <Skeleton variant="text" width={160} height={20} />
                  <Skeleton variant="rectangular" height={100} />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Equipment Grid Skeleton */}
        <Card>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Skeleton variant="rectangular" width={100} height={32} />
          </Box>
          <Grid container spacing={2} sx={{ p: 2 }}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Skeleton variant="rectangular" height={200} />
                    <Stack spacing={1}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={20} />
                      <Skeleton variant="rectangular" width={80} height={24} />
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Skeleton variant="rectangular" width={100} height={32} />
                      <Skeleton variant="rectangular" width={100} height={32} />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>

        {/* Quick Transfer Skeleton */}
        <Card>
          <Stack spacing={2} sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={400} height={24} />
            <Skeleton variant="rectangular" height={56} />
          </Stack>
        </Card>

        {/* Item Detail Panel Skeleton */}
        <Card>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Skeleton variant="text" width={300} height={32} />
                <Skeleton variant="rectangular" width={100} height={32} />
              </Stack>
              <Stack spacing={1}>
                <Skeleton variant="text" width={200} height={24} />
                <Skeleton variant="text" width={240} height={24} />
                <Skeleton variant="text" width={180} height={24} />
              </Stack>
            </Stack>
          </Box>
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              {[...Array(3)].map((_, index) => (
                <Card key={index} sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Skeleton variant="text" width={200} height={24} />
                    <Skeleton variant="text" width={300} height={20} />
                    <Skeleton variant="text" width={240} height={20} />
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Box>
        </Card>

        {/* Compliance Status Skeleton */}
        <Card>
          <Stack spacing={3} sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Stack spacing={2}>
              {[...Array(2)].map((_, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Skeleton variant="text" width={120} height={20} />
                    <Skeleton variant="text" width={80} height={20} />
                  </Stack>
                  <Skeleton variant="rectangular" height={8} />
                </Box>
              ))}
            </Stack>
            <Box>
              <Skeleton variant="text" width={160} height={24} />
              <Stack spacing={2} sx={{ mt: 2 }}>
                {[...Array(3)].map((_, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width={200} height={20} />
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
};
