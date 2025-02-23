import React from 'react';
import { Box, Grid, Typography, styled } from '@mui/material';
import { 
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  SwapHoriz as SwapHorizIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';

interface MetricCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  delay?: number;
}

const StyledMetricCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color' && prop !== 'delay',
})<{ color: string; delay: number }>(({ theme, color, delay }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.2s ease',
  opacity: 0,
  animation: 'fadeSlideUp 0.6s forwards',
  animationDelay: `${delay}ms`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '@keyframes fadeSlideUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)'
    }
  }
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ theme, color }) => ({
  backgroundColor: `${color}1A`, // 10% opacity
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const MetricValue = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  fontWeight: 500,
  color: theme.palette.text.primary,
  letterSpacing: '0.02em',
}));

const MetricLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 500,
  fontSize: '0.75rem',
}));

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, color, delay = 0 }) => (
  <StyledMetricCard color={color} delay={delay}>
    <IconWrapper color={color}>
      {React.cloneElement(icon as React.ReactElement, { 
        sx: { color, fontSize: 24 } 
      })}
    </IconWrapper>
    <MetricValue variant="h3">
      {value}
    </MetricValue>
    <MetricLabel variant="body2">
      {label}
    </MetricLabel>
  </StyledMetricCard>
);

interface KeyMetricsCardsProps {
  stats: {
    total: number;
    serviceableItems: number;
    maintenanceNeeded: number;
    pendingTransfers: number;
    overdueItems: number;
  };
}

export const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ stats }) => {
  const metrics = [
    {
      icon: <InventoryIcon />,
      value: stats.total,
      label: 'Total Property Items',
      color: '#2196F3',
      delay: 0
    },
    {
      icon: <CheckCircleIcon />,
      value: stats.serviceableItems,
      label: 'Items in Good Condition',
      color: '#4CAF50',
      delay: 100
    },
    {
      icon: <BuildIcon />,
      value: stats.maintenanceNeeded,
      label: 'Items Needing Maintenance',
      color: '#FFC107',
      delay: 200
    },
    {
      icon: <SwapHorizIcon />,
      value: stats.pendingTransfers,
      label: 'Pending Transfers',
      color: '#9C27B0',
      delay: 300
    },
    {
      icon: <WarningIcon />,
      value: stats.overdueItems,
      label: 'Overdue Maintenance',
      color: '#F44336',
      delay: 400
    }
  ];

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <MetricCard {...metric} />
        </Grid>
      ))}
    </Grid>
  );
}; 