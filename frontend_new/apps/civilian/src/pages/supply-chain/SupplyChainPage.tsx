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
  LinearProgress,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Warning as AlertIcon,
  VerifiedUser as CertifiedIcon,
  QrCode as QrCodeIcon,
  Timeline as TimelineIcon,
  Assessment as QualityIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { CivilianChip } from '../../components/common/CivilianChip';

// Mock data for supply chain tracking
const mockSupplyChainData = {
  currentBatch: {
    id: "BATCH001",
    product: "Ethiopian Yirgacheffe - Premium",
    currentLocation: "En route to Port of Oakland",
    temperature: 12,
    distanceTraveled: 2300,
    daysInTransit: 15,
    qualityScore: 94,
    status: 'in_transit' as const,
  },
  timeline: [
    {
      id: 1,
      stage: 'harvest',
      date: "2024-02-15",
      location: "Huila, Colombia",
      details: "Harvest completed at optimal ripeness",
      temperature: 18,
      humidity: 65,
      txId: "0x1234...5678",
      completed: true,
    },
    {
      id: 2,
      stage: 'processing',
      date: "2024-02-16",
      location: "Local Mill, Colombia",
      details: "Wet processing & fermentation",
      temperature: 20,
      humidity: 70,
      txId: "0x2345...6789",
      completed: true,
    },
    {
      id: 3,
      stage: 'export',
      date: "2024-02-20",
      location: "Cartagena Port",
      details: "Customs clearance & container loading",
      temperature: 15,
      humidity: 60,
      txId: "0x3456...7890",
      completed: true,
    },
    {
      id: 4,
      stage: 'shipping',
      date: "2024-02-21",
      location: "Pacific Ocean",
      details: "Maritime transport to Oakland",
      temperature: 12,
      humidity: 55,
      txId: "0x4567...8901",
      completed: false,
    }
  ],
  qualityMetrics: {
    cuppingScore: 94,
    moisture: 9,
    flavorNotes: ["citrus", "caramel", "floral"],
    certifications: [
      { name: "Organic", status: "valid", expiry: "2025-02-20", txId: "0x5678...9012" },
      { name: "Fair Trade", status: "valid", expiry: "2025-01-15", txId: "0x6789...0123" },
      { name: "Rainforest Alliance", status: "pending", expiry: "2024-12-31", txId: "0x7890...1234" }
    ]
  },
  alerts: [
    {
      id: 1,
      type: "temperature",
      severity: "warning",
      message: "Temperature exceeded 20°C for 2 hrs during transit",
      timestamp: "2024-02-22T14:30:00Z"
    },
    {
      id: 2,
      type: "certification",
      severity: "info",
      message: "Fair Trade certification renewal due in 30 days",
      timestamp: "2024-02-22T09:15:00Z"
    }
  ],
  stakeholders: [
    {
      id: "FARM001",
      name: "Finca La Palma",
      role: "Farm",
      location: "Colombia",
      blockchainId: "0x89a...1ef2",
      rating: 5,
      deliveryRate: 98
    },
    {
      id: "SHIP001",
      name: "Maersk",
      role: "Shipper",
      blockchainId: "0x90b...2fg3",
      rating: 4.8,
      deliveryRate: 96
    }
  ]
};

const SupplyChainPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Top Stats Bar */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Current Location</Typography>
                  <Typography variant="body1">
                    {mockSupplyChainData.currentBatch.currentLocation}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    🌡️ {mockSupplyChainData.currentBatch.temperature}°C
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
                <ShippingIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Distance Traveled</Typography>
                  <Typography variant="body1">
                    {mockSupplyChainData.currentBatch.distanceTraveled.toLocaleString()} km
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mockSupplyChainData.currentBatch.daysInTransit} days in transit
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
                <QualityIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Quality Score</Typography>
                  <Typography variant="body1">
                    {mockSupplyChainData.currentBatch.qualityScore}/100
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={mockSupplyChainData.currentBatch.qualityScore} 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <CertifiedIcon color="primary" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Certifications</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {mockSupplyChainData.qualityMetrics.certifications.map((cert) => (
                      <CivilianChip
                        key={cert.name}
                        label={cert.name}
                        size="small"
                        color={cert.status === 'valid' ? 'success' : 'warning'}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Timeline & Alerts */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Supply Chain Timeline</Typography>
                <Stack spacing={2}>
                  {mockSupplyChainData.timeline.map((event, index) => (
                    <Box key={event.id}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <TimelineIcon color={event.completed ? "success" : "disabled"} />
                        <Box>
                          <Typography variant="subtitle2">{event.stage.toUpperCase()}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.date} - {event.location}
                          </Typography>
                          <Typography variant="body2">{event.details}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            TxID: {event.txId}
                          </Typography>
                        </Box>
                      </Stack>
                      {index < mockSupplyChainData.timeline.length - 1 && (
                        <Box sx={{ ml: 2.5, my: 1, borderLeft: '2px dashed', borderColor: 'divider', height: 20 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Alerts</Typography>
                <Stack spacing={2}>
                  {mockSupplyChainData.alerts.map((alert) => (
                    <Stack
                      key={alert.id}
                      direction="row"
                      spacing={1}
                      sx={{
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 1,
                        border: 1,
                        borderColor: alert.severity === 'warning' ? 'warning.main' : 'info.main',
                      }}
                    >
                      <AlertIcon color={alert.severity === 'warning' ? 'warning' : 'info'} />
                      <Box>
                        <Typography variant="body2">{alert.message}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(alert.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Center Column - Quality Metrics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quality Metrics</Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Cupping Score</Typography>
                  <Typography variant="h3" color="primary">
                    {mockSupplyChainData.qualityMetrics.cuppingScore}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">out of 100</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Moisture Content</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h4">{mockSupplyChainData.qualityMetrics.moisture}%</Typography>
                    <Typography variant="caption" color="success.main">(Ideal: 8-12%)</Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>Flavor Notes</Typography>
                  <Stack direction="row" spacing={1}>
                    {mockSupplyChainData.qualityMetrics.flavorNotes.map((note) => (
                      <CivilianChip
                        key={note}
                        label={note}
                        size="small"
                        color="info"
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Stakeholders */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Supply Chain Partners</Typography>
              <Stack spacing={2}>
                {mockSupplyChainData.stakeholders.map((partner) => (
                  <Box
                    key={partner.id}
                    sx={{
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2">{partner.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{partner.role}</Typography>
                    {partner.location && (
                      <Typography variant="body2" color="text.secondary">
                        Location: {partner.location}
                      </Typography>
                    )}
                    <Typography variant="caption" display="block">
                      Blockchain ID: {partner.blockchainId}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <CivilianChip
                        label={`${partner.rating}⭐`}
                        size="small"
                        color="success"
                      />
                      {partner.deliveryRate && (
                        <CivilianChip
                          label={`${partner.deliveryRate}% on-time`}
                          size="small"
                          color="info"
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
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
        <Tooltip title="Scan QR Code">
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

export default SupplyChainPage; 