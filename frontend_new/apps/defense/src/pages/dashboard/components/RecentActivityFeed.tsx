import React from 'react';
import {
  Box,
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
  styled,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: string;
  description?: string;
  user?: {
    rank?: string;
    name?: string;
  };
  timestamp?: string;
  status?: string;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

const ActivityCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '.activity-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: 0,
  minWidth: 100,
  justifyContent: 'center',
}));

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities = [] }) => {
  if (!Array.isArray(activities)) {
    return (
      <ActivityCard>
        <Box className="activity-header">
          <Typography variant="h6">Recent Activity</Typography>
        </Box>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No activity data available</Typography>
        </Box>
      </ActivityCard>
    );
  }

  return (
    <ActivityCard>
      <Box className="activity-header">
        <Typography variant="h6">Recent Activity</Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell width="12%">Action</StyledTableCell>
            <StyledTableCell width="25%">Item</StyledTableCell>
            <StyledTableCell width="15%">Personnel</StyledTableCell>
            <StyledTableCell width="18%">Date</StyledTableCell>
            <StyledTableCell width="20%">Status</StyledTableCell>
            <StyledTableCell width="10%" align="center">Details</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => {
            // Ensure activity has all required properties
            if (!activity?.id || !activity?.type) {
              return null;
            }

            return (
              <TableRow key={activity.id} hover>
                <StyledTableCell>{activity.type}</StyledTableCell>
                <StyledTableCell>
                  {activity.description || 'N/A'}
                </StyledTableCell>
                <StyledTableCell>
                  {activity.user?.rank && activity.user?.name 
                    ? `${activity.user.rank} ${activity.user.name}`
                    : 'N/A'}
                </StyledTableCell>
                <StyledTableCell>
                  {activity.timestamp 
                    ? format(new Date(activity.timestamp), 'MM/dd/yyyy HH:mm')
                    : 'N/A'}
                </StyledTableCell>
                <StyledTableCell>
                  <StatusChip
                    label={activity.status || 'UNKNOWN'}
                    color={
                      activity.status === 'COMPLETED' ? 'success' :
                      activity.status === 'PENDING' ? 'warning' :
                      activity.status === 'IN PROGRESS' ? 'info' :
                      'error'
                    }
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" sx={{ color: 'primary.main' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </StyledTableCell>
              </TableRow>
            );
          })}
          {activities.length === 0 && (
            <TableRow>
              <StyledTableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No recent activities</Typography>
              </StyledTableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ActivityCard>
  );
}; 