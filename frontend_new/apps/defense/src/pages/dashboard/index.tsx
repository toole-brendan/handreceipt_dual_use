import React from 'react';
import { Box, Container, Typography, Paper, Grid, styled, Avatar, Stack } from '@mui/material';
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
import { categoryChartColors } from '../../styles/defense-specific-styles';
import { mockDashboardData } from './mockData';

const CompanyInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const UnitLogo = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  backgroundColor: theme.palette.primary.main,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
}));

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  // For development, use mock data
  const data = mockDashboardData;

  const handleViewAllCriticalItems = () => {
    navigate('/inventory/critical');
  };

  return (
    <Container>
      <Box py={3}>
        <CompanyInfoCard elevation={1}>
          <UnitLogo
            src="/assets/images/101st-airborne-logo.png"
            alt="101st Airborne Division"
          />
          <Box>
            <Typography variant="h4" gutterBottom>
              Captain John Doe
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Company Commander, F CO - 2-506, 3BCT, 101st Airborne Division
            </Typography>
          </Box>
        </CompanyInfoCard>

        <Box mb={3}>
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box mb={3}>
              <UnitInventoryOverview
                stats={{
                  categories: data.propertyStats.categories,
                  criticalItems: data.propertyStats.criticalItems,
                }}
                onViewAll={handleViewAllCriticalItems}
              />
            </Box>
            <StyledPaper>
              <RecentActivityFeed activities={data.activities} />
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <StyledPaper>
                <NotificationsPanel notifications={data.notifications} />
              </StyledPaper>
              <StyledPaper>
                <ActionableTasks
                  stats={{
                    pendingTransfers: data.propertyStats.pendingTransfers,
                    maintenanceRequests: data.propertyStats.maintenanceRequests,
                  }}
                />
              </StyledPaper>
              <StyledPaper>
                <PersonnelOverview 
                  stats={{
                    totalPersonnel: data.personnelStats.totalPersonnel,
                    fullyEquipped: data.personnelStats.fullyEquipped,
                    partiallyEquipped: data.personnelStats.partiallyEquipped,
                    overdueItems: data.personnelStats.overdueItems,
                  }}
                />
              </StyledPaper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 