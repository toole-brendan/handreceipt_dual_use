import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import type { MetricsData, MetricItem } from '../../types';

interface MetricCardProps {
  title: string;
  metric: MetricItem;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metric,
  icon,
  color,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              backgroundColor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 1 }}>
          {metric.value}
        </Typography>

        {metric.change && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {metric.change.isPositive ? (
              <TrendingUp
                size={16}
                color={theme.palette.success.main}
                style={{ marginRight: 4 }}
              />
            ) : (
              <TrendingDown
                size={16}
                color={theme.palette.error.main}
                style={{ marginRight: 4 }}
              />
            )}
            <Typography
              variant="body2"
              color={metric.change.isPositive ? 'success.main' : 'error.main'}
              sx={{ mr: 1 }}
            >
              {metric.change.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.change.timeframe}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const TransferMetrics: React.FC<MetricsData> = ({
  pendingApprovals,
  processingTime,
  completedToday,
  approvalRate,
}) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Pending Approvals"
          metric={pendingApprovals}
          icon={<AlertCircle size={24} />}
          color={theme.palette.warning.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Processing Time"
          metric={processingTime}
          icon={<Clock size={24} />}
          color={theme.palette.info.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Completed Today"
          metric={completedToday}
          icon={<CheckCircle size={24} />}
          color={theme.palette.success.main}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Approval Rate"
          metric={approvalRate}
          icon={<BarChart2 size={24} />}
          color={theme.palette.primary.main}
        />
      </Grid>
    </Grid>
  );
};
