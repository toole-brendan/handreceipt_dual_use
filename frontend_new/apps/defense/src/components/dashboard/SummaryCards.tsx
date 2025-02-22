import React from 'react';
import { Box, Card, Stack, Typography, LinearProgress, styled, Chip } from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assignment as PendingIcon,
  Speed as ReadinessIcon,
  Warning as ShortageIcon,
} from '@mui/icons-material';

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  value: string | number;
  subtitle?: string;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'error';
}

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  icon,
  value,
  subtitle,
  progress,
  trend,
  status = 'success',
}) => (
  <StyledCard>
    <CardHeader>
      <Box sx={{ color: `${status}.main` }}>{icon}</Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
    </CardHeader>
    <Typography variant="h4" component="div">
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
    {progress !== undefined && (
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={status}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    )}
    {trend && (
      <Box sx={{ mt: 1 }}>
        <Chip
          size="small"
          label={trend === 'up' ? '↑ Increasing' : trend === 'down' ? '↓ Decreasing' : '→ Stable'}
          color={trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'default'}
          sx={{ borderRadius: 1 }}
        />
      </Box>
    )}
  </StyledCard>
);

interface SummaryCardsProps {
  assignedProperty: {
    total: number;
    serviceable: number;
  };
  pendingActions: number;
  readinessStatus: {
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  };
  criticalShortages: {
    count: number;
    mostCritical: string;
  };
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  assignedProperty,
  pendingActions,
  readinessStatus,
  criticalShortages,
}) => {
  const cards: SummaryCardProps[] = [
    {
      title: 'Assigned Property',
      icon: <InventoryIcon />,
      value: `${assignedProperty.serviceable}/${assignedProperty.total}`,
      subtitle: 'Items Serviceable',
      progress: (assignedProperty.serviceable / assignedProperty.total) * 100,
      status: assignedProperty.serviceable / assignedProperty.total > 0.8 ? 'success' : 'warning',
    },
    {
      title: 'Pending Actions',
      icon: <PendingIcon />,
      value: pendingActions,
      subtitle: 'Tasks Requiring Attention',
      status: pendingActions > 5 ? 'error' : pendingActions > 2 ? 'warning' : 'success',
    },
    {
      title: 'Readiness Status',
      icon: <ReadinessIcon />,
      value: `${readinessStatus.percentage}%`,
      subtitle: 'Combat Ready',
      progress: readinessStatus.percentage,
      trend: readinessStatus.trend,
      status: readinessStatus.percentage > 80 ? 'success' : 'warning',
    },
    {
      title: 'Critical Supply Shortages',
      icon: <ShortageIcon />,
      value: criticalShortages.count,
      subtitle: `Most Critical: ${criticalShortages.mostCritical}`,
      status: criticalShortages.count > 0 ? 'error' : 'success',
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            minWidth: 'min-content',
            px: 2,
          }}
        >
          {cards.map((card, index) => (
            <SummaryCard key={index} {...card} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default SummaryCards;
