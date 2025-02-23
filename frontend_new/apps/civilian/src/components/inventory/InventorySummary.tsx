import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { Inventory as InventoryIcon, AttachMoney, Warning, Event } from '@mui/icons-material';
import { InventoryStats } from '@shared/types/inventory';

interface InventorySummaryProps {
  stats: InventoryStats;
}

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box sx={{ color: color || 'primary.main' }}>
            {icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" component="div">
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

export const InventorySummary: React.FC<InventorySummaryProps> = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Total Inventory Items"
          value={stats.totalItems}
          icon={<InventoryIcon fontSize="large" />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Total Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          icon={<AttachMoney fontSize="large" />}
          color="success.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<Warning fontSize="large" />}
          color="warning.main"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <SummaryCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={<Event fontSize="large" />}
          color="error.main"
        />
      </Grid>
    </Grid>
  );
}; 