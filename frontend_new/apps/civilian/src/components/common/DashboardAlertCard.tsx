import React from 'react';
import { Box, Typography, Skeleton, alpha, IconButton, Tooltip, useTheme } from '@mui/material';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import DashboardCard from './DashboardCard';
import { formatDistanceToNow } from 'date-fns';

interface DashboardAlert {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  onDismiss?: () => void;
}

interface DashboardAlertCardProps {
  title: string;
  alerts: DashboardAlert[];
  loading?: boolean;
  onViewAll?: () => void;
}

const getAlertIcon = (type: DashboardAlert['type']) => {
  switch (type) {
    case 'error':
      return <XCircle size={20} />;
    case 'warning':
      return <AlertTriangle size={20} />;
    case 'success':
      return <CheckCircle size={20} />;
    case 'info':
      return <Info size={20} />;
    default:
      return <Info size={20} />;
  }
};

const getAlertColor = (theme: any, type: DashboardAlert['type']) => {
  switch (type) {
    case 'error':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'success':
      return theme.palette.success.main;
    case 'info':
      return theme.palette.info.main;
    default:
      return theme.palette.primary.main;
  }
};

const AlertSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    <Skeleton variant="circular" width={40} height={40} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
    </Box>
  </Box>
);

const DashboardAlertCard: React.FC<DashboardAlertCardProps> = ({
  title,
  alerts,
  loading = false,
  onViewAll
}) => {
  const theme = useTheme();

  return (
    <DashboardCard
      title={title}
      loading={loading}
      onClick={onViewAll}
      variant="alert"
    >
      <Box sx={{ width: '100%' }}>
        {loading ? (
          <>
            <AlertSkeleton />
            <AlertSkeleton />
            <AlertSkeleton />
          </>
        ) : (
          alerts.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 3,
                '&:last-child': { mb: 0 },
                opacity: alert.read ? 0.7 : 1,
                transition: 'opacity 0.2s ease-in-out'
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
                  bgcolor: alpha(getAlertColor(theme, alert.type), 0.1),
                  color: getAlertColor(theme, alert.type),
                  mr: 2,
                  flexShrink: 0
                }}
              >
                {getAlertIcon(alert.type)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      fontWeight: 600, 
                      mb: 0.5,
                      color: getAlertColor(theme, alert.type)
                    }}
                  >
                    {alert.title}
                  </Typography>
                  {alert.onDismiss && (
                    <Tooltip title="Dismiss">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert.onDismiss?.();
                        }}
                        sx={{ 
                          ml: 1,
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'text.primary'
                          }
                        }}
                      >
                        <X size={16} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {alert.message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </DashboardCard>
  );
};

export default DashboardAlertCard;
