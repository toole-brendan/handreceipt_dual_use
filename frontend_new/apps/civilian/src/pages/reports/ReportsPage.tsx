import React, { useState } from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { ReportsDateRangePicker } from '../../components/reports/ReportsDateRangePicker';
import { ReportsSummary } from '../../components/reports/ReportsSummary';
import { SalesOverTimeChart } from '../../components/reports/SalesOverTimeChart';
import { TopSellingProductsChart } from '../../components/reports/TopSellingProductsChart';
import { InventoryDistributionChart } from '../../components/reports/InventoryDistributionChart';
import { LowStockItemsTable } from '../../components/reports/LowStockItemsTable';
import {
  ReportDateRange,
  TimeGranularity,
  ValueMetric,
  DistributionType,
} from '@shared/types/reports';

// Mock data imports would go here in a real implementation
import {
  mockSalesData,
  mockTopSellingProducts,
  mockInventoryDistribution,
  mockLowStockItems,
} from './mockData';

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<ReportDateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>('daily');
  const [valueMetric, setValueMetric] = useState<ValueMetric>('revenue');
  const [distributionType, setDistributionType] = useState<DistributionType>('category');

  const handleExportCSV = (component: string) => {
    console.log(`Exporting CSV for ${component}`);
    // Implementation would go here
  };

  const handleExportPDF = (component: string) => {
    console.log(`Exporting PDF for ${component}`);
    // Implementation would go here
  };

  const handleReorder = (itemId: string) => {
    console.log(`Reordering item ${itemId}`);
    // Implementation would go here
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Coffee Business Reports
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Track your coffee bean sales, inventory, and business performance metrics.
              </Typography>
            </Box>
            <ReportsDateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </Box>
        </Box>

        {/* Summary Section */}
        <ReportsSummary
          stats={{
            totalSales: 15000,
            totalShipments: 25,
            totalPayments: 10000,
            totalBlockchainTransactions: 50,
          }}
        />

        {/* Reports Grid */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Sales and Revenue */}
          <Grid item xs={12} lg={8}>
            <SalesOverTimeChart
              data={mockSalesData}
              granularity={timeGranularity}
              onGranularityChange={setTimeGranularity}
              onExportCSV={() => handleExportCSV('sales')}
              onExportPDF={() => handleExportPDF('sales')}
            />
          </Grid>
          <Grid item xs={12} lg={4}>
            <TopSellingProductsChart
              data={mockTopSellingProducts}
              metric={valueMetric}
              onMetricChange={setValueMetric}
              onExportCSV={() => handleExportCSV('top-products')}
              onExportPDF={() => handleExportPDF('top-products')}
            />
          </Grid>

          {/* Inventory */}
          <Grid item xs={12} md={6}>
            <InventoryDistributionChart
              data={mockInventoryDistribution}
              distributionType={distributionType}
              onDistributionTypeChange={setDistributionType}
              onExportCSV={() => handleExportCSV('inventory-distribution')}
              onExportPDF={() => handleExportPDF('inventory-distribution')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <LowStockItemsTable
              data={mockLowStockItems}
              onReorder={handleReorder}
              onExportCSV={() => handleExportCSV('low-stock')}
              onExportPDF={() => handleExportPDF('low-stock')}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ReportsPage; 