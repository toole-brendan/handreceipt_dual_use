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
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Schedule as ScheduleIcon,
  FileDownload as ExportIcon,
  CalendarToday as DateIcon,
  FilterList as FilterIcon,
  Park as SustainabilityIcon,
  AccountBalance as FinanceIcon,
  LocalShipping as ShippingIcon,
  Star as QualityIcon,
  CheckCircle as VerifiedIcon,
  Insights as InsightsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for reports
const mockReportData = {
  sustainability: {
    carbonFootprint: {
      current: 2.5,
      industry: 4.2,
      unit: 'kg CO2/kg coffee',
      trend: -15,
    },
    waterSavings: {
      amount: 12000,
      unit: 'liters',
      year: 2024,
      carbonCredits: 2300,
    },
    certifications: [
      {
        name: 'Fair Trade',
        status: 'active',
        expiry: '2025-03-15',
        compliance: 98,
      },
      {
        name: 'Organic',
        status: 'active',
        expiry: '2025-01-20',
        compliance: 100,
      },
      {
        name: 'Rainforest Alliance',
        status: 'pending',
        expiry: '2024-12-31',
        compliance: 92,
      },
    ],
  },
  financial: {
    cashFlow: {
      inbound: 450000,
      outbound: 320000,
      blockchainSavings: 2100,
    },
    costs: [
      { category: 'Logistics', percentage: 32 },
      { category: 'Farming', percentage: 45 },
      { category: 'Certifications', percentage: 8 },
      { category: 'Overhead', percentage: 15 },
    ],
    smartContracts: {
      autoExecuted: 85,
      totalValue: 780000,
    },
  },
  supplyChain: {
    leadTimes: {
      current: 18,
      previous: 26,
      unit: 'days',
    },
    disputes: {
      rate: 0.5,
      industryAvg: 4.2,
      resolved: 95,
    },
    carriers: [
      {
        name: 'Ocean Freight Co',
        onTime: 94,
        penalties: 500,
      },
      {
        name: 'Local Transport Ltd',
        onTime: 89,
        penalties: 1200,
      },
    ],
  },
  quality: {
    cuppingScores: [
      { batch: 'Ethiopia Q1', score: 92 },
      { batch: 'Colombia Q1', score: 88 },
      { batch: 'Brazil Q1', score: 85 },
    ],
    flavors: [
      { name: 'Citrus', percentage: 35 },
      { name: 'Caramel', percentage: 28 },
      { name: 'Floral', percentage: 22 },
    ],
    retention: {
      repeatBuyers: 72,
      blockchainVerified: 85,
    },
  },
};

const ReportsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [timeframe, setTimeframe] = useState('ytd');

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Action Bar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          select
          size="small"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          SelectProps={{
            native: true,
          }}
          sx={{ width: 150 }}
        >
          <option value="ytd">Year to Date</option>
          <option value="harvest">Last Harvest</option>
          <option value="quarter">Last Quarter</option>
          <option value="custom">Custom Range</option>
        </TextField>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
        >
          Add Filters
        </Button>
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
        >
          Schedule Report
        </Button>
        <Button
          variant="contained"
          startIcon={<ExportIcon />}
        >
          Export
        </Button>
      </Stack>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Sustainability Quadrant */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <SustainabilityIcon color="primary" />
                <Typography variant="h6">Sustainability & Ethics</Typography>
              </Stack>
              
              <Stack spacing={3}>
                {/* Carbon Footprint */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Carbon Footprint</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4" color="success.main">
                      {mockReportData.sustainability.carbonFootprint.current}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      kg CO2/kg coffee
                    </Typography>
                    <CivilianChip
                      label={`${mockReportData.sustainability.carbonFootprint.trend}% vs Last Year`}
                      color="success"
                      size="small"
                    />
                  </Stack>
                </Box>

                {/* Water Savings */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Water Conservation</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4" color="primary">
                      {mockReportData.sustainability.waterSavings.amount.toLocaleString()}L
                    </Typography>
                    <Stack>
                      <Typography variant="caption" color="success.main">
                        +${mockReportData.sustainability.waterSavings.carbonCredits} USDC Credits
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Certifications */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Certification Status</Typography>
                  <Stack direction="row" spacing={1}>
                    {mockReportData.sustainability.certifications.map((cert) => (
                      <CivilianChip
                        key={cert.name}
                        label={`${cert.name} ${cert.compliance}%`}
                        color={cert.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Performance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <FinanceIcon color="primary" />
                <Typography variant="h6">Financial Performance</Typography>
              </Stack>

              <Stack spacing={3}>
                {/* Cash Flow */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>USDC Cash Flow</Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Inbound</Typography>
                      <Typography>${mockReportData.financial.cashFlow.inbound.toLocaleString()}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography>Outbound</Typography>
                      <Typography>${mockReportData.financial.cashFlow.outbound.toLocaleString()}</Typography>
                    </Stack>
                    <Typography variant="caption" color="success.main">
                      Blockchain Fee Savings: ${mockReportData.financial.cashFlow.blockchainSavings}/mo
                    </Typography>
                  </Stack>
                </Box>

                {/* Cost Breakdown */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Cost Distribution</Typography>
                  <Stack spacing={1}>
                    {mockReportData.financial.costs.map((cost) => (
                      <Box key={cost.category}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{cost.category}</Typography>
                          <Typography variant="body2">{cost.percentage}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={cost.percentage}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Smart Contract Stats */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Smart Contract Performance</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4">
                      {mockReportData.financial.smartContracts.autoExecuted}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Auto-Executed
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Supply Chain Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <ShippingIcon color="primary" />
                <Typography variant="h6">Supply Chain Metrics</Typography>
              </Stack>

              <Stack spacing={3}>
                {/* Lead Times */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Lead Time Analysis</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4">
                      {mockReportData.supplyChain.leadTimes.current}
                    </Typography>
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        days (avg)
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        -{mockReportData.supplyChain.leadTimes.previous - mockReportData.supplyChain.leadTimes.current} days vs 2023
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Disputes */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Dispute Rate</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4" color="success.main">
                      {mockReportData.supplyChain.disputes.rate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      vs Industry {mockReportData.supplyChain.disputes.industryAvg}%
                    </Typography>
                  </Stack>
                </Box>

                {/* Carrier Performance */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Carrier Performance</Typography>
                  <Stack spacing={2}>
                    {mockReportData.supplyChain.carriers.map((carrier) => (
                      <Box key={carrier.name}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{carrier.name}</Typography>
                          <CivilianChip
                            label={`${carrier.onTime}% On-Time`}
                            color={carrier.onTime >= 90 ? 'success' : 'warning'}
                            size="small"
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Quality Insights */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <QualityIcon color="primary" />
                <Typography variant="h6">Quality & Customer Insights</Typography>
              </Stack>

              <Stack spacing={3}>
                {/* Cupping Scores */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Cupping Score Analysis</Typography>
                  <Stack spacing={2}>
                    {mockReportData.quality.cuppingScores.map((batch) => (
                      <Box key={batch.batch}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">{batch.batch}</Typography>
                          <Typography variant="body2">{batch.score} pts</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={batch.score}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Flavor Profile */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Top Flavor Notes</Typography>
                  <Stack direction="row" spacing={1}>
                    {mockReportData.quality.flavors.map((flavor) => (
                      <CivilianChip
                        key={flavor.name}
                        label={`${flavor.name} ${flavor.percentage}%`}
                        color="info"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Customer Retention */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Customer Retention</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4">
                      {mockReportData.quality.retention.repeatBuyers}%
                    </Typography>
                    <Stack>
                      <Typography variant="body2" color="text.secondary">
                        Repeat Buyers
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {mockReportData.quality.retention.blockchainVerified}% Blockchain Verified
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
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
        <Tooltip title="AI Insights">
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <InsightsIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ReportsPage; 