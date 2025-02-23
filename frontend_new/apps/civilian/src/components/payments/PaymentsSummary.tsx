import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { ArrowDownward, ArrowUpward, AccessTime, AccountBalanceWallet } from '@mui/icons-material';
import { PaymentStats } from '@shared/types/payments';
import { formatCurrency } from '@shared/utils/formatting';

interface PaymentsSummaryProps {
  stats: PaymentStats;
}

export const PaymentsSummary: React.FC<PaymentsSummaryProps> = ({ stats }) => {
  const theme = useTheme();

  const summaryCards = [
    {
      label: 'Total Incoming',
      value: formatCurrency(stats.totalIncoming),
      icon: <ArrowDownward sx={{ color: theme.palette.success.main }} />,
      color: theme.palette.success.main,
    },
    {
      label: 'Total Outgoing',
      value: formatCurrency(stats.totalOutgoing),
      icon: <ArrowUpward sx={{ color: theme.palette.error.main }} />,
      color: theme.palette.error.main,
    },
    {
      label: 'Pending Payments',
      value: stats.pendingCount.toString(),
      icon: <AccessTime sx={{ color: theme.palette.warning.main }} />,
      color: theme.palette.warning.main,
    },
    {
      label: 'Wallet Balance',
      value: `${formatCurrency(stats.walletBalance)} USDC`,
      icon: <AccountBalanceWallet sx={{ color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1fr 1fr',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {summaryCards.map((card) => (
        <Card
          key={card.label}
          sx={{
            height: '100%',
            minHeight: { xs: 80, md: 100 },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 2,
              '&:last-child': { pb: 2 },
            }}
          >
            {card.icon}
            <Typography
              variant="h6"
              sx={{
                color: card.color,
                fontWeight: 'bold',
                mt: 1,
              }}
            >
              {card.value}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 0.5 }}
            >
              {card.label}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PaymentsSummary; 