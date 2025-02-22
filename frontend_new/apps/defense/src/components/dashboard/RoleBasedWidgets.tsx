import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  styled,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  QrCode2 as QrCodeIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const WidgetContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

interface Task {
  id: string;
  type: 'inspection' | 'transfer' | 'signature';
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface AssignedItem {
  id: string;
  name: string;
  nsn: string;
  status: 'serviceable' | 'unserviceable' | 'pending';
  qrCode: string;
}

interface Discrepancy {
  id: string;
  item: string;
  type: 'mismatch' | 'missing' | 'extra';
  description: string;
  timestamp: string;
}

interface SupplyRate {
  id: string;
  item: string;
  rate: number; // Percentage increase/decrease
  period: string;
  trend: 'up' | 'down' | 'stable';
}

interface RoleBasedWidgetsProps {
  role: 'soldier' | 'commander';
  tasks: Task[];
  assignedItems: AssignedItem[];
  discrepancies?: Discrepancy[];
  supplyRates?: SupplyRate[];
  onTaskClick?: (taskId: string) => void;
  onQrCodeClick?: (itemId: string) => void;
}

const RoleBasedWidgets: React.FC<RoleBasedWidgetsProps> = ({
  role,
  tasks,
  assignedItems,
  discrepancies = [],
  supplyRates = [],
  onTaskClick,
  onQrCodeClick,
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
    }
  };

  return (
    <Stack spacing={2}>
      {/* Tasks Section */}
      <WidgetContainer>
        <Typography variant="h6" gutterBottom>
          {role === 'soldier' ? 'My Upcoming Tasks' : 'Unit Tasks'}
        </Typography>
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              button
              onClick={() => onTaskClick?.(task.id)}
              sx={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <ListItemIcon>
                <TaskIcon color={getPriorityColor(task.priority)} />
              </ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={`Due: ${task.dueDate}`}
              />
              <ListItemSecondaryAction>
                <Chip
                  size="small"
                  label={task.type}
                  color={getPriorityColor(task.priority)}
                  sx={{ textTransform: 'capitalize' }}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </WidgetContainer>

      {/* Assigned Items Section */}
      <WidgetContainer>
        <Typography variant="h6" gutterBottom>
          {role === 'soldier' ? 'My Assigned Gear' : 'Unit Equipment'}
        </Typography>
        <List>
          {assignedItems.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem button onClick={() => toggleExpand(item.id)}>
                <ListItemIcon>
                  <QrCodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  secondary={`NSN: ${item.nsn}`}
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={item.status}
                      color={
                        item.status === 'serviceable'
                          ? 'success'
                          : item.status === 'unserviceable'
                          ? 'error'
                          : 'warning'
                      }
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {expandedItems.includes(item.id) ? <CollapseIcon /> : <ExpandIcon />}
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
              <Collapse in={expandedItems.includes(item.id)}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Tooltip title="View QR Code">
                    <IconButton onClick={() => onQrCodeClick?.(item.id)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </WidgetContainer>

      {/* Commander-specific sections */}
      {role === 'commander' && (
        <>
          {/* Discrepancy Report */}
          <WidgetContainer>
            <Typography variant="h6" gutterBottom>Unit Discrepancy Report</Typography>
            <List>
              {discrepancies.map((discrepancy) => (
                <ListItem
                  key={discrepancy.id}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary={discrepancy.item}
                    secondary={
                      <>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {discrepancy.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {discrepancy.timestamp}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    size="small"
                    label={discrepancy.type}
                    color="warning"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </ListItem>
              ))}
            </List>
          </WidgetContainer>

          {/* Supply Burn Rate */}
          <WidgetContainer>
            <Typography variant="h6" gutterBottom>Supply Burn Rate</Typography>
            <List>
              {supplyRates.map((rate) => (
                <ListItem
                  key={rate.id}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <ListItemIcon>
                    <TrendingUpIcon
                      color={rate.trend === 'up' ? 'error' : rate.trend === 'down' ? 'success' : 'info'}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={rate.item}
                    secondary={`${rate.rate > 0 ? '+' : ''}${rate.rate}% over ${rate.period}`}
                  />
                </ListItem>
              ))}
            </List>
          </WidgetContainer>
        </>
      )}
    </Stack>
  );
};

export default RoleBasedWidgets;
