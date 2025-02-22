import React from 'react';
import { Box, Container, Typography, useTheme, Fade } from '@mui/material';
import { defenseDashboardStyles, categoryChartColors } from '../../styles/defense-specific-styles';
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

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const styles = defenseDashboardStyles(theme);
  
  const { stats: propertyStats, isLoading: isStatsLoading } = usePropertyStats();
  const { notifications, isLoading: isNotificationsLoading } = useNotifications();
  const { activities, isLoading: isActivitiesLoading } = useRecentActivity();
  const { personnelStats, isLoading: isPersonnelLoading } = usePersonnelStats();

  const isLoading = isStatsLoading || isNotificationsLoading || isActivitiesLoading || isPersonnelLoading;

  if (isLoading) {
    return (
      <Box sx={styles.dashboardContainer}>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (!propertyStats || !notifications || !activities || !personnelStats) {
    return (
      <Box sx={styles.dashboardContainer}>
        <Typography variant="h6" color="error">
          Failed to load dashboard data
        </Typography>
      </Box>
    );
  }

  return (
    <Container sx={styles.dashboardContainer}>
      <Fade in timeout={800}>
        <Box>
          {/* Company Information */}
          <Box sx={styles.companyInfo}>
            <img
              src="/assets/images/101st-airborne-logo.png"
              alt="101st Airborne Division"
              className="unit-logo"
            />
            <Box className="commander-info">
              <Typography variant="h4">Captain John Doe</Typography>
              <Typography variant="body1">
                Company Commander, F CO - 2-506, 3BCT, 101st Airborne Division
              </Typography>
            </Box>
          </Box>

          {/* Key Metrics */}
          <Fade in timeout={1000}>
            <Box>
              <KeyMetricsCards
                stats={{
                  total: propertyStats.totalItems,
                  serviceableItems: propertyStats.serviceableItems,
                  maintenanceNeeded: propertyStats.maintenanceNeeded,
                  pendingTransfers: propertyStats.pendingTransfers.count,
                  overdueItems: propertyStats.overdueItems,
                }}
                styles={styles}
              />
            </Box>
          </Fade>

          {/* Main Content Grid */}
          <Box sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
            mt: 3,
            '& > *': {
              opacity: 0,
              animation: 'fadeSlideUp 0.6s forwards',
              '@keyframes fadeSlideUp': {
                from: {
                  opacity: 0,
                  transform: 'translateY(20px)'
                },
                to: {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }
          }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <UnitInventoryOverview
                stats={{
                  categories: propertyStats.categories,
                  criticalItems: propertyStats.criticalItems,
                }}
                chartColors={categoryChartColors}
                styles={styles}
              />
              <RecentActivityFeed
                activities={activities}
                styles={styles}
              />
            </Box>

            {/* Right Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <NotificationsPanel
                notifications={notifications}
                styles={styles}
              />
              <ActionableTasks
                stats={{
                  pendingTransfers: propertyStats.pendingTransfers,
                  maintenanceRequests: propertyStats.maintenanceRequests,
                }}
                styles={styles}
              />
              <PersonnelOverview
                stats={personnelStats}
                styles={styles}
              />
            </Box>
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard; 