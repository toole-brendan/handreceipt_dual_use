import React from 'react';
import { Grid, Card, Stack, Typography } from '@mui/material';
import { MetricsChart } from '@shared/components/common/charts';
import { useProperty } from '../../../hooks/useProperty';

export const PropertySummaryCards: React.FC = () => {
  const {
    summary,
    upcomingInspections,
    serviceableItems,
    partiallyServiceableItems,
    unserviceableItems,
  } = useProperty();

  const readinessData = [
    { label: 'FMC', value: serviceableItems.length, color: '#4CAF50' },
    { label: 'PMC', value: partiallyServiceableItems.length, color: '#FFD700' },
    { label: 'NMC', value: unserviceableItems.length, color: '#FF3B3B' },
  ];

  const inspectionData = [
    { label: 'Next 7 Days', value: summary.upcomingInspections.next7Days },
    { label: 'Next 30 Days', value: summary.upcomingInspections.next30Days },
  ];

  return (
    <Grid container spacing={3}>
      {/* Total Items Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.secondary">Total Items</Typography>
            <Typography variant="h3">{summary.totalItems}</Typography>
            <Typography variant="body2" color="success.main">
              {summary.serviceableItems} Serviceable
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Equipment Readiness Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.secondary">Equipment Readiness</Typography>
            <Typography variant="h3">
              {Math.round((serviceableItems.length / summary.totalItems) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">FMC Rate</Typography>
            <MetricsChart
              data={readinessData}
              title="Equipment Status"
              height={100}
            />
          </Stack>
        </Card>
      </Grid>

      {/* Upcoming Inspections Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.secondary">Upcoming Inspections</Typography>
            <Typography variant="h3">{upcomingInspections.length}</Typography>
            <Typography variant="body2" color="warning.main">Due This Week</Typography>
            <MetricsChart
              data={inspectionData}
              title="Inspection Schedule"
              height={100}
            />
          </Stack>
        </Card>
      </Grid>

      {/* Disputed Items Card */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="h6" color="text.secondary">Disputed Items</Typography>
            <Typography variant="h3">{summary.disputedItems}</Typography>
            <Typography variant="body2" color="error.main">
              Requires Command Resolution
            </Typography>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};
