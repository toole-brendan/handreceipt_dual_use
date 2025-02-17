import React from 'react';
import { Box, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { Activity, Package, Truck, MapPin, Bell, Shield } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { formatDistanceToNow } from 'date-fns';

interface DashboardActivity {
  id: string;
  type: 'product' | 'shipment' | 'location' | 'alert' | 'security';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

interface DashboardActivityCardProps {
  title: string;
  activities: DashboardActivity[];
  loading?: boolean;
  onViewAll?: () => void;
}

const getActivityIcon = (type: DashboardActivity['type']) => {
  switch (type) {
    case 'product':
      return <Package size={20} />;
    case 'shipment':
      return <Truck size={20} />;
    case 'location':
      return <MapPin size={20} />;
    case 'alert':
      return <Bell size={20} />;
    case 'security':
      return <Shield size={20} />;
    default:
      return <Activity size={20} />;
  }
};

const getStatusColor = (theme: any, status?: 'success' | 'warning' | 'error') => {
  switch (status) {
    case 'success':
      return theme.palette.success.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'error':
      return theme.palette.error.main;
    default:
      return theme.palette.primary.main;
  }
};

const ActivitySkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </Box>
  </Box>
);

const DashboardActivityCard: React.FC<DashboardActivityCardProps> = ({
  title,
  activities,
  loading = false,
  onViewAll
}) => {
  const theme = useTheme();

  return (
    <DashboardCard
      title={title}
      loading={loading}
      onClick={onViewAll}
      variant="outlined"
    >
      <Box sx={{ width: '100%' }}>
        {loading ? (
          <>
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </>
        ) : (
          activities.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 3,
                '&:last-child': { mb: 0 }
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                bgcolor: alpha(getStatusColor(theme, activity.status), 0.1),
                color: getStatusColor(theme, activity.status),
                  mr: 2,
                  flexShrink: 0
                }}
              >
                {getActivityIcon(activity.type)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  {activity.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {activity.description}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </DashboardCard>
  );
};

export default DashboardActivityCard;
