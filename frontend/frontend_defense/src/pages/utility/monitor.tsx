import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import { Refresh, Warning, Security, Shield } from '@mui/icons-material';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

interface SecurityMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const SecurityMonitor: React.FC = () => {
  const [alerts] = React.useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'Multiple failed login attempts detected',
      timestamp: '2024-02-09T14:30:00Z'
    },
    {
      id: '2',
      type: 'info',
      message: 'System security scan completed',
      timestamp: '2024-02-09T14:15:00Z'
    }
  ]);

  const metrics: SecurityMetric[] = [
    {
      name: 'System Security Score',
      value: 85,
      status: 'good',
      icon: <Security />
    },
    {
      name: 'Access Control Health',
      value: 92,
      status: 'good',
      icon: <Shield />
    },
    {
      name: 'Threat Detection',
      value: 65,
      status: 'warning',
      icon: <Warning />
    }
  ];

  const handleRefresh = () => {
    // TODO: Implement actual refresh logic
    console.log('Refreshing security data...');
  };

  const getAlertColor = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getMetricColor = (status: SecurityMetric['status']) => {
    switch (status) {
      case 'good':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'critical':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Security Monitor
        </Typography>
        <IconButton onClick={handleRefresh} title="Refresh">
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    mr: 1,
                    color: getMetricColor(metric.status)
                  }}>
                    {metric.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {metric.name}
                  </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="h4" component="div" gutterBottom>
                    {metric.value}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metric.value}
                    color={metric.status === 'good' ? 'success' : 
                           metric.status === 'warning' ? 'warning' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Security Alerts
              </Typography>
              <List>
                {alerts.map((alert) => (
                  <ListItem key={alert.id}>
                    <ListItemText
                      primary={alert.message}
                      secondary={new Date(alert.timestamp).toLocaleString()}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={alert.type}
                        color={getAlertColor(alert.type)}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info">
            Last system security scan completed successfully. No critical vulnerabilities detected.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityMonitor;
