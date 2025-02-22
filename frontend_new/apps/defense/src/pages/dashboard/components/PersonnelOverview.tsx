import React from 'react';
import {
  Box,
  Card,
  Typography,
  Link,
} from '@mui/material';
import { PersonnelOverviewProps } from '../types';

export const PersonnelOverview: React.FC<PersonnelOverviewProps> = ({ stats, styles }) => {
  return (
    <Card sx={styles.personnelOverview}>
      <Box className="overview-header">
        <Typography variant="h6">Personnel Overview</Typography>
      </Box>

      <Box className="stat-item">
        <Typography className="stat-label">Total Personnel</Typography>
        <Typography className="stat-value">{stats.total}</Typography>
      </Box>

      <Box className="stat-item">
        <Typography className="stat-label">Fully Equipped</Typography>
        <Typography className="stat-value success">{stats.available}</Typography>
      </Box>

      <Box className="stat-item">
        <Typography className="stat-label">Partially Equipped</Typography>
        <Typography className="stat-value warning">{stats.deployed}</Typography>
      </Box>

      <Box className="stat-item">
        <Typography className="stat-label">Overdue Items</Typography>
        <Typography className="stat-value error">{stats.onLeave}</Typography>
      </Box>

      <Box className="view-details">
        <Link href="#" underline="hover">
          View Personnel Details →
        </Link>
      </Box>
    </Card>
  );
}; 