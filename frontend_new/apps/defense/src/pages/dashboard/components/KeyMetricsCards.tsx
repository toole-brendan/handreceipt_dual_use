import React from 'react';
import { Box, Grid, Typography, alpha } from '@mui/material';
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

const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label, color, delay = 0 }) => (
  <Box
    sx={{
      backgroundColor: alpha('#1E1E1E', 0.6),
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 1,
      p: 3,
      height: '100%',
      transition: 'all 0.2s ease',
      opacity: 0,
      animation: 'fadeSlideUp 0.6s forwards',
      animationDelay: `${delay}ms`,
      '&:hover': {
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
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
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          backgroundColor: alpha(color, 0.1),
          borderRadius: 1,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {React.cloneElement(icon as React.ReactElement, { 
          sx: { color, fontSize: 24 } 
        })}
      </Box>
    </Box>
    <Typography 
      variant="h3" 
      sx={{ 
        mb: 1,
        fontWeight: 500,
        color: '#FFFFFF',
        letterSpacing: '0.02em'
      }}
    >
      {value}
    </Typography>
    <Typography 
      variant="body2" 
      sx={{ 
        color: alpha('#FFFFFF', 0.7),
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 500,
        fontSize: '0.75rem'
      }}
    >
      {label}
    </Typography>
  </Box>
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