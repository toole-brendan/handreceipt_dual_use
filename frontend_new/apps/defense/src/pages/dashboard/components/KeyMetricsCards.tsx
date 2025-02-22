import React from 'react';
import { Box, Card, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import WarningIcon from '@mui/icons-material/Warning';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
}

const StyledCard = styled(Card)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor || theme.palette.background.paper,
  transition: 'transform 0.2s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, bgColor }) => (
  <StyledCard bgcolor={bgColor}>
    <Box sx={{ color, mb: 1 }}>{icon}</Box>
    <Typography variant="h4" component="div" sx={{ color, fontWeight: 'bold', mb: 1 }}>
      {value}
    </Typography>
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
  </StyledCard>
);

interface PropertyStats {
  totalItems: number;
  serviceableItems: number;
  maintenanceNeeded: number;
  pendingTransfers: number;
  overdueItems: number;
}

interface KeyMetricsCardsProps {
  stats: PropertyStats;
}

export const KeyMetricsCards: React.FC<KeyMetricsCardsProps> = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={2.4}>
        <MetricCard
          title="Total Property Items"
          value={stats.totalItems}
          icon={<InventoryIcon sx={{ fontSize: 40 }} />}
          color="#1976d2"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <MetricCard
          title="Items in Good Condition"
          value={`${Math.round((stats.serviceableItems / stats.totalItems) * 100)}%`}
          icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
          color="#2e7d32"
          bgColor="#e8f5e9"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <MetricCard
          title="Items Needing Maintenance"
          value={stats.maintenanceNeeded}
          icon={<BuildIcon sx={{ fontSize: 40 }} />}
          color="#ed6c02"
          bgColor="#fff3e0"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <MetricCard
          title="Pending Transfers"
          value={stats.pendingTransfers}
          icon={<SwapHorizIcon sx={{ fontSize: 40 }} />}
          color="#0288d1"
          bgColor="#e1f5fe"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={2.4}>
        <MetricCard
          title="Overdue Maintenance"
          value={stats.overdueItems}
          icon={<WarningIcon sx={{ fontSize: 40 }} />}
          color="#d32f2f"
          bgColor="#ffebee"
        />
      </Grid>
    </Grid>
  );
}; 