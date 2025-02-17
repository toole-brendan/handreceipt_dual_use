import React, { useState, useEffect } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { CenteredLoadingSpinner } from '../../components/common/LoadingSpinner';
import DashboardMetricCard from '../../components/common/DashboardMetricCard';
import DashboardChartCard from '../../components/common/DashboardChartCard';
import DashboardActivityCard from '../../components/common/DashboardActivityCard';
import DashboardAlertCard from '../../components/common/DashboardAlertCard';
import { InventoryLevelsChart, ShipmentStatusChart, DeliveryTrendChart } from '../../components/charts';
import { mockDashboardData, getMetricTrends, DashboardMetric, DashboardData } from '../../mocks/api/pharmaceuticals-dashboard.mock';

interface DeliveryTrendData {
  date: string;
  onTime: number;
  delayed: number;
}

const getMetricDescription = (key: string): string => {
  switch (key) {
    case 'activeShipments':
      return 'Number of shipments currently in transit or pending delivery';
    case 'totalProducts':
      return 'Total number of unique products in the system';
    case 'inventoryValue':
      return 'Total value of all inventory across all locations';
    case 'qualityCompliance':
      return 'Percentage of products meeting quality standards';
    case 'temperatureExcursions':
      return 'Number of temperature violations in the last 24 hours';
    case 'batchesInProduction':
      return 'Number of batches currently being manufactured';
    default:
      return '';
  }
};

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryTrendData, setDeliveryTrendData] = useState<DeliveryTrendData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get delivery trend data for the last 7 days
        const onTimeTrend = getMetricTrends('on-time-delivery', 7);
        const delayedTrend = getMetricTrends('delayed-delivery', 7);

        // Combine the trends into a single dataset
        const combinedTrend = onTimeTrend.map((item: { date: string; value: number }, index: number) => ({
          date: item.date,
          onTime: Math.round(item.value),
          delayed: Math.round(delayedTrend[index].value)
        }));

        setDeliveryTrendData(combinedTrend);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {error && (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: 'error.main',
                color: 'error.contrastText',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {error}
            </Box>
          </Grid>
        )}

        {/* Metrics Section */}
        {Object.entries(mockDashboardData.metrics).map(([key, metric]: [string, DashboardMetric]) => (
          <Grid item xs={12} sm={6} md={4} xl={2} key={metric.id}>
            <DashboardMetricCard
              title={metric.label}
              value={metric.unit === 'USD' ? `$${metric.value.toLocaleString()}` : `${metric.value}${metric.unit || ''}`}
              trend={metric.trend && {
                value: metric.trend.value,
                isUpward: metric.trend.direction === 'up',
                label: metric.trend.label
              }}
              status={metric.status}
              loading={loading}
              subtitle={getMetricDescription(key)}
            />
          </Grid>
        ))}

        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <DashboardChartCard
            title="Inventory Levels by Category"
            subtitle="Current stock levels across categories"
            chart={
              <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
                {loading ? (
                  <CenteredLoadingSpinner size={32} />
                ) : (
                  <InventoryLevelsChart data={mockDashboardData.inventoryLevels} />
                )}
              </Box>
            }
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DashboardChartCard
            title="Shipment Status"
            subtitle="Current distribution of shipments"
            chart={
              <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
                {loading ? (
                  <CenteredLoadingSpinner size={32} />
                ) : (
                  <ShipmentStatusChart data={mockDashboardData.shipmentStatuses} />
                )}
              </Box>
            }
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <DashboardChartCard
            title="Delivery Performance Trend"
            subtitle="Last 7 Days"
            chart={
              <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
                {loading ? (
                  <CenteredLoadingSpinner size={32} />
                ) : (
                  <DeliveryTrendChart data={deliveryTrendData} />
                )}
              </Box>
            }
            loading={loading}
          />
        </Grid>

        {/* Activities and Alerts Section */}
        <Grid item xs={12} lg={8}>
          <DashboardActivityCard
            title="Recent Activities"
            activities={mockDashboardData.recentActivities}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <DashboardAlertCard
            title="Alerts & Notifications"
            alerts={mockDashboardData.alerts.map(alert => ({
              ...alert,
              type: alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info',
              read: alert.status !== 'New'
            }))}
            loading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
