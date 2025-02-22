import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import DashboardCard from './DashboardCard';

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  loading?: boolean;
  minHeight?: number | string;
  action?: React.ReactNode;
  legend?: React.ReactNode;
}

const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  subtitle,
  chart,
  loading = false,
  minHeight = 300,
  action,
  legend
}) => {
  return (
    <DashboardCard
      title={title}
      subtitle={subtitle}
      loading={loading}
      minHeight={minHeight}
      action={action}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          flex: 1, 
          position: 'relative',
          height: minHeight,
          '& > div': {
            height: '100% !important', // Force ResponsiveContainer to take full height
          }
        }}>
          {loading ? (
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              p: 2
            }}>
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height="calc(100% - 60px)" />
            </Box>
          ) : (
            chart
          )}
        </Box>
        {legend && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            {legend}
          </Box>
        )}
      </Box>
    </DashboardCard>
  );
};

export default DashboardChartCard;
