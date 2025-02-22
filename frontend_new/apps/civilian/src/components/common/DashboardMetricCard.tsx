import React from 'react';
import { Box, Typography, Tooltip, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isUpward: boolean;
    label: string;
  };
  status?: 'success' | 'warning' | 'error';
  loading?: boolean;
  onClick?: () => void;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  status,
  loading = false,
  onClick
}) => {
  const theme = useTheme();

  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      loading={loading}
      onClick={onClick}
      minHeight={160}
    >
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        position: 'relative'
      }}>
        {status && (
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: status === 'success' ? theme.palette.success.main : 
                      status === 'warning' ? theme.palette.warning.main : 
                      theme.palette.error.main
            }}
          />
        )}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            {value}
          </Typography>

          {trend && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
              <Tooltip title={trend.label}>
                <span>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: trend.isUpward ? theme.palette.success.main : theme.palette.error.main,
                      bgcolor: alpha(trend.isUpward ? theme.palette.success.main : theme.palette.error.main, 0.1),
                      px: 1,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                  {trend.isUpward ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {trend.value}%
                  </Typography>
                  </Box>
                </span>
              </Tooltip>
            </Box>
          )}
        </Box>

        <Box 
          sx={{ 
            mt: 'auto',
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              color: theme.palette.text.primary,
              '& .MuiTypography-root': {
                textDecoration: 'underline'
              }
            } : undefined
          }}
          onClick={onClick}
        >
          <Typography variant="body2">View Details</Typography>
          <ArrowRight size={16} style={{ marginLeft: 4 }} />
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default DashboardMetricCard;
