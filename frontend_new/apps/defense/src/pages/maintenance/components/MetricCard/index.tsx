import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MetricItem } from '../../types';

interface MetricCardProps {
  title: string;
  metric: MetricItem;
  icon: React.ReactNode;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metric,
  icon,
  color,
}) => {
  const { value, change } = metric;
  const { value: changeValue, timeframe, isPositive } = change;

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          bgcolor: color,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 1,
            bgcolor: `${color}15`,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {title}
        </Typography>
      </Box>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        {value}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: isPositive ? 'success.main' : 'error.main',
            mr: 1,
          }}
        >
          {isPositive ? (
            <TrendingUp size={16} />
          ) : (
            <TrendingDown size={16} />
          )}
          <Typography
            variant="body2"
            sx={{
              ml: 0.5,
              fontWeight: 600,
            }}
          >
            {changeValue}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {timeframe}
        </Typography>
      </Box>
    </Paper>
  );
}; 