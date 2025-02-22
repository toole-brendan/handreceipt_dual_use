import React from 'react';
import { Box, Typography, IconButton, alpha } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'high':
      return '#F44336';
    case 'medium':
      return '#FFC107';
    case 'low':
      return '#4CAF50';
    default:
      return '#9E9E9E';
  }
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications }) => {
  return (
    <Box
      sx={{
        backgroundColor: alpha('#1E1E1E', 0.6),
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 1,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon sx={{ color: alpha('#FFFFFF', 0.7) }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            Notifications
          </Typography>
          <Typography
            variant="caption"
            sx={{
              backgroundColor: alpha('#FFFFFF', 0.1),
              color: alpha('#FFFFFF', 0.7),
              px: 1,
              py: 0.5,
              borderRadius: 1,
              ml: 1,
            }}
          >
            {notifications.length}
          </Typography>
        </Box>
      </Box>

      {/* Notifications List */}
      <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.map((notification, index) => (
          <Box
            key={notification.id}
            sx={{
              p: 2,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.2s ease',
              animation: 'fadeIn 0.3s ease forwards',
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              '&:hover': {
                backgroundColor: alpha('#FFFFFF', 0.05),
              },
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CircleIcon
                sx={{
                  color: getNotificationColor(notification.type),
                  fontSize: 12,
                  mt: 0.5,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 500,
                    mb: 0.5,
                    lineHeight: 1.4,
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha('#FFFFFF', 0.5),
                    fontSize: '0.75rem',
                  }}
                >
                  {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                </Typography>
              </Box>
              <IconButton
                size="small"
                sx={{
                  color: alpha('#FFFFFF', 0.5),
                  '&:hover': {
                    color: '#FFFFFF',
                    backgroundColor: alpha('#FFFFFF', 0.1),
                  },
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: alpha('#FFFFFF', 0.7),
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#FFFFFF',
            },
          }}
        >
          View All Notifications
        </Typography>
      </Box>
    </Box>
  );
}; 