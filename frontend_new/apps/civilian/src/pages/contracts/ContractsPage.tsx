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
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Assessment as MetricsIcon,
  Warning as AlertIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Error as ErrorIcon,
  AccountBalance as EscrowIcon,
  Gavel as DisputeIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for smart contracts
const mockContractData = {
  stats: {
    activeContracts: 12,
    escrowedValue: 250000,
    openDisputes: 2,
    autoExecutionRate: 85,
  },
  templates: [
    {
      id: "TEMP001",
      name: "Payment on Quality",
      description: "Auto-release payment when cupping score exceeds threshold",
      type: "quality_assurance",
      usageCount: 45,
    },
    {
      id: "TEMP002",
      name: "Carbon Credit Payout",
      description: "Sustainability-based compensation for farmers",
      type: "sustainability",
      usageCount: 28,
    },
    {
      id: "TEMP003",
      name: "Fair Trade Compliance",
      description: "Automated compliance checks and penalties",
      type: "compliance",
      usageCount: 32,
    },
  ],
  activeContracts: [
    {
      id: "CON001",
      name: "Ethiopia Yirgacheffe Q1 2024",
      parties: {
        from: "Yirgacheffe Cooperative",
        to: "Premium Roasters Inc",
      },
      value: 75000,
      status: "executing",
      nextTrigger: "Quality Check - Due in 2 days",
      conditions: [
        { type: "quality", metric: "cupping_score", threshold: 90 },
        { type: "shipping", metric: "temperature", threshold: 15 },
      ],
    },
    {
      id: "CON002",
      name: "Colombian Supremo March",
      parties: {
        from: "Finca La Palma",
        to: "Artisan Coffee Co",
      },
      value: 45000,
      status: "pending_approval",
      nextTrigger: "Awaiting Port Arrival",
      conditions: [
        { type: "shipping", metric: "humidity", threshold: 70 },
        { type: "certification", metric: "organic", required: true },
      ],
    },
    {
      id: "CON003",
      name: "Brazilian Santos Bulk",
      parties: {
        from: "Santos Exporters Ltd",
        to: "Global Bean Trading",
      },
      value: 120000,
      status: "disputed",
      nextTrigger: "Dispute Resolution Pending",
      conditions: [
        { type: "quality", metric: "moisture", threshold: 12 },
        { type: "shipping", metric: "delivery_time", threshold: "15_days" },
      ],
    },
  ],
  iotData: [
    {
      id: "IOT001",
      metric: "Temperature",
      value: 12,
      unit: "°C",
      status: "normal",
      contractId: "CON001",
    },
    {
      id: "IOT002",
      metric: "Humidity",
      value: 68,
      unit: "%",
      status: "warning",
      contractId: "CON002",
    },
  ],
  disputes: [
    {
      id: "DISP001",
      contractId: "CON003",
      title: "Quality Standards Not Met",
      description: "Moisture content exceeded specified threshold",
      status: "under_review",
      evidence: [
        { type: "lab_report", url: "ipfs://Qm...", timestamp: "2024-02-22T10:00:00Z" },
        { type: "sensor_data", url: "ipfs://Qm...", timestamp: "2024-02-22T10:05:00Z" },
      ],
    },
  ],
};

const getStatusColor = (status: string): "success" | "warning" | "error" | "info" => {
  switch (status) {
    case "executing":
      return "success";
    case "pending_approval":
      return "warning";
    case "disputed":
      return "error";
    default:
      return "info";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "executing":
      return <SuccessIcon color="success" />;
    case "pending_approval":
      return <PendingIcon color="warning" />;
    case "disputed":
      return <ErrorIcon color="error" />;
    default:
      return null;
  }
};

const ContractsPage: React.FC = () => {
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <MetricsIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Active Contracts</Typography>
                  <Typography variant="h6">{mockContractData.stats.activeContracts}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <EscrowIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">USDC in Escrow</Typography>
                  <Typography variant="h6">
                    ${mockContractData.stats.escrowedValue.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <DisputeIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Open Disputes</Typography>
                  <Typography variant="h6">{mockContractData.stats.openDisputes}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <SuccessIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Auto-Execution Rate</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">{mockContractData.stats.autoExecutionRate}%</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={mockContractData.stats.autoExecutionRate}
                      sx={{ width: 100, ml: 1 }}
                    />
                  </Stack>
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
          startIcon={<AddIcon />}
          color="primary"
        >
          Create Contract
        </Button>
        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
        >
          Link to Batch
        </Button>
        <IconButton>
          <Tooltip title="Scan QR Code">
            <QrCodeIcon />
          </Tooltip>
        </IconButton>
      </Stack>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Templates & Drafts */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Contract Templates</Typography>
                <Stack spacing={2}>
                  {mockContractData.templates.map((template) => (
                    <Box
                      key={template.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                    >
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <CivilianChip
                          label={template.type}
                          size="small"
                          color="info"
                        />
                        <Typography variant="caption" color="text.secondary">
                          Used {template.usageCount} times
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Center Column - Active Contracts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Contracts</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contract</TableCell>
                      <TableCell>Parties</TableCell>
                      <TableCell align="right">Value (USDC)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Next Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockContractData.activeContracts.map((contract) => (
                      <TableRow
                        key={contract.id}
                        hover
                        selected={selectedContract === contract.id}
                        onClick={() => setSelectedContract(contract.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2">{contract.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{contract.parties.from}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ➔ {contract.parties.to}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          ${contract.value.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {getStatusIcon(contract.status)}
                            <CivilianChip
                              label={contract.status}
                              size="small"
                              color={getStatusColor(contract.status)}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{contract.nextTrigger}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - IoT Data & Disputes */}
        <Grid item xs={12} md={3}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>IoT Metrics</Typography>
                <Stack spacing={2}>
                  {mockContractData.iotData.map((sensor) => (
                    <Box
                      key={sensor.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{sensor.metric}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">
                          {sensor.value}{sensor.unit}
                        </Typography>
                        <CivilianChip
                          label={sensor.status}
                          size="small"
                          color={sensor.status === 'normal' ? 'success' : 'warning'}
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Active Disputes</Typography>
                <Stack spacing={2}>
                  {mockContractData.disputes.map((dispute) => (
                    <Box
                      key={dispute.id}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">{dispute.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dispute.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <CivilianChip
                          label={dispute.status}
                          size="small"
                          color="error"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {dispute.evidence.length} pieces of evidence
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
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
        <Tooltip title="Add Contract Clause">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ContractsPage; 