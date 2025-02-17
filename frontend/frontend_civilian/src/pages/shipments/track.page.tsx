import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '@/components/common/DashboardCard';
import DashboardMetricCard from '@/components/common/DashboardMetricCard';
import { Search, Plus } from 'lucide-react';
import DashboardChartCard from '@/components/common/DashboardChartCard';
import ShipmentTable from '@/components/shipments/ShipmentTable';
import ShipmentMap from '@/components/shipments/ShipmentMap';
import { DeliveryPerformanceChart, ShipmentVolumeChart } from '@/components/charts/ShipmentCharts';
import { 
  mockPharmaceuticalShipments,
  getActiveShipments,
  getShipmentsByStatus,
  PharmaceuticalShipment 
} from '@/mocks/api/pharmaceuticals-shipments.mock';

const TrackShipments: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Get metrics
  const activeShipments = getActiveShipments();
  const delayedShipments = getShipmentsByStatus('Delayed');
  const deliveredToday = getShipmentsByStatus('Delivered').filter(shipment => {
    const today = new Date();
    const deliveryDate = new Date(shipment.actualArrival || '');
    return (
      deliveryDate.getDate() === today.getDate() &&
      deliveryDate.getMonth() === today.getMonth() &&
      deliveryDate.getFullYear() === today.getFullYear()
    );
  });

  // Filter shipments based on search query
  const filteredShipments = searchQuery
    ? mockPharmaceuticalShipments.filter(shipment => {
        const searchLower = searchQuery.toLowerCase();
        return (
          shipment.referenceNumber.toLowerCase().includes(searchLower) ||
          shipment.carrier.name.toLowerCase().includes(searchLower) ||
          shipment.priority.toLowerCase().includes(searchLower) ||
          shipment.status.toLowerCase().includes(searchLower) ||
          shipment.items.some(item => item.batchNumber.toLowerCase().includes(searchLower))
        );
      })
    : mockPharmaceuticalShipments;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Track Shipments
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder="Enter shipment reference, carrier, or batch number"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search size={20} style={{ marginRight: 8, opacity: 0.5 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            }
          }}
        />
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => navigate('/shipments/create')}
        >
          Create Shipment
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Shipment Metrics */}
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Active Shipments"
            value={activeShipments.length.toString()}
            trend={{
              value: 12,
              isUpward: true,
              label: "from last week"
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Delayed Shipments"
            value={delayedShipments.length.toString()}
            trend={{
              value: 1,
              isUpward: false,
              label: "from yesterday"
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardMetricCard
            title="Completed Today"
            value={deliveredToday.length.toString()}
            trend={{
              value: 20,
              isUpward: true,
              label: "vs. average"
            }}
          />
        </Grid>

        {/* Shipment Map */}
        <Grid item xs={12}>
          <DashboardCard 
            title="Live Shipment Tracking"
            subtitle={`${activeShipments.length} Active Shipments`}
            minHeight={400}
            loading={loading}
          >
            {!loading && <ShipmentMap shipments={filteredShipments} />}
          </DashboardCard>
        </Grid>

        {/* Shipment Analytics */}
        <Grid item xs={12} md={6}>
          <DashboardChartCard
            title="Delivery Performance"
            subtitle="Status Distribution"
            chart={<DeliveryPerformanceChart shipments={filteredShipments} />}
            minHeight={400}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardChartCard
            title="Shipment Volume"
            subtitle="Shipments and Items Over Time"
            chart={<ShipmentVolumeChart shipments={filteredShipments} />}
            minHeight={400}
          />
        </Grid>

      {/* Shipments Table */}
      <Grid item xs={12}>
        <DashboardCard 
          title="Shipments"
          minHeight={500}
        >
            <ShipmentTable
              shipments={filteredShipments}
              loading={loading}
              onMarkDelivered={(ids) => console.log('Mark delivered:', ids)}
              onMarkDelayed={(ids) => console.log('Mark delayed:', ids)}
              onCancel={(ids) => console.log('Cancel:', ids)}
              onTrack={(ids) => console.log('Track:', ids)}
              onExport={(ids) => console.log('Export:', ids)}
              onShare={(ids) => console.log('Share:', ids)}
            />
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrackShipments;
