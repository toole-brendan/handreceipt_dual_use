import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  SwapHoriz as TransferIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Mock data
const mockWalletInfo = {
  usdcBalance: 25000.00,
  pendingPayments: 1500.00,
  totalPaid: 150000.00,
};

const mockTransactions = [
  {
    id: 'TXN-001',
    date: '2024-02-22',
    type: 'Payment',
    amount: 2500.00,
    status: 'Completed',
    orderId: 'ORD-001',
    hash: '0x1234...5678',
  },
  {
    id: 'TXN-002',
    date: '2024-02-21',
    type: 'Deposit',
    amount: 5000.00,
    status: 'Completed',
    orderId: null,
    hash: '0x8765...4321',
  },
  {
    id: 'TXN-003',
    date: '2024-02-20',
    type: 'Payment',
    amount: 1500.00,
    status: 'Pending',
    orderId: 'ORD-002',
    hash: '0x9876...1234',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Failed':
      return 'error';
    default:
      return 'default';
  }
};

const Payments: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payments & USDC Wallet
      </Typography>

      {/* Wallet Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WalletIcon sx={{ mr: 1 }} />
                <Typography variant="h6">USDC Balance</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                ${mockWalletInfo.usdcBalance.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                >
                  Add Funds
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TransferIcon />}
                  size="small"
                >
                  Transfer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Payments
              </Typography>
              <Typography variant="h4" color="warning.main">
                ${mockWalletInfo.pendingPayments.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Paid (All Time)
              </Typography>
              <Typography variant="h4" color="success.main">
                ${mockWalletInfo.totalPaid.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction History */}
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount (USDC)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Blockchain Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.id}</TableCell>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell align="right">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={transaction.status}
                    color={getStatusColor(transaction.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transaction.orderId || '-'}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {transaction.hash}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Payments; 