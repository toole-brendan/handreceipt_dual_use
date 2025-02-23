import React from 'react';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import {
  AttachMoney,
  LocalShipping,
  CallMade,
  AccountTree,
} from '@mui/icons-material';
import { ReportSummaryStats } from '@shared/types/reports';

interface ReportsSummaryProps {
  stats: ReportSummaryStats;
}

const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export const ReportsSummary: React.FC<ReportsSummaryProps> = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon={<AttachMoney />}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Total Shipments"
          value={stats.totalShipments.toString()}
          icon={<LocalShipping />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Total Payments"
          value={`$${stats.totalPayments.toLocaleString()}`}
          icon={<CallMade />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Blockchain Transactions"
          value={stats.totalBlockchainTransactions.toString()}
          icon={<AccountTree />}
          color="secondary"
        />
      </Grid>
    </Grid>
  );
}; 