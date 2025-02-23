import React from 'react';
import { Box, Typography, Paper, Grid, styled, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { KeyMetricsCards } from './components/KeyMetricsCards';
import { UnitInventoryOverview } from './components/UnitInventoryOverview';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { ActionableTasks } from './components/ActionableTasks';
import { PersonnelOverview } from './components/PersonnelOverview';
import { NotificationsPanel } from './components/NotificationsPanel';
import { usePropertyStats } from '../../hooks/usePropertyStats';
import { useNotifications } from '../../hooks/useNotifications';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { usePersonnelStats } from '../../hooks/usePersonnelStats';
import { categoryChartColors } from '../../styles/theme';
import { mockDashboardData } from './mockData';

// Base card styling following civilian pattern
const DashboardCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '& .card-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& h6': {
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  '& .card-content': {
    padding: theme.spacing(2),
  },
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const data = mockDashboardData;

  const handleViewAllCriticalItems = () => {
    navigate('/inventory/critical');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                CPT JOHN DOE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                F CO - 2-506, 3BCT, 101st Airborne Division
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <KeyMetricsCards
            stats={{
              total: data.propertyStats.totalItems,
              serviceableItems: data.propertyStats.serviceableItems,
              maintenanceNeeded: data.propertyStats.maintenanceNeeded,
              pendingTransfers: data.propertyStats.pendingTransfers.count,
              overdueItems: data.propertyStats.overdueItems,
            }}
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Tasks and Notifications - Side by side on tablet+ */}
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Actionable Tasks</Typography>
              </div>
              <div className="card-content">
                <ActionableTasks
                  stats={{
                    pendingTransfers: data.propertyStats.pendingTransfers,
                    maintenanceRequests: data.propertyStats.maintenanceRequests,
                  }}
                />
              </div>
            </DashboardCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Notifications</Typography>
              </div>
              <div className="card-content">
                <NotificationsPanel notifications={data.notifications} />
              </div>
            </DashboardCard>
          </Grid>

          {/* Overview Charts - Side by side on tablet+ */}
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Unit Inventory Overview</Typography>
              </div>
              <div className="card-content">
                <UnitInventoryOverview
                  stats={{
                    categories: data.propertyStats.categories,
                    criticalItems: data.propertyStats.criticalItems,
                  }}
                  onViewAll={handleViewAllCriticalItems}
                />
              </div>
            </DashboardCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Personnel Overview</Typography>
              </div>
              <div className="card-content">
                <PersonnelOverview 
                  stats={{
                    totalPersonnel: data.personnelStats.totalPersonnel,
                    fullyEquipped: data.personnelStats.fullyEquipped,
                    partiallyEquipped: data.personnelStats.partiallyEquipped,
                    overdueItems: data.personnelStats.overdueItems,
                  }}
                />
              </div>
            </DashboardCard>
          </Grid>

          {/* Activity Feed - Full width */}
          <Grid item xs={12}>
            <DashboardCard>
              <div className="card-header">
                <Typography variant="h6">Recent Activity</Typography>
              </div>
              <div className="card-content">
                <RecentActivityFeed activities={data.activities} />
              </div>
            </DashboardCard>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 