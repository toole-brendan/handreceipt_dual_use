import React from 'react';
import {
  Box,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format } from 'date-fns';

type NotificationType = 'critical' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
  link?: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const getNotificationColor = (theme: any, type: NotificationType) => {
  const colors = {
    critical: theme.palette.error.light,
    warning: theme.palette.warning.light,
    info: theme.palette.info.light,
  };
  return colors[type];
};

const getNotificationIcon = (type: NotificationType) => {
  const icons = {
    critical: <ErrorIcon color="error" />,
    warning: <WarningIcon color="warning" />,
    info: <InfoIcon color="info" />,
  };
  return icons[type];
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications }) => {
  return (
    <StyledCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Notifications
        </Typography>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          ({notifications.length})
        </Typography>
      </Box>

      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            sx={(theme) => ({
              borderRadius: theme.shape.borderRadius,
              marginBottom: theme.spacing(1),
              backgroundColor: getNotificationColor(theme, notification.type),
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              cursor: 'pointer',
            })}
            onClick={() => notification.link && window.location.assign(notification.link)}
          >
            <ListItemIcon>
              {getNotificationIcon(notification.type)}
            </ListItemIcon>
            <ListItemText
              primary={notification.message}
              secondary={format(new Date(notification.timestamp), 'MM/dd/yyyy HH:mm')}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: notification.type === 'critical' ? 'bold' : 'normal',
              }}
            />
            {notification.link && (
              <IconButton size="small">
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>

      {notifications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
        </Box>
      )}
    </StyledCard>
  );
}; 