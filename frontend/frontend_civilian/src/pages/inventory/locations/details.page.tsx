import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit,
  History,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Shield,
  Building2,
} from 'lucide-react';
import { getLocationById } from '@/mocks/api/pharmaceuticals-locations.mock';
import { getLocationEnvironmentalStatus, getLocationCapacityStatus } from '@/components/locations/locationUtils';
import DashboardCard from '@/components/common/DashboardCard';
import { ROUTES } from '@/constants/routes';

// Mock blockchain transactions for the location
const getMockTransactions = (locationId: string) => [
  {
    id: 'tx1',
    type: 'CREATE_LOCATION',
    timestamp: '2024-01-15T10:00:00Z',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    data: {
      action: 'Location created',
      details: 'Initial location registration',
    },
  },
  {
    id: 'tx2',
    type: 'UPDATE_LOCATION',
    timestamp: '2024-01-20T14:30:00Z',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    data: {
      action: 'Status updated',
      details: 'Changed status to Operational',
    },
  },
  {
    id: 'tx3',
    type: 'ENVIRONMENTAL_ALERT',
    timestamp: '2024-02-01T08:15:00Z',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    data: {
      action: 'Temperature excursion detected',
      details: 'Temperature exceeded maximum threshold',
    },
  },
];

// Mock inventory data for the location
const getMockInventory = () => [
  {
    id: 'prod1',
    name: 'Product A',
    quantity: 1000,
    unit: 'units',
    status: 'In Stock',
  },
  {
    id: 'prod2',
    name: 'Product B',
    quantity: 500,
    unit: 'kg',
    status: 'Low Stock',
  },
  {
    id: 'prod3',
    name: 'Product C',
    quantity: 0,
    unit: 'units',
    status: 'Out of Stock',
  },
];

// Mock shipment data for the location
const getMockShipments = () => [
  {
    id: 'ship1',
    type: 'Inbound',
    status: 'In Transit',
    origin: 'Warehouse A',
    destination: 'Current Location',
    estimatedArrival: '2024-02-15T15:00:00Z',
  },
  {
    id: 'ship2',
    type: 'Outbound',
    status: 'Scheduled',
    origin: 'Current Location',
    destination: 'Distribution Center B',
    estimatedDeparture: '2024-02-16T10:00:00Z',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const LocationDetailsPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const location = useMemo(() => getLocationById(id), [id]);
  const transactions = useMemo(() => getMockTransactions(id), [id]);
  const inventory = useMemo(() => getMockInventory(), []);
  const shipments = useMemo(() => getMockShipments(), []);

  if (!location) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Location not found. The location you're trying to view may have been deleted or moved.
        </Alert>
      </Box>
    );
  }

  const environmentalStatus = useMemo(
    () => getLocationEnvironmentalStatus(location),
    [location]
  );

  const capacityStatus = useMemo(
    () => getLocationCapacityStatus(location.capacity.used, location.capacity.total),
    [location]
  );

  const handleEdit = () => {
    navigate(`${ROUTES.INVENTORY.LOCATIONS.EDIT.replace(':id', id)}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {location.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={location.status === 'Operational' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              label={location.status}
              color={location.status === 'Operational' ? 'success' : 'error'}
            />
            <Chip
              icon={<Building2 size={16} />}
              label={location.type}
              variant="outlined"
            />
            <Chip
              icon={<Shield size={16} />}
              label={`Security: ${location.securityLevel}`}
              color={location.securityLevel === 'High' ? 'error' : 'warning'}
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit size={20} />}
          onClick={handleEdit}
        >
          Edit Location
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Capacity">
            <Box sx={{ p: 2 }}>
              <Typography variant="h3" gutterBottom>
                {Math.round((location.capacity.used / location.capacity.total) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {location.capacity.used} / {location.capacity.total} {location.capacity.unit}
              </Typography>
              <Chip
                label={`${capacityStatus.charAt(0).toUpperCase() + capacityStatus.slice(1)} Utilization`}
                color={capacityStatus === 'high' ? 'error' : capacityStatus === 'medium' ? 'warning' : 'success'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Temperature">
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Thermometer size={20} />
                <Typography variant="h3">
                  {location.temperature.current}°{location.temperature.unit}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Range: {location.temperature.min}° - {location.temperature.max}°{location.temperature.unit}
              </Typography>
              <Chip
                label={environmentalStatus === 'normal' ? 'Within Range' : 'Out of Range'}
                color={environmentalStatus === 'normal' ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Humidity">
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Droplets size={20} />
                <Typography variant="h3">
                  {location.humidity.current}{location.humidity.unit}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Range: {location.humidity.min} - {location.humidity.max}{location.humidity.unit}
              </Typography>
              <Chip
                label={environmentalStatus === 'normal' ? 'Within Range' : 'Out of Range'}
                color={environmentalStatus === 'normal' ? 'success' : 'error'}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Inventory" icon={<Package size={20} />} iconPosition="start" />
          <Tab label="Shipments" icon={<Truck size={20} />} iconPosition="start" />
          <Tab label="Blockchain History" icon={<History size={20} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Inventory Tab */}
      <TabPanel value={activeTab} index={0}>
        <List>
          {inventory.map((item) => (
            <React.Fragment key={item.id}>
              <ListItem>
                <ListItemIcon>
                  <Package size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  secondary={`${item.quantity} ${item.unit}`}
                />
                <Chip
                  label={item.status}
                  color={
                    item.status === 'In Stock'
                      ? 'success'
                      : item.status === 'Low Stock'
                      ? 'warning'
                      : 'error'
                  }
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* Shipments Tab */}
      <TabPanel value={activeTab} index={1}>
        <List>
          {shipments.map((shipment) => (
            <React.Fragment key={shipment.id}>
              <ListItem>
                <ListItemIcon>
                  <Truck size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={`${shipment.type} Shipment: ${shipment.origin} → ${shipment.destination}`}
                  secondary={
                    shipment.type === 'Inbound'
                      ? `Estimated Arrival: ${new Date(shipment.estimatedArrival!).toLocaleString()}`
                      : `Estimated Departure: ${new Date(shipment.estimatedDeparture!).toLocaleString()}`
                  }
                />
                <Chip
                  label={shipment.status}
                  color={shipment.status === 'In Transit' ? 'warning' : 'info'}
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* Blockchain History Tab */}
      <TabPanel value={activeTab} index={2}>
        <List>
          {transactions.map((tx: {
    id: string;
    type: string;
    timestamp: string;
    hash: string;
    data: {
      action: string;
      details: string;
    };
  }) => (
            <React.Fragment key={tx.id}>
              <ListItem>
                <ListItemIcon>
                  <History size={20} />
                </ListItemIcon>
                <ListItemText
                  primary={tx.data.action}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {tx.data.details}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tx.timestamp).toLocaleString()}
                      </Typography>
                      <br />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        Transaction Hash: {tx.hash}
                      </Typography>
                    </>
                  }
                />
                <Chip
                  label={tx.type}
                  color={
                    tx.type === 'ENVIRONMENTAL_ALERT'
                      ? 'error'
                      : tx.type === 'UPDATE_LOCATION'
                      ? 'warning'
                      : 'info'
                  }
                  size="small"
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </TabPanel>
    </Box>
  );
};

export default LocationDetailsPage;
