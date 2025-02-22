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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';
import { RecentActivityFeedProps } from '../types';

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities = [], styles }) => {
  if (!Array.isArray(activities)) {
    return (
      <Card sx={styles.recentActivity}>
        <Box className="activity-header">
          <Typography variant="h6">Recent Activity</Typography>
        </Box>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">No activity data available</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={styles.recentActivity}>
      <Box className="activity-header">
        <Typography variant="h6">Recent Activity</Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="12%">Action</TableCell>
            <TableCell width="25%">Item</TableCell>
            <TableCell width="15%">Personnel</TableCell>
            <TableCell width="18%">Date</TableCell>
            <TableCell width="20%">Status</TableCell>
            <TableCell width="10%" align="center">Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => {
            // Ensure activity has all required properties
            if (!activity?.id || !activity?.type) {
              return null;
            }

            return (
              <TableRow key={activity.id}>
                <TableCell>{activity.type}</TableCell>
                <TableCell>
                  {activity.description || 'N/A'}
                </TableCell>
                <TableCell>
                  {activity.user?.rank && activity.user?.name 
                    ? `${activity.user.rank} ${activity.user.name}`
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {activity.timestamp 
                    ? format(new Date(activity.timestamp), 'MM/dd/yyyy HH:mm')
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.status || 'UNKNOWN'}
                    color={
                      activity.status === 'COMPLETED' ? 'success' :
                      activity.status === 'PENDING' ? 'warning' :
                      activity.status === 'IN PROGRESS' ? 'info' :
                      'error'
                    }
                    size="small"
                    sx={{ 
                      borderRadius: 0,
                      minWidth: 100,
                      justifyContent: 'center'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small" sx={{ color: 'primary.main' }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {activities.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">No recent activities</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}; 