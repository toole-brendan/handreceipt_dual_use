import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { ReportType, ReportMetrics as ReportMetricsType } from '../../types';

interface MetricCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    timeframe: string;
    isPositive: boolean;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
      {value}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {change.isPositive ? (
        <ArrowUpRight size={16} color="success.main" />
      ) : (
        <ArrowDownRight size={16} color="error.main" />
      )}
      <Typography
        variant="body2"
        color={change.isPositive ? 'success.main' : 'error.main'}
        component="span"
      >
        {change.value}
      </Typography>
      <Typography variant="body2" color="text.secondary" component="span">
        {change.timeframe}
      </Typography>
    </Box>
  </Paper>
);

interface ReportMetricsProps {
  type: ReportType;
  metrics: ReportMetricsType[keyof ReportMetricsType];
}

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ type, metrics }) => {
  const getMetricCards = () => {
    switch (type) {
      case 'inventory':
        return [
          { key: 'totalItems', title: 'Total Items' },
          { key: 'itemsInGoodCondition', title: 'Items in Good Condition' },
          { key: 'itemsNeedingMaintenance', title: 'Items Needing Maintenance' },
          { key: 'criticalItems', title: 'Critical Items' },
        ];
      case 'transfers':
        return [
          { key: 'totalTransfers', title: 'Total Transfers' },
          { key: 'pendingApprovals', title: 'Pending Approvals' },
          { key: 'awaitingConfirmations', title: 'Awaiting Confirmations' },
          { key: 'completedTransfers', title: 'Completed Transfers' },
        ];
      case 'maintenance':
        return [
          { key: 'scheduledTasks', title: 'Scheduled Tasks' },
          { key: 'inProgressTasks', title: 'In Progress Tasks' },
          { key: 'completedTasks', title: 'Completed Tasks' },
          { key: 'overdueTasks', title: 'Overdue Tasks' },
        ];
      default:
        return [];
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={3}>
        {getMetricCards().map(({ key, title }) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <MetricCard
              title={title}
              value={metrics[key as keyof typeof metrics].value}
              change={metrics[key as keyof typeof metrics].change}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 