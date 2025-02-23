import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
  QrCode as QrCodeIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import type { QRMetrics } from '../types';

// Mock data - replace with actual data from your API
const mockMetrics: QRMetrics = {
  totalGenerated: 25,
  scannedToday: 5,
  pending: 10,
};

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  const theme = useTheme();
  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main + '15',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color: theme.palette.primary.main, fontSize: 24 },
            })}
          </Box>
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const MetricsSection: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Total QR Codes Generated"
          value={mockMetrics.totalGenerated}
          icon={<QrCodeIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="QR Codes Scanned Today"
          value={mockMetrics.scannedToday}
          icon={<QrCodeScannerIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricCard
          title="Pending QR Codes"
          value={mockMetrics.pending}
          icon={<PendingIcon />}
        />
      </Grid>
    </Grid>
  );
}; 