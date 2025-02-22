import React from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Inventory as StockIcon,
  Warning as AlertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../../../components/common/CivilianChip';

// Mock data - replace with actual data fetching
const mockTasks = [
  {
    id: '1',
    title: 'Pick Order #123',
    description: 'Collect items from Zone A, Bin 101',
    priority: 'high',
    dueTime: '10:30 AM',
  },
  {
    id: '2',
    title: 'Restock Zone B',
    description: 'Move items from receiving to Zone B',
    priority: 'medium',
    dueTime: '11:45 AM',
  },
  {
    id: '3',
    title: 'Cycle Count Bin 203',
    description: 'Verify inventory count in Bin 203',
    priority: 'low',
    dueTime: '2:00 PM',
  },
];

const mockAlerts = [
  {
    id: '1',
    zone: 'Zone A',
    message: 'Low stock alert: Ethiopian Yirgacheffe',
    level: 'warning',
  },
  {
    id: '2',
    zone: 'Zone C',
    message: 'Temperature above threshold',
    level: 'error',
  },
];

const getTaskPriorityColor = (priority: string): 'error' | 'warning' | 'success' => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    default:
      return 'success';
  }
};

export const WarehouseTab: React.FC = () => {
  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      {/* Storage Layout */}
      <Paper sx={{ width: '40%', p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Storage Layout
            </Typography>
            <Tooltip title="Refresh Layout">
              <IconButton size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Layout Settings">
              <IconButton size="small">
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.100',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography color="text.secondary">
              Warehouse Layout Visualization Coming Soon
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Operations Dashboard */}
      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        {/* Tasks */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Task Queue
          </Typography>
          <List>
            {mockTasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <ShippingIcon />
                </ListItemIcon>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">
                        {task.description}
                      </Typography>
                      <CivilianChip
                        size="small"
                        color={getTaskPriorityColor(task.priority)}
                        label={task.dueTime}
                      />
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Alerts */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Alerts
          </Typography>
          <List>
            {mockAlerts.map((alert) => (
              <ListItem
                key={alert.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <AlertIcon color={alert.level as 'error' | 'warning'} />
                </ListItemIcon>
                <ListItemText
                  primary={alert.zone}
                  secondary={alert.message}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Equipment Status */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Equipment Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <StockIcon color="primary" />
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Scanner Battery
                  </Typography>
                  <Typography variant="body1">
                    85% (4.2 hours remaining)
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                variant="outlined"
                sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <ShippingIcon color="primary" />
                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Forklift Status
                  </Typography>
                  <Typography variant="body1">
                    Available (Last Service: 2 days ago)
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Stack>
    </Box>
  );
};
