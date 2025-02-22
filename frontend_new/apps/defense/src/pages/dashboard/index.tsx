import React from 'react';
import { Box, Container, Grid, Typography, useTheme, CircularProgress } from '@mui/material';
import { KeyMetricsCards } from './components/KeyMetricsCards';
import { UnitInventoryOverview } from './components/UnitInventoryOverview';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { ActionableTasks } from './components/ActionableTasks';
import { PersonnelOverview } from './components/PersonnelOverview';
import { NotificationsPanel } from './components/NotificationsPanel';
import { QuickLinks } from './components/QuickLinks';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardFooter } from './components/DashboardFooter';
import { usePropertyStats } from '../../hooks/usePropertyStats';
import { useNotifications } from '../../hooks/useNotifications';
import { useRecentActivity } from '../../hooks/useRecentActivity';
import { usePersonnelStats } from '../../hooks/usePersonnelStats';

interface MetricsStats {
  totalItems: number;
  serviceableItems: number;
  maintenanceNeeded: number;
  pendingTransfers: number;
  overdueItems: number;
}

interface InventoryStats {
  categories: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  criticalItems: Array<{
    name: string;
    issue: string;
    status: 'critical' | 'warning';
  }>;
}

interface ActionableStats {
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
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { stats: propertyStats, isLoading: isStatsLoading } = usePropertyStats();
  const { notifications, isLoading: isNotificationsLoading } = useNotifications();
  const { activities, isLoading: isActivitiesLoading } = useRecentActivity();
  const { personnelStats, isLoading: isPersonnelLoading } = usePersonnelStats();

  const isLoading = isStatsLoading || isNotificationsLoading || isActivitiesLoading || isPersonnelLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!propertyStats || !notifications || !activities || !personnelStats) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="error">Failed to load dashboard data</Typography>
        </Box>
      );
    }

    const inventoryStats: InventoryStats = {
      categories: propertyStats.categories,
      criticalItems: propertyStats.criticalItems,
    };

    const metricsStats: MetricsStats = {
      totalItems: propertyStats.totalItems,
      serviceableItems: propertyStats.serviceableItems,
      maintenanceNeeded: propertyStats.maintenanceNeeded,
      pendingTransfers: propertyStats.pendingTransfers.count,
      overdueItems: propertyStats.overdueItems,
    };

    const actionableStats: ActionableStats = {
      pendingTransfers: propertyStats.pendingTransfers,
      maintenanceRequests: propertyStats.maintenanceRequests,
    };

    return (
      <>
        {/* Key Metrics Section */}
        <Box sx={{ mb: 4 }}>
          <KeyMetricsCards stats={metricsStats} />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Unit Inventory Overview */}
          <Grid item xs={12} lg={8}>
            <UnitInventoryOverview stats={inventoryStats} />
          </Grid>

          {/* Notifications Panel */}
          <Grid item xs={12} lg={4}>
            <NotificationsPanel notifications={notifications} />
          </Grid>

          {/* Recent Activity Feed */}
          <Grid item xs={12}>
            <RecentActivityFeed activities={activities} />
          </Grid>

          {/* Actionable Tasks */}
          <Grid item xs={12} md={6}>
            <ActionableTasks stats={actionableStats} />
          </Grid>

          {/* Personnel Overview */}
          <Grid item xs={12} md={6}>
            <PersonnelOverview stats={personnelStats} />
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12}>
            <QuickLinks />
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header Section */}
        <DashboardHeader />

        {/* Main Content */}
        {renderContent()}

        {/* Footer */}
        <Box sx={{ mt: 4 }}>
          <DashboardFooter />
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 