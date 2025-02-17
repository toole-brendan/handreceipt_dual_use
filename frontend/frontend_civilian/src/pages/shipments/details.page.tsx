import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Truck,
  Package,
  History,
  FileText,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';
import DashboardCard from '@/components/common/DashboardCard';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import ShipmentTimeline from '@/components/shipments/ShipmentTimeline';
import ShipmentMap from '@/components/shipments/ShipmentMap';
import { getShipmentById } from '@/mocks/api/pharmaceuticals-shipments.mock';
import { createShipmentTimelineEvents } from '@/components/shipments/shipmentTimelineUtils';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`shipment-tabpanel-${index}`}
      aria-labelledby={`shipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'In Transit':
      return 'info';
    case 'Preparing':
      return 'warning';
    case 'Delayed':
      return 'error';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'error';
    case 'Express':
      return 'warning';
    case 'Standard':
      return 'info';
    default:
      return 'default';
  }
};

const ShipmentDetails: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipment = getShipmentById(id);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setError(null);
      setLoading(true);

      // In a real app, this would be an API call to update the shipment status
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh the page or update the shipment data
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!shipment) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Shipment Not Found</Typography>
      </Box>
    );
  }

  const latestCondition = shipment.conditions[shipment.conditions.length - 1];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4">
            Shipment {shipment.referenceNumber}
          </Typography>
          <BlockchainBadge
            transactionHash={shipment.blockchainData.transactionHash}
            timestamp={shipment.blockchainData.timestamp}
            status={shipment.blockchainData.verified ? 'Blockchain Verified' : 'Unverified'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={shipment.status}
            color={getStatusColor(shipment.status)}
            size="small"
          />
          <Chip
            label={shipment.priority}
            color={getPriorityColor(shipment.priority)}
            size="small"
          />
          <Chip
            label={shipment.type}
            variant="outlined"
            size="small"
          />
          {latestCondition?.status !== 'Normal' && (
            <Chip
              icon={<AlertTriangle size={16} />}
              label={latestCondition?.status}
              color={latestCondition?.status === 'Warning' ? 'warning' : 'error'}
              size="small"
            />
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        {shipment.status === 'In Transit' && (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle size={20} />}
              onClick={() => handleStatusChange('Delivered')}
              disabled={loading}
            >
              Mark Delivered
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<AlertTriangle size={20} />}
              onClick={() => handleStatusChange('Delayed')}
              disabled={loading}
            >
              Mark Delayed
            </Button>
          </>
        )}
        {(shipment.status === 'Preparing' || shipment.status === 'Delayed') && (
          <Button
            variant="contained"
            color="error"
            startIcon={<XCircle size={20} />}
            onClick={() => handleStatusChange('Cancelled')}
            disabled={loading}
          >
            Cancel Shipment
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<Download size={20} />}
          onClick={() => console.log('Export')}
        >
          Export
        </Button>
        <Button
          variant="outlined"
          startIcon={<Share2 size={20} />}
          onClick={() => console.log('Share')}
        >
          Share
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab icon={<Package size={16} />} label="Overview" />
          <Tab icon={<MapPin size={16} />} label="Location" />
          <Tab icon={<History size={16} />} label="Timeline" />
          <Tab icon={<FileText size={16} />} label="Documents" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={selectedTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Shipment Details */}
            <DashboardCard title="Shipment Details">
              <Box sx={{ p: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      From Location
                    </Typography>
                    <Typography variant="body1">
                      {shipment.fromLocationId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      To Location
                    </Typography>
                    <Typography variant="body1">
                      {shipment.toLocationId}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Departure
                    </Typography>
                    <Typography variant="body1">
                      {new Date(shipment.expectedDeparture).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expected Arrival
                    </Typography>
                    <Typography variant="body1">
                      {new Date(shipment.expectedArrival).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DashboardCard>

            {/* Items */}
            <Box sx={{ mt: 3 }}>
              <DashboardCard title="Items">
                <Box sx={{ p: 2 }}>
                  {shipment.items.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Product ID
                          </Typography>
                          <Typography variant="body1">
                            {item.productId}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Batch Number
                          </Typography>
                          <Typography variant="body1">
                            {item.batchNumber}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Quantity
                          </Typography>
                          <Typography variant="body1">
                            {item.quantity} {item.unit}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              </DashboardCard>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            {/* Carrier Information */}
            <DashboardCard title="Carrier Information">
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Carrier
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {shipment.carrier.name}
                </Typography>

                {shipment.carrier.trackingNumber && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tracking Number
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {shipment.carrier.trackingNumber}
                    </Typography>
                  </>
                )}

                {shipment.carrier.vehicleId && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vehicle ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {shipment.carrier.vehicleId}
                    </Typography>
                  </>
                )}

                {shipment.carrier.driverName && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">
                      Driver
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {shipment.carrier.driverName}
                    </Typography>
                  </>
                )}
              </Box>
            </DashboardCard>

            {/* Environmental Requirements */}
            <Box sx={{ mt: 3 }}>
              <DashboardCard title="Environmental Requirements">
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Temperature Range
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {shipment.temperature.min}°{shipment.temperature.unit} - {shipment.temperature.max}°{shipment.temperature.unit}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Humidity Range
                  </Typography>
                  <Typography variant="body1">
                    {shipment.humidity.min}% - {shipment.humidity.max}%
                  </Typography>
                </Box>
              </DashboardCard>
            </Box>

            {/* Current Conditions */}
            {latestCondition && (
              <Box sx={{ mt: 3 }}>
                <DashboardCard title="Current Conditions">
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Temperature
                    </Typography>
                    <Typography
                      variant="body1"
                      color={
                        latestCondition.status === 'Warning' || latestCondition.status === 'Critical'
                          ? 'error.main'
                          : 'text.primary'
                      }
                      gutterBottom
                    >
                      {latestCondition.temperature}°{shipment.temperature.unit}
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      Humidity
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {latestCondition.humidity}%
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {new Date(latestCondition.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </DashboardCard>
              </Box>
            )}
          </Grid>
        </Grid>
      </TabPanel>

      {/* Location Tab */}
      <TabPanel value={selectedTab} index={1}>
        <DashboardCard title="Live Location">
          <Box sx={{ height: 500 }}>
            <ShipmentMap shipments={[shipment]} />
          </Box>
        </DashboardCard>
      </TabPanel>

      {/* Timeline Tab */}
      <TabPanel value={selectedTab} index={2}>
        <DashboardCard title="Shipment Journey">
          <Box sx={{ p: 2 }}>
            <ShipmentTimeline
              events={createShipmentTimelineEvents(shipment)}
              onEventClick={(event) => {
                console.log('Event clicked:', event);
              }}
              onLocationClick={(location) => {
                setSelectedTab(1); // Switch to Location tab
              }}
              onDocumentClick={(document) => {
                if (document?.url) {
                  window.open(document.url, '_blank');
                }
              }}
            />
          </Box>
        </DashboardCard>
      </TabPanel>

      {/* Documents Tab */}
      <TabPanel value={selectedTab} index={3}>
        <DashboardCard title="Associated Documents">
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {shipment.documents.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <FileText size={24} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">
                        {doc.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doc.type}
                      </Typography>
                    </Box>
                    <Tooltip title="View Document">
                      <IconButton
                        size="small"
                        onClick={() => window.open(doc.url, '_blank')}
                      >
                        <FileText size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DashboardCard>
      </TabPanel>
    </Box>
  );
};

export default ShipmentDetails;
