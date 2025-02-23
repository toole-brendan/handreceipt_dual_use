import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DashboardSummary } from './components/DashboardSummary';
import { SalesChart } from './components/SalesChart';
import { TopSellingProducts } from './components/TopSellingProducts';
import { ShipmentsMap } from './components/ShipmentsMap';
import { PendingPayments } from './components/PendingPayments';
import { LowStockItems } from './components/LowStockItems';
import { BlockchainTransactions } from './components/BlockchainTransactions';
import { mockDashboardData } from './mockData';
import { CIVILIAN_ROUTES } from '../../constants/routes';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [chartGranularity, setChartGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [shipmentType, setShipmentType] = useState<'inbound' | 'outbound'>('outbound');

  const handleDateRangeChange = (newRange: { start: string; end: string }) => {
    setDateRange(newRange);
    // TODO: Fetch new data based on date range
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="text.secondary">
          Your business at a glance: track inventory, sales, shipments, payments, and blockchain activity.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <DashboardSummary
        inventoryValue={mockDashboardData.summary.inventoryValue}
        totalSales={mockDashboardData.summary.totalSales}
        totalShipments={mockDashboardData.summary.totalShipments}
        totalPayments={mockDashboardData.summary.totalPayments}
        walletBalance={mockDashboardData.summary.walletBalance}
      />

      {/* Sales Chart and Top-Selling Products */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <SalesChart
            data={mockDashboardData.salesData}
            granularity={chartGranularity}
            onGranularityChange={setChartGranularity}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TopSellingProducts
            products={mockDashboardData.topSellingProducts}
            onViewAll={() => navigate(CIVILIAN_ROUTES.REPORTS)}
          />
        </Grid>
      </Grid>

      {/* Shipments Map and Pending Payments */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <ShipmentsMap
            shipments={mockDashboardData.recentShipments}
            type={shipmentType}
            onTypeChange={setShipmentType}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PendingPayments
            payments={mockDashboardData.pendingPayments}
            onViewAll={() => navigate(CIVILIAN_ROUTES.WALLET)}
          />
        </Grid>
      </Grid>

      {/* Low-Stock Items */}
      <Box sx={{ mb: 3 }}>
        <LowStockItems
          items={mockDashboardData.lowStockItems}
          onViewAll={() => navigate(CIVILIAN_ROUTES.INVENTORY)}
        />
      </Box>

      {/* Blockchain Transactions */}
      <Box>
        <BlockchainTransactions
          transactions={mockDashboardData.recentTransactions}
        />
      </Box>
    </Box>
  );
};

// Add default export
export default DashboardPage;
