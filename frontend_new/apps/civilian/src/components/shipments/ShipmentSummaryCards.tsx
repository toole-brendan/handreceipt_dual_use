import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { LocalShipping, CheckCircle, HourglassEmpty } from '@mui/icons-material';
import { ShipmentStats } from '@shared/types/shipments';

interface ShipmentSummaryCardsProps {
  stats: ShipmentStats;
}

const SummaryCard: React.FC<{
  title: string;
  value: number;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, label, icon, bgColor }) => (
  <Card sx={{ bgcolor: bgColor, flex: 1, minWidth: 200 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </CardContent>
  </Card>
);

export const ShipmentSummaryCards: React.FC<ShipmentSummaryCardsProps> = ({ stats }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <SummaryCard
        title="In Transit"
        value={stats.inTransit}
        label="Active Shipments"
        icon={<LocalShipping sx={{ color: 'primary.main' }} />}
        bgColor="rgba(33, 150, 243, 0.1)"
      />
      <SummaryCard
        title="Delivered Today"
        value={stats.deliveredToday}
        label="Completed Shipments"
        icon={<CheckCircle sx={{ color: 'success.main' }} />}
        bgColor="rgba(76, 175, 80, 0.1)"
      />
      <SummaryCard
        title="Pending Confirmation"
        value={stats.pendingConfirmation}
        label="Awaiting Confirmation"
        icon={<HourglassEmpty sx={{ color: 'warning.main' }} />}
        bgColor="rgba(255, 193, 7, 0.1)"
      />
    </Box>
  );
}; 