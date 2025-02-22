import React from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildIcon from '@mui/icons-material/Build';

interface ActionableTasksProps {
  stats: {
    pendingTransfers: {
      count: number;
      items: Array<{
        id: string;
        itemName: string;
        from: string;
        to: string;
      }>;
    };
    maintenanceRequests: {
      count: number;
      items: Array<{
        id: string;
        itemName: string;
        type: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
  };
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const TaskCount = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 'bold',
  fontSize: '2rem',
  marginBottom: theme.spacing(1),
}));

const PriorityDot = styled('span')<{ priority: string }>(({ theme, priority }) => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
  };

  return {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: colors[priority as keyof typeof colors],
    marginRight: theme.spacing(1),
  };
});

export const ActionableTasks: React.FC<ActionableTasksProps> = ({ stats }) => {
  return (
    <StyledCard>
      <Typography variant="h6" gutterBottom>
        Actionable Tasks
      </Typography>

      {/* Pending Transfers Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SwapHorizIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Pending Transfers</Typography>
        </Box>
        <TaskCount>{stats.pendingTransfers.count}</TaskCount>
        <List dense>
          {stats.pendingTransfers.items.slice(0, 3).map((transfer) => (
            <ListItem key={transfer.id}>
              <ListItemText
                primary={transfer.itemName}
                secondary={`From: ${transfer.from} → To: ${transfer.to}`}
              />
            </ListItem>
          ))}
        </List>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<SwapHorizIcon />}
          fullWidth
        >
          Review Transfers
        </ActionButton>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Maintenance Requests Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BuildIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1">Maintenance Requests</Typography>
        </Box>
        <TaskCount>{stats.maintenanceRequests.count}</TaskCount>
        <List dense>
          {stats.maintenanceRequests.items.slice(0, 3).map((request) => (
            <ListItem key={request.id}>
              <PriorityDot priority={request.priority} />
              <ListItemText
                primary={request.itemName}
                secondary={`Type: ${request.type}`}
              />
            </ListItem>
          ))}
        </List>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<BuildIcon />}
          fullWidth
        >
          Review Maintenance
        </ActionButton>
      </Box>
    </StyledCard>
  );
}; 