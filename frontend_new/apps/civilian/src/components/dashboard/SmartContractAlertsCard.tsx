import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { Warning as WarningIcon, AccessTime as TimeIcon } from '@mui/icons-material';

interface SmartContractAlert {
  id: string;
  type: 'expiring' | 'pending_approval' | 'payment_release';
  title: string;
  description: string;
  progress?: number;
  dueDate?: string;
  urgency: 'high' | 'medium' | 'low';
}

interface SmartContractAlertsCardProps {
  alerts: SmartContractAlert[];
}

const getUrgencyColor = (urgency: SmartContractAlert['urgency']) => {
  switch (urgency) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
  }
};

const SmartContractAlertsCard: React.FC<SmartContractAlertsCardProps> = ({ alerts }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Smart Contract Alerts
        </Typography>
        <List>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                }
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ width: '100%', mb: 1 }}
              >
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {alert.title}
                </Typography>
                <Chip
                  size="small"
                  color={getUrgencyColor(alert.urgency)}
                  icon={alert.urgency === 'high' ? <WarningIcon /> : undefined}
                  label={alert.urgency.toUpperCase()}
                />
              </Stack>
              
              <ListItemText
                secondary={alert.description}
                sx={{ width: '100%' }}
              />
              
              {alert.progress !== undefined && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Payment Release Progress
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={alert.progress}
                    color={alert.progress > 66 ? 'success' : 'primary'}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 0.5 }}>
                    {alert.progress}%
                  </Typography>
                </Box>
              )}
              
              {alert.dueDate && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <TimeIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Due: {new Date(alert.dueDate).toLocaleDateString()}
                  </Typography>
                </Stack>
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default SmartContractAlertsCard;
