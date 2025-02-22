import React from 'react';
import {
  Box,
  Card,
  LinearProgress,
  Link,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';

interface PersonnelStats {
  totalPersonnel: number;
  fullyEquipped: number;
  partiallyEquipped: number;
  overdueItems: number;
  equipmentStatus: {
    percentage: number;
    color: 'success' | 'warning' | 'error';
  };
}

interface PersonnelOverviewProps {
  stats: PersonnelStats;
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const MetricRow = styled(TableRow)(({ theme }) => ({
  '&:last-child td': {
    border: 0,
  },
}));

const ProgressWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
}));

export const PersonnelOverview: React.FC<PersonnelOverviewProps> = ({ stats }) => {
  return (
    <StyledCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PeopleIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">Personnel Overview</Typography>
      </Box>

      <ProgressWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Equipment Status
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats.equipmentStatus.percentage}%
          </Typography>
        </Box>
        <StyledLinearProgress
          variant="determinate"
          value={stats.equipmentStatus.percentage}
          color={stats.equipmentStatus.color}
        />
      </ProgressWrapper>

      <Table>
        <TableBody>
          <MetricRow>
            <TableCell component="th" scope="row">
              Total Personnel
            </TableCell>
            <TableCell align="right">
              <Typography variant="body1" fontWeight="bold">
                {stats.totalPersonnel}
              </Typography>
            </TableCell>
          </MetricRow>
          <MetricRow>
            <TableCell component="th" scope="row">
              Fully Equipped
            </TableCell>
            <TableCell align="right">
              <Typography
                variant="body1"
                fontWeight="bold"
                color="success.main"
              >
                {stats.fullyEquipped}
              </Typography>
            </TableCell>
          </MetricRow>
          <MetricRow>
            <TableCell component="th" scope="row">
              Partially Equipped
            </TableCell>
            <TableCell align="right">
              <Typography
                variant="body1"
                fontWeight="bold"
                color="warning.main"
              >
                {stats.partiallyEquipped}
              </Typography>
            </TableCell>
          </MetricRow>
          <MetricRow>
            <TableCell component="th" scope="row">
              Overdue Items
            </TableCell>
            <TableCell align="right">
              <Typography
                variant="body1"
                fontWeight="bold"
                color="error.main"
              >
                {stats.overdueItems}
              </Typography>
            </TableCell>
          </MetricRow>
        </TableBody>
      </Table>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Link href="/personnel" underline="hover">
          View Personnel Details →
        </Link>
      </Box>
    </StyledCard>
  );
}; 