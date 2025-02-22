import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
  QrCode as QrCodeIcon,
  Receipt as ReceiptIcon,
  SwapHoriz as SwapIcon,
  Assessment as MetricsIcon,
  Eco as SustainabilityIcon,
  Security as SecurityIcon,
  AccountBalance as BankIcon,
  Gavel as DisputeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for wallet and payments
const mockWalletData = {
  balances: {
    usdc: 148950.50,
    escrowed: 52000,
    pendingInbound: 23500,
  },
  transactions: [
    {
      id: "TX001",
      date: "2024-02-22",
      type: "farm_payment",
      description: "Quality Bonus to Finca La Palma",
      amount: 5000,
      status: "completed",
      confirmations: 12,
      contractId: "CON001",
    },
    {
      id: "TX002",
      date: "2024-02-21",
      type: "customer_payment",
      description: "Payment from Gorilla Roasters",
      amount: 15000,
      status: "pending",
      confirmations: 3,
      contractId: "CON002",
    },
    {
      id: "TX003",
      date: "2024-02-20",
      type: "sustainability",
      description: "Carbon Credits Q1 2024",
      amount: 2300,
      status: "completed",
      confirmations: 24,
      contractId: "CON003",
    },
  ],
  recurringPayments: [
    {
      id: "REC001",
      recipient: "Colombian Co-op",
      amount: 5000,
      frequency: "monthly",
      nextDate: "2024-03-01",
      status: "active",
    },
    {
      id: "REC002",
      recipient: "Ethiopian Farmers Union",
      amount: 7500,
      frequency: "quarterly",
      nextDate: "2024-04-01",
      status: "active",
    },
  ],
  sustainabilityMetrics: {
    carbonCredits: 2300,
    waterSavings: 450,
    certifications: [
      { name: "Fair Trade", status: "verified", lastAudit: "2024-01-15" },
      { name: "Organic", status: "verified", lastAudit: "2024-01-20" },
      { name: "Rainforest Alliance", status: "pending", lastAudit: "2024-02-01" },
    ],
  },
  escrowDetails: [
    {
      id: "ESC001",
      description: "Yirgacheffe Lot #23",
      amount: 10000,
      releaseDate: "2024-06-30",
      progress: 65,
      conditions: ["Quality Score > 85", "Moisture < 12%"],
    },
  ],
  pendingApprovals: [
    {
      id: "APP001",
      type: "farm_advance",
      amount: 20000,
      recipient: "Finca Verde",
      signatures: 2,
      requiredSignatures: 3,
    },
  ],
};

const getStatusColor = (status: string): "success" | "warning" | "error" | "info" => {
  switch (status) {
    case "completed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "error";
    default:
      return "info";
  }
};

const PaymentsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <WalletIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">USDC Balance</Typography>
                  <Typography variant="h4">
                    ${mockWalletData.balances.usdc.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <SecurityIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">In Escrow</Typography>
                  <Typography variant="h6">
                    ${mockWalletData.balances.escrowed.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <BankIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Pending Inbound</Typography>
                  <Typography variant="h6">
                    ${mockWalletData.balances.pendingInbound.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          color="primary"
        >
          Send USDC
        </Button>
        <Button
          variant="outlined"
          startIcon={<ReceiptIcon />}
        >
          Request Payment
        </Button>
        <Button
          variant="outlined"
          startIcon={<SwapIcon />}
        >
          Convert USDC
        </Button>
        <IconButton>
          <Tooltip title="Scan QR Code">
            <QrCodeIcon />
          </Tooltip>
        </IconButton>
      </Stack>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Transactions & Recurring */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockWalletData.transactions.map((tx) => (
                        <TableRow
                          key={tx.id}
                          hover
                          selected={selectedTransaction === tx.id}
                          onClick={() => setSelectedTransaction(tx.id)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{tx.date}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{tx.description}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            ${tx.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <CivilianChip
                              label={tx.status}
                              size="small"
                              color={getStatusColor(tx.status)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recurring Payments</Typography>
                <Stack spacing={2}>
                  {mockWalletData.recurringPayments.map((payment) => (
                    <Box
                      key={payment.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{payment.recipient}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${payment.amount.toLocaleString()} {payment.frequency}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Next payment: {payment.nextDate}
                      </Typography>
                      <CivilianChip
                        label={payment.status}
                        size="small"
                        color="success"
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Center Column - Sustainability & Escrow */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sustainability Rewards</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2">Carbon Credits 2024</Typography>
                    <Typography variant="h5" color="success.main">
                      +${mockWalletData.sustainabilityMetrics.carbonCredits.toLocaleString()} USDC
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Water Conservation Bonus</Typography>
                    <Typography variant="h5" color="success.main">
                      +${mockWalletData.sustainabilityMetrics.waterSavings.toLocaleString()} USDC
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {mockWalletData.sustainabilityMetrics.certifications.map((cert) => (
                      <CivilianChip
                        key={cert.name}
                        label={cert.name}
                        size="small"
                        color={cert.status === 'verified' ? 'success' : 'warning'}
                      />
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Escrow Manager</Typography>
                <Stack spacing={2}>
                  {mockWalletData.escrowDetails.map((escrow) => (
                    <Box
                      key={escrow.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{escrow.description}</Typography>
                      <Typography variant="h6">
                        ${escrow.amount.toLocaleString()} USDC
                      </Typography>
                      <Typography variant="caption" display="block">
                        Release: {escrow.releaseDate}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={escrow.progress}
                        sx={{ mt: 1 }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {escrow.conditions.map((condition, index) => (
                          <CivilianChip
                            key={index}
                            label={condition}
                            size="small"
                            color="info"
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column - Approvals & Security */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Pending Approvals</Typography>
                <Stack spacing={2}>
                  {mockWalletData.pendingApprovals.map((approval) => (
                    <Box
                      key={approval.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{approval.type}</Typography>
                      <Typography variant="h6">
                        ${approval.amount.toLocaleString()} USDC
                      </Typography>
                      <Typography variant="body2">
                        To: {approval.recipient}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="caption">
                          Signatures: {approval.signatures}/{approval.requiredSignatures}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(approval.signatures / approval.requiredSignatures) * 100}
                          sx={{ width: 100 }}
                        />
                      </Stack>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Sign & Approve
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ReceiptIcon />}
                    fullWidth
                  >
                    Generate Invoice
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DisputeIcon />}
                    fullWidth
                  >
                    Open Dispute
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MetricsIcon />}
                    fullWidth
                  >
                    Export Report
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Tooltip title="Quick Pay">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <QrCodeIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PaymentsPage; 