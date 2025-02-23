import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import {
  Inventory as InventoryIcon,
  AttachMoney as SalesIcon,
  LocalShipping as ShipmentIcon,
  Payment as PaymentIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';

interface DashboardSummaryProps {
  inventoryValue: number;
  totalSales: number;
  totalShipments: number;
  totalPayments: number;
  walletBalance: number;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  inventoryValue,
  totalSales,
  totalShipments,
  totalPayments,
  walletBalance,
}) => {
  const summaryCards = [
    {
      label: 'Total Inventory Value',
      value: `$${inventoryValue.toLocaleString()}`,
      icon: <InventoryIcon />,
      color: '#1976D2',
    },
    {
      label: 'Total Sales (last 30 days)',
      value: `$${totalSales.toLocaleString()}`,
      icon: <SalesIcon />,
      color: '#388E3C',
    },
    {
      label: 'Total Shipments (last 30 days)',
      value: totalShipments.toString(),
      icon: <ShipmentIcon />,
      color: '#1976D2',
    },
    {
      label: 'Total Payments (last 30 days)',
      value: `$${totalPayments.toLocaleString()}`,
      icon: <PaymentIcon />,
      color: '#D32F2F',
    },
    {
      label: 'Wallet Balance',
      value: `${walletBalance.toLocaleString()} USDC`,
      icon: <WalletIcon />,
      color: '#7B1FA2',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: `${card.color}15`,
                    borderRadius: '50%',
                    p: 1,
                    mb: 1,
                  }}
                >
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ minHeight: 40, display: 'flex', alignItems: 'center' }}
                >
                  {card.label}
                </Typography>
                <Typography variant="h4" component="div">
                  {card.value}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 