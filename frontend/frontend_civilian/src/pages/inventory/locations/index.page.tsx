import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Plus, Search, Filter } from 'lucide-react';
import LocationCard from '@/components/locations/LocationCard';
import { 
  mockPharmaceuticalLocations,
  PharmaceuticalLocation,
} from '@/mocks/api/pharmaceuticals-locations.mock';
import { ROUTES } from '@/constants/routes';

type LocationType = PharmaceuticalLocation['type'];
type LocationStatus = PharmaceuticalLocation['status'];

const LOCATION_TYPES: LocationType[] = [
  'Manufacturing Plant',
  'Warehouse',
  'Quality Control Lab',
  'Distribution Center',
];

const LOCATION_STATUSES: LocationStatus[] = [
  'Operational',
  'Maintenance',
  'Shutdown',
  'Alert',
];

const LocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<LocationType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<LocationStatus | 'all'>('all');

  // Filter locations based on search query and filters
  const filteredLocations = useMemo(() => {
    return mockPharmaceuticalLocations.filter(location => {
      const matchesSearch = 
        searchQuery === '' ||
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = 
        selectedType === 'all' || 
        location.type === selectedType;

      const matchesStatus = 
        selectedStatus === 'all' || 
        location.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    const total = filteredLocations.length;
    const byStatus = LOCATION_STATUSES.reduce((acc, status) => {
      acc[status] = filteredLocations.filter(loc => loc.status === status).length;
      return acc;
    }, {} as Record<LocationStatus, number>);

    const totalCapacity = filteredLocations.reduce((sum, loc) => sum + loc.capacity.total, 0);
    const usedCapacity = filteredLocations.reduce((sum, loc) => sum + loc.capacity.used, 0);
    const capacityUtilization = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

    return {
      total,
      byStatus,
      capacityUtilization,
    };
  }, [filteredLocations]);

  const handleEdit = (location: PharmaceuticalLocation) => {
    navigate(`${ROUTES.INVENTORY.LOCATIONS.EDIT.replace(':id', location.id)}`);
  };

  const handleViewDetails = (location: PharmaceuticalLocation) => {
    navigate(`${ROUTES.INVENTORY.LOCATIONS.DETAILS.replace(':id', location.id)}`);
  };

  const handleAddLocation = () => {
    navigate(ROUTES.INVENTORY.LOCATIONS.ADD);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Locations ({statistics.total})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
      </Box>

      {/* Summary Statistics */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Operational
            </Typography>
            <Typography variant="h6">
              {statistics.byStatus.Operational} locations
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Under Maintenance
            </Typography>
            <Typography variant="h6">
              {statistics.byStatus.Maintenance} locations
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Alerts
            </Typography>
            <Typography variant="h6" color="error.main">
              {statistics.byStatus.Alert} locations
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Average Capacity Utilization
            </Typography>
            <Typography variant="h6">
              {statistics.capacityUtilization.toFixed(1)}%
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as LocationType | 'all')}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={20} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="all">All Types</MenuItem>
          {LOCATION_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as LocationStatus | 'all')}
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={20} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="all">All Statuses</MenuItem>
          {LOCATION_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Location Cards */}
      <Grid container spacing={3}>
        {filteredLocations.map((location) => (
          <Grid item xs={12} md={6} lg={4} key={location.id}>
            <LocationCard
              location={location}
              onEdit={handleEdit}
            onClick={handleViewDetails}
            />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            No locations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LocationsPage;
