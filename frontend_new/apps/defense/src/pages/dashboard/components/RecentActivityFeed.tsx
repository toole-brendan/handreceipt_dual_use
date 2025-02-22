import React from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: 'transfer' | 'maintenance' | 'inspection' | 'verification';
  item: {
    name: string;
    serialNumber: string;
  };
  personnel: {
    name: string;
    rank: string;
  };
  date: string;
  status: 'pending' | 'completed' | 'rejected' | 'in_progress';
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

type StatusType = 'pending' | 'completed' | 'rejected' | 'in_progress';

const StatusChip = styled(Chip)<{ status: StatusType }>(({ theme, status }) => {
  const colors: Record<StatusType, { bg: string; color: string }> = {
    pending: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    completed: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
    rejected: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
    in_progress: {
      bg: theme.palette.info.light,
      color: theme.palette.info.dark,
    },
  };

  return {
    backgroundColor: colors[status].bg,
    color: colors[status].color,
    fontWeight: 'bold',
  };
});

const getActivityTypeLabel = (type: Activity['type']): string => {
  const labels = {
    transfer: 'Transfer',
    maintenance: 'Maintenance',
    inspection: 'Inspection',
    verification: 'Verification',
  };
  return labels[type];
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  return (
    <StyledCard>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Action</TableCell>
            <TableCell>Item</TableCell>
            <TableCell>Personnel</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id} hover>
              <TableCell>{getActivityTypeLabel(activity.type)}</TableCell>
              <TableCell>
                <Typography variant="body2">
                  {activity.item.name}
                  <Typography variant="caption" display="block" color="text.secondary">
                    SN: {activity.item.serialNumber}
                  </Typography>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {activity.personnel.rank} {activity.personnel.name}
                </Typography>
              </TableCell>
              <TableCell>
                {format(new Date(activity.date), 'MM/dd/yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <StatusChip
                  label={activity.status.replace('_', ' ').toUpperCase()}
                  size="small"
                  status={activity.status as StatusType}
                />
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Details">
                  <IconButton size="small" color="primary">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledCard>
  );
}; 