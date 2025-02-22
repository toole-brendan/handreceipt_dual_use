import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricsData } from '@/features/transfers/types';

const MetricsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const MetricBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 255, 255, 0.05)',
}));

const StatusBadge = styled('span')<{ color?: string }>(({ color = '#4CAF50' }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 500,
  color: color,
  border: `1px solid ${color}`,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}));

const TransferMetrics: React.FC<MetricsData> = (props) => {
  return (
    <MetricsGrid>
      <MetricBox>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pending Approvals
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
            {props.pendingApprovals.value}
          </Typography>
          <StatusBadge sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)', color: '#FFD700', borderColor: '#FFD700' }}>
            ACTION REQUIRED
          </StatusBadge>
        </Box>
        {props.pendingApprovals.change && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {props.pendingApprovals.change.value} {props.pendingApprovals.change.timeframe}
          </Typography>
        )}
      </MetricBox>

      <MetricBox>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Processing Time
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
            {props.processingTime.value}
          </Typography>
          <StatusBadge sx={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
            TRACKED
          </StatusBadge>
        </Box>
        {props.processingTime.change && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {props.processingTime.change.value} {props.processingTime.change.timeframe}
          </Typography>
        )}
      </MetricBox>

      <MetricBox>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Completed Today
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
            {props.completedToday.value}
          </Typography>
          {props.completedToday.change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: props.completedToday.change.isPositive ? '#4CAF50' : '#FF3B3B' }}>
              {props.completedToday.change.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <Typography variant="caption">
                {props.completedToday.change.value}
              </Typography>
            </Box>
          )}
        </Box>
        {props.completedToday.change && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {props.completedToday.change.timeframe}
          </Typography>
        )}
      </MetricBox>

      <MetricBox>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Approval Rate
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 400, color: '#FFFFFF', letterSpacing: '0.02em' }}>
            {props.approvalRate.value}
          </Typography>
          {props.approvalRate.change && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: props.approvalRate.change.isPositive ? '#4CAF50' : '#FF3B3B' }}>
              {props.approvalRate.change.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <Typography variant="caption">
                {props.approvalRate.change.value}
              </Typography>
            </Box>
          )}
        </Box>
        {props.approvalRate.change && (
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {props.approvalRate.change.timeframe}
          </Typography>
        )}
      </MetricBox>
    </MetricsGrid>
  );
};

export default TransferMetrics;
